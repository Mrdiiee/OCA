import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const STATUS_MAP = {
  settlement: "paid",
  capture: "paid",
  pending: "pending_payment",
  deny: "cancelled",
  cancel: "cancelled",
  expire: "cancelled",
  failure: "cancelled",
};

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, transaction_status, status_code, gross_amount, signature_key } = body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey || !order_id || !transaction_status || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json({ error: "Notifikasi Midtrans tidak lengkap." }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      return NextResponse.json({ error: "Signature tidak valid." }, { status: 401 });
    }

    const nextStatus = STATUS_MAP[transaction_status];
    if (!nextStatus) return NextResponse.json({ ok: true, ignored: true });

    const supabase = getAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, total_amount")
      .eq("order_number", order_id)
      .maybeSingle();

    if (orderError) {
      console.error("Gagal mencari order Midtrans:", orderError);
      return NextResponse.json({ error: "Gagal membaca pesanan." }, { status: 500 });
    }

    if (!order) return NextResponse.json({ ok: true, ignored: true });

    if (order.total_amount !== null && Number(order.total_amount) !== Number(gross_amount)) {
      return NextResponse.json({ error: "Nominal transaksi tidak sesuai." }, { status: 400 });
    }

    if (order.status === nextStatus) return NextResponse.json({ ok: true, unchanged: true });

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (updateError) {
      console.error("Gagal memperbarui status order:", updateError);
      return NextResponse.json({ error: "Gagal memperbarui status pesanan." }, { status: 500 });
    }

    const descriptions = {
      paid: "Pembayaran telah berhasil dikonfirmasi.",
      pending_payment: "Pembayaran masih menunggu konfirmasi.",
      cancelled: "Transaksi dibatalkan atau pembayaran kedaluwarsa.",
    };

    const { error: eventError } = await supabase.from("order_tracking_events").insert({
      order_id: order.id,
      status: nextStatus,
      description: descriptions[nextStatus] || `Status pembayaran: ${transaction_status}.`,
    });

    if (eventError) console.error("Gagal menyimpan event pembayaran:", eventError);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Gagal memproses notifikasi Midtrans." }, { status: 500 });
  }
}
