import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

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

  if (adminError) return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  if (!adminUser) return { error: 'Akses admin ditolak.', status: 403 };
  return { admin };
}

export async function GET() {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  const { data, error } = await context.admin
    .from('orders')
    .select('id, user_id, order_number, status, courier, tracking_number, estimated_delivery, total_amount, created_at, updated_at')
    .eq('status', 'cancelled')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Cancelled orders query error:', error);
    return NextResponse.json({ error: 'Riwayat pembatalan gagal dimuat.' }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}
