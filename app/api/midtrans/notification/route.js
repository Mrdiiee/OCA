import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function isSuccessfulPayment(body) {
  if (body.transaction_status === "settlement") return true;
  return body.transaction_status === "capture" && body.payment_type === "credit_card" && body.fraud_status === "accept";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      order_id,
      transaction_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
      payment_type,
      fraud_status,
      settlement_time,
    } = body;
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

    if (isSuccessfulPayment(body) && status_code !== "200") {
      return NextResponse.json({ error: "Status pembayaran tidak valid." }, { status: 400 });
    }

    if (isSuccessfulPayment(body) && transaction_status === "capture" && fraud_status !== "accept") {
      return NextResponse.json({ error: "Pembayaran kartu belum lolos verifikasi fraud." }, { status: 400 });
    }

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

    const paidAt = settlement_time ? new Date(settlement_time.replace(" ", "T") + "+07:00") : new Date();
    const { data: result, error: processError } = await supabase.rpc("process_midtrans_payment", {
      p_order_number: order_id,
      p_transaction_id: transaction_id || null,
      p_transaction_status: transaction_status,
      p_payment_type: payment_type || null,
      p_paid_at: isSuccessfulPayment(body) ? paidAt.toISOString() : null,
    });

    if (processError) {
      console.error("Gagal memproses pembayaran Midtrans:", processError);
      const stockError = processError.message?.includes("INSUFFICIENT_STOCK");
      const productError = processError.message?.includes("PRODUCT_NOT_FOUND");
      if (stockError) return NextResponse.json({ error: "Stok produk tidak mencukupi untuk pesanan ini." }, { status: 409 });
      if (productError) return NextResponse.json({ error: "Produk pesanan tidak tersedia." }, { status: 409 });
      return NextResponse.json({ error: "Gagal memproses pembayaran." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Gagal memproses notifikasi Midtrans." }, { status: 500 });
  }
}
