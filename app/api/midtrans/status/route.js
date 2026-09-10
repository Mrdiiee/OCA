import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "../../../../lib/supabase-server";

const MIDTRANS_STATUS_URL = "https://api.sandbox.midtrans.com/v2";

function getAdminClient() {
  return createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function isSuccessfulPayment(body) {
  return body.transaction_status === "settlement" ||
    (body.transaction_status === "capture" && body.payment_type === "credit_card" && body.fraud_status === "accept");
}

export async function GET(request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });

    const orderId = String(new URL(request.url).searchParams.get("order") || "").trim();
    if (!orderId || orderId.length > 100) return NextResponse.json({ error: "Order tidak valid." }, { status: 400 });

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) return NextResponse.json({ error: "Konfigurasi Midtrans belum lengkap." }, { status: 500 });

    const admin = getAdminClient();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id,order_number,user_id,total_amount,status,midtrans_transaction_id")
      .eq("order_number", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) return NextResponse.json({ error: "Pesanan gagal diverifikasi." }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    if (order.status === "paid") return NextResponse.json({ ok: true, status: "paid", reused: true });

    const authHeader = "Basic " + Buffer.from(`${serverKey}:`).toString("base64");
    const response = await fetch(`${MIDTRANS_STATUS_URL}/${encodeURIComponent(order.order_number)}/status`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: authHeader },
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));

    if (response.status === 404) return NextResponse.json({ error: "Transaksi Midtrans belum ditemukan." }, { status: 404 });
    if (!response.ok) return NextResponse.json({ error: "Status pembayaran gagal diperiksa." }, { status: 502 });
    if (body.order_id !== order.order_number) return NextResponse.json({ error: "Order ID Midtrans tidak sesuai." }, { status: 409 });
    if (order.total_amount !== null && Number(order.total_amount) !== Number(body.gross_amount)) {
      return NextResponse.json({ error: "Nominal transaksi tidak sesuai." }, { status: 409 });
    }
    if (order.midtrans_transaction_id && body.transaction_id && order.midtrans_transaction_id !== body.transaction_id) {
      return NextResponse.json({ error: "Transaction ID tidak sesuai dengan pesanan." }, { status: 409 });
    }

    let paidAt = null;
    if (isSuccessfulPayment(body)) {
      if (body.settlement_time) {
        const raw = String(body.settlement_time);
        const parsed = new Date(raw.includes("T") ? raw : raw.replace(" ", "T") + "+07:00");
        if (Number.isNaN(parsed.getTime())) return NextResponse.json({ error: "Waktu settlement tidak valid." }, { status: 409 });
        paidAt = parsed.toISOString();
      } else {
        paidAt = new Date().toISOString();
      }
    }

    const { data: result, error: processError } = await admin.rpc("process_midtrans_payment", {
      p_order_number: order.order_number,
      p_transaction_id: body.transaction_id || null,
      p_transaction_status: body.transaction_status,
      p_payment_type: body.payment_type || null,
      p_paid_at: paidAt,
    });

    if (processError) {
      const message = processError.message || "";
      if (message.includes("INSUFFICIENT_STOCK")) return NextResponse.json({ error: "Stok produk tidak mencukupi untuk pesanan ini." }, { status: 409 });
      if (message.includes("PRODUCT_NOT_FOUND")) return NextResponse.json({ error: "Produk pesanan tidak tersedia." }, { status: 409 });
      if (message.includes("TRANSACTION_ID_MISMATCH")) return NextResponse.json({ error: "Transaction ID tidak sesuai dengan pesanan." }, { status: 409 });
      if (message.includes("MISSING_TRANSACTION_ID")) return NextResponse.json({ error: "Transaction ID Midtrans tidak tersedia." }, { status: 409 });
      return NextResponse.json({ error: "Status pembayaran gagal disinkronkan." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, result, transactionStatus: body.transaction_status });
  } catch (error) {
    console.error("Midtrans status error:", error);
    return NextResponse.json({ error: "Gagal memeriksa status pembayaran." }, { status: 500 });
  }
}
