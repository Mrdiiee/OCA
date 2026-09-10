import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

function getMidtransSnapUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} }
    }
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, items } = body;
    const checkoutKey = String(request.headers.get("x-checkout-idempotency-key") || "").trim();
    if (!checkoutKey || checkoutKey.length > 46) return NextResponse.json({ error: "Checkout key tidak valid. Silakan coba lagi." }, { status: 400 });
    if (!String(name || '').trim() || !String(phone || '').trim() || !String(address || '').trim()) return NextResponse.json({ error: 'Nama, nomor HP, dan alamat wajib diisi.' }, { status: 400 });
    if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: 'Data pesanan tidak lengkap.' }, { status: 400 });

    const requested = items.map(i => ({ id: String(i.id || ''), qty: Number(i.qty) }));
    if (requested.some(i => !i.id || !Number.isInteger(i.qty) || i.qty <= 0)) return NextResponse.json({ error: 'Data item pesanan tidak valid.' }, { status: 400 });

    const supabase = await getSupabase();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return NextResponse.json({ error: 'Silakan login terlebih dahulu agar pesanan dapat dilacak.' }, { status: 401 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
    const admin = createSupabaseAdmin(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: existing, error: existingError } = await admin.from('orders').select('id,order_number,midtrans_snap_token,status,total_amount').eq('user_id', user.id).eq('checkout_idempotency_key', checkoutKey).maybeSingle();
    if (existingError) return NextResponse.json({ error: 'Checkout tidak dapat diverifikasi.' }, { status: 500 });
    if (existing?.midtrans_snap_token) return NextResponse.json({ token: existing.midtrans_snap_token, orderId: existing.order_number, reused: true });

    const ids = [...new Set(requested.map(i => i.id))];
    const { data: products, error: pe } = await admin.from('products').select('id,name,price,stock,is_active').in('id', ids);
    if (pe) return NextResponse.json({ error: 'Produk gagal diverifikasi.' }, { status: 500 });
    if (!products || products.length !== ids.length) return NextResponse.json({ error: 'Ada produk yang sudah tidak tersedia.' }, { status: 400 });
    const map = new Map(products.map(p => [p.id, p]));
    const verified = requested.map(i => { const p = map.get(i.id); return { product_id: p.id, product_name: p.name, unit_price: Number(p.price), quantity: i.qty, stock: p.stock, is_active: p.is_active }; });
    if (verified.some(i => !i.is_active || i.quantity > i.stock)) return NextResponse.json({ error: 'Stok produk tidak mencukupi atau produk sudah tidak aktif. Keranjang telah berubah, silakan cek lagi.' }, { status: 409 });
    const total = verified.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    if (!total) return NextResponse.json({ error: 'Total pesanan tidak valid.' }, { status: 400 });

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) return NextResponse.json({ error: 'MIDTRANS_SERVER_KEY belum diatur di environment variable.' }, { status: 500 });

    // Save the local order first so a failed external call is recoverable with the same idempotency key.
    let order = existing;
    if (!order) {
      const orderId = `OXY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const { data: created, error: oe } = await admin.from('orders').insert({ user_id: user.id, order_number: orderId, status: 'pending_payment', total_amount: total, checkout_idempotency_key: checkoutKey }).select('id,order_number,midtrans_snap_token,status,total_amount').single();
      if (oe) {
        const { data: race } = await admin.from('orders').select('id,order_number,midtrans_snap_token,status,total_amount').eq('user_id', user.id).eq('checkout_idempotency_key', checkoutKey).maybeSingle();
        if (race?.midtrans_snap_token) return NextResponse.json({ token: race.midtrans_snap_token, orderId: race.order_number, reused: true });
        if (!race) return NextResponse.json({ error: 'Pesanan gagal disiapkan. Silakan coba lagi.' }, { status: 500 });
        order = race;
      } else order = created;
    }
    if (Number(order.total_amount) !== total) return NextResponse.json({ error: 'Checkout ini sudah dipakai untuk pesanan dengan total berbeda.' }, { status: 409 });

    const { error: ie } = await admin.from('order_items').upsert(verified.map(i => ({ order_id: order.id, product_id: i.product_id, product_name: i.product_name, quantity: i.quantity, unit_price: i.unit_price })), { onConflict: 'order_id,product_id' });
    if (ie) {
      console.error('Gagal menyimpan detail order sebelum transaksi Midtrans dibuat:', ie);
      return NextResponse.json({ error: 'Detail pesanan belum dapat disimpan. Silakan coba lagi.' }, { status: 500 });
    }

    await admin.from('profiles').upsert({ id: user.id, full_name: String(name).trim(), phone: String(phone).trim(), address: String(address).trim(), updated_at: new Date().toISOString() }, { onConflict: 'id' });
    const { error: eventError } = await admin.from('order_tracking_events').insert({ order_id: order.id, status: 'pending_payment', description: 'Pesanan dibuat dan menunggu pembayaran.' });
    if (eventError && eventError.code !== '23505') console.error(eventError);

    const authHeader = 'Basic ' + Buffer.from(`${serverKey}:`).toString('base64');
    const midtransRes = await fetch(getMidtransSnapUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: authHeader, 'Idempotency-Key': checkoutKey },
      body: JSON.stringify({ transaction_details: { order_id: order.order_number, gross_amount: total }, customer_details: { first_name: String(name).trim(), phone: String(phone).trim(), billing_address: { address: String(address).trim() } }, item_details: verified.map(i => ({ id: i.product_id, price: i.unit_price, quantity: i.quantity, name: i.product_name })) })
    });
    const midtrans = await midtransRes.json();
    if (!midtransRes.ok) return NextResponse.json({ error: (Array.isArray(midtrans.error_messages) && midtrans.error_messages.join(', ')) || 'Gagal membuat transaksi Midtrans. Pesanan tetap tersimpan dan dapat dicoba kembali.' }, { status: 500 });
    if (!midtrans.token) return NextResponse.json({ error: 'Midtrans tidak mengembalikan token pembayaran. Silakan coba lagi.' }, { status: 502 });

    const { error: updateError } = await admin.from('orders').update({ midtrans_snap_token: midtrans.token }).eq('id', order.id).is('midtrans_snap_token', null);
    if (updateError) {
      console.error('Gagal menyimpan Snap token:', updateError);
      return NextResponse.json({ error: 'Transaksi pembayaran dibuat, tetapi token belum tersimpan. Silakan coba lagi dengan tombol pembayaran yang sama.' }, { status: 500 });
    }
    return NextResponse.json({ token: midtrans.token, orderId: order.order_number });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat memproses pesanan.' }, { status: 500 });
  }
}
