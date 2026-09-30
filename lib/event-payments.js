const EVENT_PAYMENT_KEY = /^event-registration:([0-9a-f-]{36}):([0-9a-f-]{36})$/i;

export function getEventRegistrationId(order) {
  const match = String(order?.checkout_idempotency_key || "").match(EVENT_PAYMENT_KEY);
  return match?.[1] || null;
}

export function isEventPaymentOrder(order) {
  return Boolean(getEventRegistrationId(order));
}

function isSuccessfulPayment(body) {
  return body.transaction_status === "settlement" ||
    (body.transaction_status === "capture" && body.payment_type === "credit_card" && body.fraud_status === "accept");
}

function toPaymentStatus(body) {
  if (isSuccessfulPayment(body)) return "paid";
  if (body.transaction_status === "capture" && body.payment_type === "credit_card") return "failed";
  const statusMap = {
    pending: "pending",
    deny: "failed",
    failure: "failed",
    cancel: "cancelled",
    expire: "expired",
    authorize: "authorized",
    refund: "refunded",
    partial_refund: "partially_refunded",
  };
  return statusMap[body.transaction_status] || "pending";
}

function getPaidAt(settlementTime) {
  if (!settlementTime) return new Date().toISOString();
  const raw = String(settlementTime);
  const parsed = new Date(raw.includes("T") ? raw : `${raw.replace(" ", "T")}+07:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function applyEventPaymentStatus(admin, order, body) {
  const registrationId = getEventRegistrationId(order);
  if (!registrationId) return { error: "Order event tidak valid.", httpStatus: 400 };
  if (body.order_id !== order.order_number) return { error: "Order ID Midtrans tidak sesuai.", httpStatus: 409 };
  if (!Number.isFinite(Number(body.gross_amount)) || Number(order.total_amount) !== Number(body.gross_amount)) {
    return { error: "Nominal transaksi tidak sesuai.", httpStatus: 409 };
  }
  if (order.midtrans_transaction_id && body.transaction_id && order.midtrans_transaction_id !== body.transaction_id) {
    return { error: "Transaction ID tidak sesuai dengan pesanan.", httpStatus: 409 };
  }

  const successful = isSuccessfulPayment(body);
  if (successful && !body.transaction_id) return { error: "Transaction ID Midtrans tidak tersedia.", httpStatus: 409 };
  const alreadyPaid = order.status === "paid" || order.payment_status === "paid";
  const refundNotification = ["refund", "partial_refund"].includes(body.transaction_status);
  const nextStatus = alreadyPaid && !refundNotification ? "paid" : toPaymentStatus(body);
  const paidAt = successful ? getPaidAt(body.settlement_time) : null;
  if (successful && !paidAt) return { error: "Waktu settlement tidak valid.", httpStatus: 409 };

  if (!alreadyPaid || successful || refundNotification) {
    const patch = {
      payment_status: nextStatus,
      payment_type: body.payment_type || null,
      midtrans_transaction_id: body.transaction_id || order.midtrans_transaction_id || null,
      ...(successful ? { status: "paid", paid_at: paidAt } : {}),
      updated_at: new Date().toISOString(),
    };
    const { error } = await admin.from("orders").update(patch).eq("id", order.id);
    if (error) {
      console.error("Gagal memperbarui pembayaran event:", error);
      return { error: "Status pembayaran event gagal diperbarui.", httpStatus: 500 };
    }
  }

  if (successful) {
    const { error } = await admin
      .from("event_registrations")
      .update({ status: "confirmed", updated_at: paidAt })
      .eq("id", registrationId)
      .eq("user_id", order.user_id)
      .eq("status", "pending");
    if (error) {
      console.error("Gagal mengonfirmasi peserta event:", error);
      return { error: "Pembayaran diterima, tetapi status peserta gagal diperbarui.", httpStatus: 500 };
    }
  } else if (["failed", "expired", "cancelled"].includes(nextStatus) && !alreadyPaid) {
    const { data: latestOrder, error: latestError } = await admin
      .from("orders")
      .select("order_number")
      .eq("user_id", order.user_id)
      .like("checkout_idempotency_key", `event-registration:${registrationId}:%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestError) {
      console.error("Gagal memeriksa percobaan pembayaran event terbaru:", latestError);
      return { error: "Status percobaan pembayaran event gagal diperiksa.", httpStatus: 500 };
    }
    if (latestOrder?.order_number === order.order_number) {
      const { error } = await admin
        .from("event_registrations")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", registrationId)
        .eq("user_id", order.user_id)
        .eq("status", "pending");
      if (error) {
        console.error("Gagal melepas kuota event setelah pembayaran berakhir:", error);
        return { error: "Kuota event belum dapat diperbarui setelah pembayaran berakhir.", httpStatus: 500 };
      }
    }
  }

  return { status: nextStatus, result: { registrationId, paid: nextStatus === "paid" } };
}
