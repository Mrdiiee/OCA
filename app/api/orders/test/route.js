import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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
            // Session refresh is not required for this read-only auth check.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function POST() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
    }

    const admin = createSupabaseAdmin(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    const orderNumber = `TEST-${Date.now()}-${suffix}`;

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'in_transit',
        courier: 'Oxygen Express',
        tracking_number: `OX${Date.now().toString().slice(-10)}`,
        estimated_delivery: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        total_amount: 250000,
      })
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('Gagal membuat order simulasi:', orderError);
      return NextResponse.json({ error: 'Order simulasi gagal dibuat.' }, { status: 500 });
    }

    const now = Date.now();
    const events = [
      { order_id: order.id, status: 'pending_payment', description: 'Pesanan simulasi dibuat untuk pengujian status pengiriman.', occurred_at: new Date(now - 3 * 86400000).toISOString() },
      { order_id: order.id, status: 'paid', description: 'Pembayaran simulasi berhasil dikonfirmasi.', occurred_at: new Date(now - 2.5 * 86400000).toISOString() },
      { order_id: order.id, status: 'processing', description: 'Pesanan sedang diproses oleh gudang.', location: 'Gudang Oxygen Gear', occurred_at: new Date(now - 2 * 86400000).toISOString() },
      { order_id: order.id, status: 'packed', description: 'Pesanan selesai dikemas dan siap dikirim.', location: 'Gudang Oxygen Gear', occurred_at: new Date(now - 1.5 * 86400000).toISOString() },
      { order_id: order.id, status: 'shipped', description: 'Paket diserahkan kepada kurir.', location: 'Jakarta', occurred_at: new Date(now - 1 * 86400000).toISOString() },
      { order_id: order.id, status: 'in_transit', description: 'Paket sedang dalam perjalanan menuju alamat tujuan.', location: 'Bandung', occurred_at: new Date(now - 2 * 3600000).toISOString() },
    ];

    const { error: eventsError } = await admin.from('order_tracking_events').insert(events);
    if (eventsError) {
      console.error('Gagal membuat event simulasi:', eventsError);
      await admin.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Timeline simulasi gagal dibuat.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orderNumber: order.order_number });
  } catch (error) {
    console.error('Order simulation error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
