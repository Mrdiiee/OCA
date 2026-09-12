import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../lib/supabase-server';

const BUCKET = 'homepage_media';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Konfigurasi Supabase server belum lengkap.');
  return createSupabaseAdmin(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getAdmin() {
  const sessionClient = await createServerSupabaseClient();
  const { data, error } = await sessionClient.auth.getUser();
  if (error || !data?.user) return { error: 'Silakan login terlebih dahulu.', status: 401 };
  const admin = adminClient();
  const { data: row, error: adminError } = await admin.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (adminError) return { error: 'Hak akses admin belum dapat diverifikasi.', status: 500 };
  if (!row) return { error: 'Akses admin ditolak.', status: 403 };
  return { admin, userId: data.user.id };
}

export async function GET() {
  try {
    const admin = adminClient();
    const { data, error } = await admin.from('homepage_media').select('key,label,path,url,alt_text,updated_at').order('key');
    if (error) throw error;
    return NextResponse.json({ media: data || [] });
  } catch (error) {
    console.error('Homepage media GET error:', error);
    return NextResponse.json({ error: 'Media homepage gagal dimuat.' }, { status: 500 });
  }
}

export async function POST(request) {
  const context = await getAdmin();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  try {
    const form = await request.formData();
    const key = String(form.get('key') || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const label = String(form.get('label') || key).trim().slice(0, 120);
    const altText = String(form.get('altText') || label).trim().slice(0, 180);
    const file = form.get('file');
    if (!key) return NextResponse.json({ error: 'Slot media wajib dipilih.' }, { status: 400 });
    if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'File gambar wajib dipilih.' }, { status: 400 });
    if (!String(file.type || '').startsWith('image/')) return NextResponse.json({ error: 'File harus berupa gambar.' }, { status: 400 });
    if (Number(file.size || 0) > 8 * 1024 * 1024) return NextResponse.json({ error: 'Ukuran gambar maksimal 8 MB.' }, { status: 400 });

    const ext = (String(file.name || '').split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `homepage/${key}-${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { data: old } = await context.admin.from('homepage_media').select('path').eq('key', key).maybeSingle();
    const { error: uploadError } = await context.admin.storage.from(BUCKET).upload(path, bytes, { contentType: file.type, upsert: false, cacheControl: '31536000' });
    if (uploadError) throw uploadError;

    const { data: publicData } = context.admin.storage.from(BUCKET).getPublicUrl(path);
    const url = publicData?.publicUrl;
    if (!url) throw new Error('URL gambar gagal dibuat.');

    const { data, error } = await context.admin.from('homepage_media').upsert({ key, label, path, url, alt_text: altText || null, updated_at: new Date().toISOString(), updated_by: context.userId }, { onConflict: 'key' }).select('key,label,path,url,alt_text,updated_at').single();
    if (error) {
      await context.admin.storage.from(BUCKET).remove([path]);
      throw error;
    }
    if (old?.path && old.path !== path) await context.admin.storage.from(BUCKET).remove([old.path]);
    return NextResponse.json({ media: data }, { status: 201 });
  } catch (error) {
    console.error('Homepage media POST error:', error);
    return NextResponse.json({ error: error?.message || 'Gambar gagal disimpan.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const context = await getAdmin();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });
  try {
    const body = await request.json();
    const key = String(body?.key || '').trim();
    if (!key) return NextResponse.json({ error: 'Slot media wajib dipilih.' }, { status: 400 });
    const { data: row } = await context.admin.from('homepage_media').select('path').eq('key', key).maybeSingle();
    if (row?.path) await context.admin.storage.from(BUCKET).remove([row.path]);
    const { error } = await context.admin.from('homepage_media').delete().eq('key', key);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Homepage media DELETE error:', error);
    return NextResponse.json({ error: 'Gambar gagal dihapus.' }, { status: 500 });
  }
}
