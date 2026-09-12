import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../lib/supabase-server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
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
}

export async function POST() {
  return NextResponse.json({ error: 'Penilaian Oxygen Index hanya dapat dibuat oleh tim Oxygen.' }, { status: 405 });
}
