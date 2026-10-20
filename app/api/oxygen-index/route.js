export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../lib/supabase-server';

export async function GET() {
  try {
  const supabase = await createServerSupabaseClient();
  const authResult = await Promise.race([
    supabase.auth.getUser(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 10000)),
  ]);
  const { data: authData, error: authError } = authResult;
  const user = authData?.user;
  if (authError || !user) return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });

  const { data, error } = await supabase
    .from('oxygen_index_assessments')
    .select('id, experience_score, safety_score, field_skill_score, discipline_score, contribution_score, total_score, level, notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Oxygen Index query error:', error);
    return NextResponse.json({ error: 'Data Oxygen Index belum dapat dimuat.' }, { status: 500 });
  }

  const assessments = data || [];
  return NextResponse.json({ current: assessments[0] || null, history: assessments });
  } catch (error) {
    console.error('Oxygen Index auth/query error:', error);
    const status = error?.message === 'AUTH_TIMEOUT' ? 504 : 500;
    return NextResponse.json({ error: status === 504 ? 'Koneksi autentikasi sedang lambat. Silakan coba lagi.' : 'Data Oxygen Index belum dapat dimuat.' }, { status });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Penilaian Oxygen Index hanya dapat dibuat oleh tim Oxygen.' }, { status: 405 });
}
