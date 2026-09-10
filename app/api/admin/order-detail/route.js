import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

async function getAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { error: 'Silakan login terlebih dahulu.', status: 401 };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: 'Konfigurasi server belum lengkap.', status: 500 };
  const admin = createSupabaseAdmin(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: adminUser, error: adminError } = await admin.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (adminError) return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  if (!adminUser) return { error: 'Akses admin ditolak.', status: 403 };
  return { admin };
}

export async function GET(request) {
  const context = await getAdmin();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });
  const orderId = new URL(request.url).searchParams.get('id');
  if (!orderId) return NextResponse.json({ error: 'ID pesanan wajib diisi.' }, { status: 400 });

  const { data: order, error: orderError } = await context.admin.from('orders').select('id, user_id, order_number, status, courier, tracking_number, estimated_delivery, total_amount, created_at, updated_at').eq('id', orderId).maybeSingle();
  if (orderError) return NextResponse.json({ error: 'Detail pesanan gagal dimuat.' }, { status: 500 });
  if (!order) return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });

  const [{ data: profile }, { data: events, error: eventsError }, { data: items, error: itemsError }] = await Promise.all([
    context.admin.from('profiles').select('id, full_name, phone, address, city, postal_code').eq('id', order.user_id).maybeSingle(),
    context.admin.from('order_tracking_events').select('id, status, description, location, occurred_at').eq('order_id', order.id).order('occurred_at', { ascending: false }),
    context.admin.from('order_items').select('id, product_id, product_name, quantity, unit_price, created_at').eq('order_id', order.id).order('created_at', { ascending: true }),
  ]);
  if (eventsError) return NextResponse.json({ error: 'Timeline pesanan gagal dimuat.' }, { status: 500 });
  if (itemsError) return NextResponse.json({ error: 'Item pesanan gagal dimuat.' }, { status: 500 });

  let email = null;
  const { data: authUser, error: authError } = await context.admin.auth.admin.getUserById(order.user_id);
  if (!authError) email = authUser?.user?.email || null;

  return NextResponse.json({ order, profile: profile || null, email, events: events || [], items: items || [] });
}
