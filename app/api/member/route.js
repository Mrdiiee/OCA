import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authError || !user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const { data: member, error: memberError } = await supabase
    .from('oxygen_members')
    .select('id, member_since, status, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (memberError) {
    console.error('Member query error:', memberError);
    return NextResponse.json({ error: 'Data member belum dapat dimuat.' }, { status: 500 });
  }

  if (!member) {
    return NextResponse.json({ member: null, activities: [], stats: { total: 0, journeys: 0, contributions: 0 } });
  }

  const { data: activities, error: activityError } = await supabase
    .from('oxygen_member_activities')
    .select('id, activity_type, title, description, event_id, activity_date, role, verified, verified_at, metadata, created_at')
    .eq('member_id', member.id)
    .eq('verified', true)
    .order('activity_date', { ascending: false });

  if (activityError) {
    console.error('Member activities query error:', activityError);
    return NextResponse.json({ error: 'Riwayat perjalanan belum dapat dimuat.' }, { status: 500 });
  }

  const journeyTypes = new Set(['pendakian_bersama', 'ekspedisi', 'private_trip', 'community_event']);
  const contributionTypes = new Set(['volunteer_crew', 'social', 'environment', 'other']);
  const verifiedActivities = activities || [];

  return NextResponse.json({
    member,
    activities: verifiedActivities,
    stats: {
      total: verifiedActivities.length,
      journeys: verifiedActivities.filter((item) => journeyTypes.has(item.activity_type)).length,
      contributions: verifiedActivities.filter((item) => contributionTypes.has(item.activity_type)).length,
    },
  });
}
