import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

const TYPES = ['pendakian_bersama','ekspedisi','private_trip','community_event','volunteer_crew','social','environment','other','product_purchase'];

async function getContext() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { error: 'Silakan login terlebih dahulu.', status: 401 };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: 'Konfigurasi server belum lengkap.', status: 500 };
  const admin = createSupabaseAdmin(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: row, error: lookupError } = await admin.from('admin_users').select('user_id, role').eq('user_id', data.user.id).maybeSingle();
  if (lookupError) { console.error(lookupError); return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 }; }
  if (!row || row.role !== 'admin') return { error: 'Akses admin ditolak.', status: 403 };
  return { admin, adminId: data.user.id };
}

export async function GET() {
  const ctx = await getContext();
  if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { data: authData, error: usersError } = await ctx.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) return NextResponse.json({ error: 'Daftar akun gagal dimuat.' }, { status: 500 });
  const [{ data: profiles }, { data: members, error: membersError }, { data: activities, error: activitiesError }] = await Promise.all([
    ctx.admin.from('profiles').select('id, full_name, phone, city'),
    ctx.admin.from('oxygen_members').select('id, user_id, member_since, status, created_at').order('created_at', { ascending: false }),
    ctx.admin.from('oxygen_member_activities').select('id, member_id, user_id, activity_type, title, description, event_id, activity_date, role, verified, verified_by, verified_at, metadata, created_at').order('activity_date', { ascending: false }).limit(1000),
  ]);
  if (membersError || activitiesError) return NextResponse.json({ error: 'Data Member gagal dimuat.' }, { status: 500 });
  const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const memberByUser = Object.fromEntries((members || []).map((m) => [m.user_id, m]));
  const users = (authData?.users || []).map((u) => ({ id: u.id, email: u.email || '', full_name: profileById[u.id]?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'User', phone: profileById[u.id]?.phone || '', city: profileById[u.id]?.city || '', member: memberByUser[u.id] || null })).sort((a,b) => a.full_name.localeCompare(b.full_name, 'id'));
  return NextResponse.json({ users, members: members || [], activities: activities || [], types: TYPES });
}

export async function POST(request) {
  const ctx = await getContext();
  if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  try {
    const body = await request.json();
    const userId = String(body?.userId || '').trim();
    const activityType = String(body?.activityType || '').trim();
    const title = String(body?.title || '').trim();
    const description = String(body?.description || '').trim().slice(0, 2000);
    const activityDate = body?.activityDate || null;
    const role = String(body?.role || '').trim().slice(0, 120);
    const verified = Boolean(body?.verified);
    if (!userId || !TYPES.includes(activityType) || !title) return NextResponse.json({ error: 'Akun, jenis aktivitas, dan judul wajib diisi.' }, { status: 400 });
    if (activityDate && !/^\d{4}-\d{2}-\d{2}$/.test(activityDate)) return NextResponse.json({ error: 'Tanggal aktivitas tidak valid.' }, { status: 400 });
    const { data: target, error: targetError } = await ctx.admin.auth.admin.getUserById(userId);
    if (targetError || !target?.user) return NextResponse.json({ error: 'Akun tidak ditemukan.' }, { status: 404 });
    const { data, error } = await ctx.admin.from('oxygen_member_activities').insert({ user_id: userId, activity_type: activityType, title, description: description || null, activity_date: activityDate, role: role || null, verified, verified_by: verified ? ctx.adminId : null, verified_at: verified ? new Date().toISOString() : null }).select('*').single();
    if (error) { console.error(error); return NextResponse.json({ error: 'Aktivitas gagal disimpan.' }, { status: 500 }); }
    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 }); }
}

export async function PATCH(request) {
  const ctx = await getContext();
  if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  try {
    const body = await request.json();
    const id = String(body?.id || '').trim();
    const verified = Boolean(body?.verified);
    if (!id) return NextResponse.json({ error: 'Aktivitas wajib dipilih.' }, { status: 400 });
    const { data, error } = await ctx.admin.from('oxygen_member_activities').update({ verified, verified_by: verified ? ctx.adminId : null, verified_at: verified ? new Date().toISOString() : null }).eq('id', id).select('*').single();
    if (error) { console.error(error); return NextResponse.json({ error: 'Status aktivitas gagal diperbarui.' }, { status: 500 }); }
    return NextResponse.json({ activity: data });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 }); }
}
