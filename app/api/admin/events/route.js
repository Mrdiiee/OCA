import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

const STATUSES = ['TERSEDIA', 'SEGERA HADIR', 'DITUTUP', 'SELESAI'];

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

function clean(value, max = 1000) { return String(value ?? '').trim().slice(0, max); }
function slugify(value) { return clean(value, 160).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80); }
function normalize(body) {
  const status = clean(body?.status, 30).toUpperCase();
  const price = body?.price === '' || body?.price == null ? null : Number(body.price);
  const quota = body?.quota === '' || body?.quota == null ? null : Number(body.quota);
  return {
    type: clean(body?.type, 80), title: clean(body?.title, 160), subtitle: clean(body?.subtitle, 300), description: clean(body?.description, 1200),
    cover_image_url: clean(body?.cover_image_url, 1000) || null,
    status: STATUSES.includes(status) ? status : 'SEGERA HADIR',
    event_date: body?.event_date || null, location: clean(body?.location, 200) || null,
    price, quota,
    registration_enabled: Boolean(body?.registration_enabled), published: body?.published !== false,
    sort_order: Number.isFinite(Number(body?.sort_order)) ? Number(body.sort_order) : 0,
  };
}
function validate(payload) {
  if (!payload.title || !payload.type) return 'Tipe dan judul event wajib diisi.';
  if (payload.price != null && (!Number.isFinite(payload.price) || payload.price < 0)) return 'Harga event tidak valid.';
  if (payload.quota != null && (!Number.isInteger(payload.quota) || payload.quota < 1)) return 'Kuota event tidak valid.';
  return null;
}

export async function GET() {
  const c = await getAdmin(); if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  const { data, error } = await c.admin.from('events').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
  if (error) { console.error(error); return NextResponse.json({ error: 'Event gagal dimuat.' }, { status: 500 }); }
  return NextResponse.json({ events: data || [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  const c = await getAdmin(); if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  try {
    const body = await request.json();
    const payload = normalize(body);
    payload.slug = slugify(payload.title);
    const validation = validate(payload);
    if (!payload.slug) return NextResponse.json({ error: 'Judul event tidak valid.' }, { status: 400 });
    if (validation) return NextResponse.json({ error: validation }, { status: 400 });
    const { data, error } = await c.admin.from('events').insert(payload).select('*').single();
    if (error) { console.error(error); return NextResponse.json({ error: error.code === '23505' ? 'Judul event menghasilkan slug yang sudah digunakan. Gunakan judul berbeda.' : 'Event gagal dibuat.' }, { status: 500 }); }
    return NextResponse.json({ event: data }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 }); }
}

export async function PATCH(request) {
  const c = await getAdmin(); if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  try {
    const body = await request.json(); const id = clean(body?.id, 80);
    if (!id) return NextResponse.json({ error: 'ID event wajib diisi.' }, { status: 400 });
    const payload = normalize(body); const validation = validate(payload);
    if (validation) return NextResponse.json({ error: validation }, { status: 400 });
    const { data, error } = await c.admin.from('events').update(payload).eq('id', id).select('*').single();
    if (error) { console.error(error); return NextResponse.json({ error: 'Event gagal diperbarui.' }, { status: 500 }); }
    return NextResponse.json({ event: data });
  } catch { return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 }); }
}
