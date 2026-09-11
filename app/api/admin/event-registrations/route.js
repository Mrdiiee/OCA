import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

const EVENTS = ['pendakian-bersama', 'ekspedisi', 'private-trip'];
const STATUSES = ['pending', 'confirmed', 'waitlist', 'cancelled'];

async function getAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { error: 'Silakan login terlebih dahulu.', status: 401 };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: 'Konfigurasi server belum lengkap.', status: 500 };
  const admin = createSupabaseAdmin(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: row, error: adminError } = await admin.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (adminError) return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  if (!row) return { error: 'Akses admin ditolak.', status: 403 };
  return { admin };
}

export async function GET(request) {
  const c = await getAdmin();
  if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  const { searchParams } = new URL(request.url);
  const event = searchParams.get('event') || '';
  const status = searchParams.get('status') || '';
  let query = c.admin.from('event_registrations').select('id,event_slug,user_id,full_name,email,phone,emergency_contact_name,emergency_contact_phone,notes,status,created_at,updated_at').order('created_at', { ascending: false });
  if (event && EVENTS.includes(event)) query = query.eq('event_slug', event);
  if (status && STATUSES.includes(status)) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) { console.error('Admin event registrations GET:', error); return NextResponse.json({ error: 'Data pendaftaran gagal dimuat.' }, { status: 500 }); }
  return NextResponse.json({ registrations: data || [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request) {
  const c = await getAdmin();
  if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  try {
    const body = await request.json();
    const id = String(body?.id || '').trim();
    const status = String(body?.status || '').trim();
    if (!id || !STATUSES.includes(status)) return NextResponse.json({ error: 'ID dan status pendaftaran wajib valid.' }, { status: 400 });
    const { data, error } = await c.admin.from('event_registrations').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select('id,event_slug,user_id,full_name,email,phone,emergency_contact_name,emergency_contact_phone,notes,status,created_at,updated_at').single();
    if (error) { console.error('Admin event registrations PATCH:', error); return NextResponse.json({ error: 'Status pendaftaran gagal diperbarui.' }, { status: 500 }); }
    return NextResponse.json({ registration: data });
  } catch { return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 }); }
}
