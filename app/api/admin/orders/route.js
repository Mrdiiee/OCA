import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

const STATUS_FLOW = ['pending_payment', 'paid', 'processing', 'packed', 'shipped', 'in_transit', 'delivered'];
const STATUS_LABELS = {
  pending_payment: 'Menunggu pembayaran',
  paid: 'Pembayaran berhasil',
  processing: 'Pesanan diproses',
  packed: 'Pesanan dikemas',
  shipped: 'Pesanan dikirim',
  in_transit: 'Dalam perjalanan',
  delivered: 'Pesanan sampai',
  cancelled: 'Pesanan dibatalkan',
};

async function getAdminContext() {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) return { error: 'Silakan login terlebih dahulu.', status: 401 };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return { error: 'Konfigurasi server belum lengkap.', status: 500 };

  const admin = createSupabaseAdmin(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: adminUser, error: adminError } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError) {
    console.error('Admin lookup error:', adminError);
    return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  }
  if (!adminUser) return { error: 'Akses admin ditolak.', status: 403 };

  return { admin, user };
}

export async function GET() {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  const { data, error } = await context.admin
    .from('orders')
    .select('id, user_id, order_number, status, courier, tracking_number, estimated_delivery, total_amount, created_at, updated_at')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin orders query error:', error);
    return NextResponse.json({ error: 'Daftar pesanan gagal dimuat.' }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(request) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  try {
    const body = await request.json();
    const { orderId, status, courier, trackingNumber, estimatedDelivery, location } = body || {};

    if (!orderId || !status || !STATUS_LABELS[status]) {
      return NextResponse.json({ error: 'Order dan status wajib diisi.' }, { status: 400 });
    }
    if (!STATUS_FLOW.includes(status) && status !== 'cancelled') {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
    }

    const { data: order, error: orderError } = await context.admin
      .from('orders')
      .select('id, order_number, status, courier, tracking_number, estimated_delivery')
      .eq('id', orderId)
      .single();

    if (orderError || !order) return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });

    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextIndex = STATUS_FLOW.indexOf(status);
    if (status !== 'cancelled' && currentIndex >= 0 && nextIndex !== currentIndex + 1) {
      return NextResponse.json({
        error: `Urutan status harus dilanjutkan dari "${STATUS_LABELS[order.status]}".`,
      }, { status: 400 });
    }
    if (status === 'cancelled' && order.status === 'delivered') {
      return NextResponse.json({ error: 'Pesanan yang sudah sampai tidak dapat dibatalkan.' }, { status: 400 });
    }

    if (status === 'shipped' && (!courier || !trackingNumber || !estimatedDelivery)) {
      return NextResponse.json({ error: 'Saat mengirim pesanan, kurir, nomor resi, dan estimasi tiba wajib diisi.' }, { status: 400 });
    }

    const update = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (courier !== undefined) update.courier = courier || null;
    if (trackingNumber !== undefined) update.tracking_number = trackingNumber || null;
    if (estimatedDelivery !== undefined) update.estimated_delivery = estimatedDelivery || null;

    const { data: updatedOrder, error: updateError } = await context.admin
      .from('orders')
      .update(update)
      .eq('id', orderId)
      .select('id, order_number, status, courier, tracking_number, estimated_delivery, updated_at')
      .single();

    if (updateError) {
      console.error('Admin order update error:', updateError);
      return NextResponse.json({ error: 'Status pesanan gagal diperbarui.' }, { status: 500 });
    }

    const descriptions = {
      paid: 'Pembayaran telah dikonfirmasi.',
      processing: 'Pesanan sedang diproses oleh gudang.',
      packed: 'Pesanan selesai dikemas dan siap dikirim.',
      shipped: `Pesanan diserahkan kepada ${courier}. Nomor resi: ${trackingNumber}.`,
      in_transit: 'Paket sedang dalam perjalanan menuju alamat tujuan.',
      delivered: 'Paket telah diterima di alamat tujuan.',
      cancelled: 'Pesanan dibatalkan.',
    };

    const { error: eventError } = await context.admin
      .from('order_tracking_events')
      .insert({
        order_id: orderId,
        status,
        description: descriptions[status] || `Status pesanan berubah menjadi ${STATUS_LABELS[status]}.`,
        location: location || null,
      });

    if (eventError) {
      console.error('Tracking event insert error:', eventError);
      return NextResponse.json({ error: 'Status berubah, tetapi timeline gagal disimpan.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (error) {
    console.error('Admin order PATCH error:', error);
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
