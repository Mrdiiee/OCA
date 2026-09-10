import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, items } = body;
    if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: "Data pesanan tidak lengkap." }, { status: 400 });

    const requested = items.map(item => ({ id: String(item.id || ""), qty: Number(item.qty) }));
    if (requested.some(item => !item.id || !Number.isInteger(item.qty) || item.qty <= 0)) return NextResponse.json({ error: "Data item pesanan tidak valid." }, { status: 400 });

    const supabase = await getSupabase();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu agar pesanan dapat dilacak." }, { status: 401 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supabaseUrl) return NextResponse.json({ error: "Konfigurasi server belum lengkap." }, { status: 500 });
    const admin = createSupabaseAdmin(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const ids = [...new Set(requested.map(item => item.id))];
    const { data: products, error: productsError } = await admin.from("products").select("id, name, price, stock, is_active").in("id", ids);
    if (productsError) return NextResponse.json({ error: "Produk gagal diverifikasi." }, { status: 500 });
    if (!products || products.length !== ids.length) return NextResponse.json({ error: "Ada produk yang sudah tidak tersedia." }, { status: 400 });

    const productMap = new Map(products.map(product => [product.id, product]));
    const verifiedItems = requested.map(item => {
      const product = productMap.get(item.id);
      return { product_id: product.id, product_name: product.name, unit_price: Number(product.price), quantity: item.qty, stock: product.stock, is_active: product.is_active };
    });
    if (verifiedItems.some(item => !item.is_active || item.quantity > item.stock)) return NextResponse.json({ error: "Stok produk tidak mencukupi atau produk sudah tidak aktif." }, { status: 400 });

    const total = verifiedItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    if (!total) return NextResponse.json({ error: "Total pesanan tidak valid." }, { status: 400 });

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) return NextResponse.json({ error: "MIDTRANS_SERVER_KEY belum diatur di environment variable." }, { status: 500 });
    const orderId = `OXY-${Date.now()}`;
    const authHeader = "Basic " + Buffer.from(`${serverKey}:`).toString("base64");
    const midtransRes = await fetch(MIDTRANS_SNAP_URL, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authHeader },
      body: JSON.stringify({ transaction_details: { order_id: orderId, gross_amount: total }, customer_details: { first_name: name || "Pelanggan", phone: phone || "", billing_address: { address: address || "" } }, item_details: verifiedItems.map(item => ({ id: item.product_id, price: item.unit_price, quantity: item.quantity, name: item.product_name })) }),
    });
    const data = await midtransRes.json();
    if (!midtransRes.ok) return NextResponse.json({ error: (Array.isArray(data.error_messages) && data.error_messages.join(", ")) || "Gagal membuat transaksi Midtrans." }, { status: 500 });

    const { data: order, error: orderError } = await supabase.from("orders").insert({ user_id: user.id, order_number: orderId, status: "pending_payment", total_amount: total }).select("id").single();
    if (orderError) return NextResponse.json({ error: "Transaksi berhasil dibuat, tetapi data pelacakan pesanan gagal disimpan." }, { status: 500 });

    const { error: itemError } = await admin.from("order_items").insert(verifiedItems.map(item => ({ order_id: order.id, product_id: item.product_id, product_name: item.product_name, quantity: item.quantity, unit_price: item.unit_price })));
    if (itemError) {
      console.error("Gagal menyimpan item pesanan:", itemError);
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Pesanan gagal menyimpan detail produk." }, { status: 500 });
    }

    const { error: eventError } = await supabase.from("order_tracking_events").insert({ order_id: order.id, status: "pending_payment", description: "Pesanan dibuat dan menunggu pembayaran." });
    if (eventError) console.error("Gagal menyimpan event tracking awal:", eventError);
    return NextResponse.json({ token: data.token, orderId });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server saat memproses pesanan." }, { status: 500 });
  }
}
