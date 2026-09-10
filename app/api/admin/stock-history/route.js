import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

async function getAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return { error: 'Silakan login terlebih dahulu.', status: 401 };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: 'Konfigurasi server belum lengkap.', status: 500 };
  const admin = createSupabaseAdmin(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: row, error } = await admin.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (error) return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  if (!row) return { error: 'Akses admin ditolak.', status: 403 };
  return { admin };
}

export async function GET(request) {
  const context = await getAdmin();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  let query = context.admin.from('stock_movements').select('id,product_id,quantity_delta,stock_before,stock_after,movement_type,note,order_id,created_at,products(name,slug)').order('created_at', { ascending: false }).limit(200);
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) { console.error('Stock history error:', error); return NextResponse.json({ error: 'Riwayat stok gagal dimuat.' }, { status: 500 }); }
  return NextResponse.json({ movements: data || [] });
}
