import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
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

  if (adminError) {
    console.error('Admin member lookup error:', adminError);
    return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  }
  if (!adminUser) return { error: 'Akses admin ditolak.', status: 403 };

  return { admin };
}

function makeCode() {
  return `OCA-${randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function GET() {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  const { data, error } = await context.admin
    .from('member_codes')
    .select('id, code, member_name, event_name, event_date, status, benefits, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin member codes query error:', error);
    return NextResponse.json({ error: 'Daftar kode member gagal dimuat.' }, { status: 500 });
  }

  return NextResponse.json({ memberCodes: data || [] });
}

export async function POST(request) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  try {
    const body = await request.json();
    const memberName = String(body?.memberName || '').trim();
    const eventName = String(body?.eventName || '').trim();
    const eventDate = body?.eventDate || null;
    const benefits = Array.isArray(body?.benefits)
      ? body.benefits.map((item) => String(item).trim()).filter(Boolean)
      : String(body?.benefits || '').split(',').map((item) => item.trim()).filter(Boolean);

    if (!memberName) return NextResponse.json({ error: 'Nama peserta wajib diisi.' }, { status: 400 });
    if (!eventName) return NextResponse.json({ error: 'Nama event wajib diisi.' }, { status: 400 });
    if (eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return NextResponse.json({ error: 'Tanggal event tidak valid.' }, { status: 400 });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = makeCode();
      const { data, error } = await context.admin
        .from('member_codes')
        .insert({
          code,
          member_name: memberName,
          event_name: eventName,
          event_date: eventDate,
          status: 'active',
          benefits,
        })
        .select('id, code, member_name, event_name, event_date, status, benefits, created_at')
        .single();

      if (!error) return NextResponse.json({ memberCode: data }, { status: 201 });
      if (error.code !== '23505') {
        console.error('Admin member code insert error:', error);
        return NextResponse.json({ error: 'Kode member gagal dibuat.' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Gagal membuat kode unik. Silakan coba lagi.' }, { status: 500 });
  } catch (error) {
    console.error('Admin member code POST error:', error);
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}

export async function PATCH(request) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  try {
    const body = await request.json();
    const id = String(body?.id || '').trim();
    const status = String(body?.status || '').trim();
    const allowedStatuses = ['active', 'inactive', 'expired'];

    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'ID dan status member wajib valid.' }, { status: 400 });
    }

    const { data, error } = await context.admin
      .from('member_codes')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, code, member_name, event_name, event_date, status, benefits, created_at, updated_at')
      .single();

    if (error) {
      console.error('Admin member code update error:', error);
      return NextResponse.json({ error: 'Status kode member gagal diperbarui.' }, { status: 500 });
    }

    return NextResponse.json({ memberCode: data });
  } catch (error) {
    console.error('Admin member code PATCH error:', error);
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
