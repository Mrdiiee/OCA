import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

export async function POST(request) {
  const c = await getAdmin();
  if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  const type = request.headers.get('content-type') || '';
  if (!TYPES.has(type)) return NextResponse.json({ error: 'Foto harus JPG, PNG, atau WEBP.' }, { status: 400 });
  const buffer = Buffer.from(await request.arrayBuffer());
  if (!buffer.length || buffer.length > MAX_SIZE) return NextResponse.json({ error: 'Ukuran foto harus 1 byte sampai 5 MB.' }, { status: 400 });
  const original = decodeURIComponent(request.headers.get('x-file-name') || 'event-cover').replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 100);
  const ext = type === 'image/jpeg' ? 'jpg' : type.split('/')[1];
  const safeName = original.replace(/\.[^.]+$/, '') || 'event-cover';
  const path = `covers/${crypto.randomUUID()}-${safeName}.${ext}`;
  const { error } = await c.admin.storage.from('event-covers').upload(path, buffer, { contentType: type, upsert: false, cacheControl: '31536000' });
  if (error) { console.error(error); return NextResponse.json({ error: 'Foto gagal diunggah.' }, { status: 500 }); }
  const { data } = c.admin.storage.from('event-covers').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
