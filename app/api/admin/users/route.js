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

export async function GET() {
  const context = await getAdmin();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });
  const { data, error } = await context.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return NextResponse.json({ error: 'Daftar user gagal dimuat.' }, { status: 500 });
  const users = (data?.users || []).map((user) => ({
    id: user.id,
    email: user.email || '-',
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    email_confirmed: Boolean(user.email_confirmed_at),
    disabled: Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now()),
  }));
  return NextResponse.json({ users });
}

export async function PATCH(request) {
  const context = await getAdmin();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });
  try {
    const { userId, disabled } = await request.json();
    if (!userId || typeof disabled !== 'boolean') return NextResponse.json({ error: 'User dan status wajib diisi.' }, { status: 400 });
    const { data: authData } = await context.admin.auth.getUser();
    if (authData?.user?.id === userId) return NextResponse.json({ error: 'Akun admin yang sedang digunakan tidak dapat dinonaktifkan.' }, { status: 400 });
    const { error } = await context.admin.auth.admin.updateUserById(userId, { ban_duration: disabled ? '876000h' : 'none' });
    if (error) return NextResponse.json({ error: 'Status user gagal diperbarui.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
