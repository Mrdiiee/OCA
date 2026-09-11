import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('events').select('*').eq('published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: true });
  if (error) { console.error('Public events GET:', error); return NextResponse.json({ error: 'Event gagal dimuat.' }, { status: 500 }); }
  return NextResponse.json({ events: data || [] }, { headers: { 'Cache-Control': 'no-store' } });
}
