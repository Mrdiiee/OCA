import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

const FIELDS = ['experience_score', 'safety_score', 'field_skill_score', 'discipline_score', 'contribution_score'];
const LIMITS = { experience_score: 25, safety_score: 25, field_skill_score: 20, discipline_score: 15, contribution_score: 15 };

async function getAdminContext() {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) return { error: 'Silakan login terlebih dahulu.', status: 401 };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return { error: 'Konfigurasi server belum lengkap.', status: 500 };

  const admin = createSupabaseAdmin(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: adminUser, error: adminError } = await admin.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (adminError) {
    console.error('Oxygen Index admin lookup error:', adminError);
    return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  }
  if (!adminUser) return { error: 'Akses admin ditolak.', status: 403 };
  return { admin, evaluatorId: user.id };
}

function normalizeScore(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > LIMITS[field]) return null;
  return number;
}

export async function GET() {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  const { data: users, error: usersError } = await context.admin
    .from('profiles')
    .select('id, full_name, phone, city, updated_at')
    .order('full_name', { ascending: true });
  if (usersError) {
    console.error('Oxygen Index member list error:', usersError);
    return NextResponse.json({ error: 'Daftar member gagal dimuat.' }, { status: 500 });
  }

  const { data: assessments, error: assessmentsError } = await context.admin
    .from('oxygen_index_assessments')
    .select('id, user_id, experience_score, safety_score, field_skill_score, discipline_score, contribution_score, total_score, level, notes, evaluated_by, created_at')
    .order('created_at', { ascending: false });
  if (assessmentsError) {
    console.error('Oxygen Index assessment list error:', assessmentsError);
    return NextResponse.json({ error: 'Data penilaian gagal dimuat. Pastikan migration Oxygen Index sudah dijalankan.' }, { status: 500 });
  }

  const latestByUser = {};
  for (const item of assessments || []) if (!latestByUser[item.user_id]) latestByUser[item.user_id] = item;
  return NextResponse.json({
    members: (users || []).map((member) => ({ ...member, assessment: latestByUser[member.id] || null })),
  });
}

export async function POST(request) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  try {
    const body = await request.json();
    const userId = String(body?.userId || '').trim();
    if (!userId) return NextResponse.json({ error: 'Member wajib dipilih.' }, { status: 400 });

    const scores = {};
    for (const field of FIELDS) {
      const value = normalizeScore(body?.[field], field);
      if (value === null) return NextResponse.json({ error: `${field} harus berupa angka 0-${LIMITS[field]}.` }, { status: 400 });
      scores[field] = value;
    }

    const notes = String(body?.notes || '').trim().slice(0, 2000);
    const { data, error } = await context.admin
      .from('oxygen_index_assessments')
      .insert({ user_id: userId, ...scores, notes: notes || null, evaluated_by: context.evaluatorId })
      .select('id, user_id, experience_score, safety_score, field_skill_score, discipline_score, contribution_score, total_score, level, notes, evaluated_by, created_at')
      .single();

    if (error) {
      console.error('Oxygen Index assessment insert error:', error);
      return NextResponse.json({ error: 'Penilaian gagal disimpan. Pastikan migration Oxygen Index sudah dijalankan.' }, { status: 500 });
    }
    return NextResponse.json({ assessment: data }, { status: 201 });
  } catch (error) {
    console.error('Oxygen Index POST error:', error);
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
