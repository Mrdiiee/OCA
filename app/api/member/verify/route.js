import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const code = String(body?.code || "").trim().toUpperCase();
    if (!code || code.length > 100) {
      return NextResponse.json({ error: "Kode member tidak valid." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "Konfigurasi server belum lengkap." }, { status: 500 });
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await supabase
      .from("member_codes")
      .select("code,member_name,event_name,event_date,status,benefits")
      .eq("code", code)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Member verification error:", error);
      return NextResponse.json({ error: "Kode member belum dapat diperiksa." }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: "Kode tidak valid atau sudah tidak aktif." }, { status: 404 });

    return NextResponse.json({
      member: {
        name: data.member_name,
        event: data.event_name || "Event Oxygen Gear",
        date: data.event_date || null,
        status: "AKTIF",
        benefits: Array.isArray(data.benefits) ? data.benefits : [],
      },
    });
  } catch (error) {
    console.error("Member verify API error:", error);
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }
}
