import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

const LABELS = { pendakian_bersama: 'Pendakian Bersama', ekspedisi: 'Ekspedisi', private_trip: 'Private Trip', community_event: 'Event Komunitas', volunteer_crew: 'Volunteer / Crew', social: 'Kegiatan Sosial', environment: 'Kegiatan Lingkungan', other: 'Aktivitas Lain', product_purchase: 'Pembelian Produk', };

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });

  const [{ data: member, error: memberError }, { data: activities, error: activityError }, { data: assessments, error: assessmentError }] = await Promise.all([
    supabase.from('oxygen_members').select('id, member_since, status, created_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('oxygen_member_activities').select('id, user_id, activity_type, title, description, event_id, activity_date, role, verified, verified_at, metadata, created_at').eq('user_id', user.id).eq('verified', true).order('activity_date', { ascending: false }).limit(100),
    supabase.from('oxygen_index_assessments').select('id, total_score, level, notes, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
  ]);

  if (memberError || activityError || assessmentError) {
    console.error('Member data query error:', memberError || activityError || assessmentError);
    return NextResponse.json({ error: 'Data Member belum dapat dimuat.' }, { status: 500 });
  }

  const verifiedActivities = activities || [];
  const journeyTypes = new Set(['pendakian_bersama', 'ekspedisi', 'private_trip', 'community_event']);
  const contributionTypes = new Set(['volunteer_crew', 'social', 'environment', 'other']);
  const journeys = verifiedActivities.filter((item) => journeyTypes.has(item.activity_type));
  const contributions = verifiedActivities.filter((item) => contributionTypes.has(item.activity_type));
  const support = verifiedActivities.filter((item) => item.activity_type === 'product_purchase');

  return NextResponse.json({ member: member ? { ...member, is_member: member.status === 'active' } : null, activities: verifiedActivities.map((item) => ({ ...item, label: LABELS[item.activity_type] || item.activity_type })), stats: { total: verifiedActivities.length, journeys: journeys.length, contributions: contributions.length, support: support.length }, oxygen_index: { current: assessments?.[0] || null, history: assessments || [] } });
}
