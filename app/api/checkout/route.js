import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

async function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Cookie writes are not required for this read/insert flow.
          }
        },
      },
    }
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, items } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "Data pesanan tidak lengkap." }, { status: 400 });
    }

    const normalizedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      qty: Number(item.qty),
    }));
    const total = normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (!total || normalizedItems.some((item) => !item.id || !item.name || item.price <= 0 || item.qty <= 0)) {
      return NextResponse.json({ error: "Data item pesanan tidak valid." }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: "MIDTRANS_SERVER_KEY belum diatur di environment variable." }, { status: 500 });
    }

    const supabase = await getSupabase();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu agar pesanan dapat dilacak." }, { status: 401 });
    }

    const orderId = `OXY-${Date.now()}`;
    const authHeader = "Basic " + Buffer.from(`${serverKey}:`).toString("base64");
    const midtransRes = await fetch(MIDTRANS_SNAP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authHeader },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: total },
        customer_details: { first_name: name || "Pelanggan", phone: phone || "", billing_address: { address: address || "" } },
        item_details: normalizedItems.map((item) => ({ id: item.id, price: item.price, quantity: item.qty, name: item.name })),
      }),
    });

    const data = await midtransRes.json();
    if (!midtransRes.ok) {
      const message = (Array.isArray(data.error_messages) && data.error_messages.join(", ")) || "Gagal membuat transaksi Midtrans.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderId,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("Gagal menyimpan order tracking:", orderError);
      return NextResponse.json({ error: "Transaksi berhasil dibuat, tetapi data pelacakan pesanan gagal disimpan." }, { status: 500 });
    }

    const { error: eventError } = await supabase.from("order_tracking_events").insert({
      order_id: order.id,
      status: "pending_payment",
      description: "Pesanan dibuat dan menunggu pembayaran.",
    });

    if (eventError) console.error("Gagal menyimpan event tracking awal:", eventError);

    return NextResponse.json({ token: data.token, orderId });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server saat memproses pesanan." }, { status: 500 });
  }
}
