import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

async function getSupabase() { const cookieStore = await cookies(); return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { cookies: { getAll() { return cookieStore.getAll(); }, setAll(values) { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } }); }
function clean(value, max = 160) { return String(value || "").trim().slice(0, max); }

export async function POST(request) {
  try {
    const body = await request.json(); const eventSlug = clean(body?.eventSlug, 80).toLowerCase(); const fullName = clean(body?.fullName, 120); const phone = clean(body?.phone, 30); const emergencyContactName = clean(body?.emergencyContactName, 120); const emergencyContactPhone = clean(body?.emergencyContactPhone, 30); const notes = clean(body?.notes, 500);
    if (!eventSlug) return NextResponse.json({ error: "Event tidak tersedia." }, { status: 400 });
    if (fullName.length < 2) return NextResponse.json({ error: "Nama lengkap minimal 2 karakter." }, { status: 400 });
    if (phone.length < 8) return NextResponse.json({ error: "Nomor HP peserta minimal 8 karakter." }, { status: 400 });
    if (emergencyContactName.length < 2) return NextResponse.json({ error: "Nama kontak darurat minimal 2 karakter." }, { status: 400 });
    if (emergencyContactPhone.length < 8) return NextResponse.json({ error: "Nomor HP kontak darurat minimal 8 karakter." }, { status: 400 });
    const supabase = await getSupabase(); const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) return NextResponse.json({ error: "Silakan login terlebih dahulu untuk mendaftar." }, { status: 401 });
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY, url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) return NextResponse.json({ error: "Konfigurasi server belum lengkap." }, { status: 500 });
    const admin = createSupabaseAdmin(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: event, error: eventError } = await admin.from("events").select("id,slug,title,status,registration_enabled,published,quota").eq("slug", eventSlug).maybeSingle();
    if (eventError) return NextResponse.json({ error: "Event tidak dapat diverifikasi." }, { status: 500 });
    if (!event || !event.published) return NextResponse.json({ error: "Event tidak tersedia." }, { status: 404 });
    if (!event.registration_enabled || event.status !== "TERSEDIA") return NextResponse.json({ error: "Pendaftaran event belum dibuka." }, { status: 400 });
    if (event.quota) { const { count, error } = await admin.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_slug", eventSlug).in("status", ["pending", "confirmed", "waitlist"]); if (error) return NextResponse.json({ error: "Kuota event tidak dapat diverifikasi." }, { status: 500 }); if ((count || 0) >= event.quota) return NextResponse.json({ error: "Kuota event sudah penuh." }, { status: 409 }); }
    const user = authData.user; const { data: existing, error: existingError } = await admin.from("event_registrations").select("id,status").eq("event_slug", eventSlug).eq("user_id", user.id).maybeSingle();
    if (existingError) return NextResponse.json({ error: "Pendaftaran tidak dapat diverifikasi." }, { status: 500 });
    if (existing) return NextResponse.json({ error: existing.status === "cancelled" ? "Pendaftaran sebelumnya dibatalkan. Hubungi Oxygen Gear untuk mendaftar kembali." : "Kamu sudah terdaftar pada event ini." }, { status: 409 });
    const { data: created, error: insertError } = await admin.from("event_registrations").insert({ event_slug: eventSlug, user_id: user.id, full_name: fullName, email: user.email || "", phone, emergency_contact_name: emergencyContactName, emergency_contact_phone: emergencyContactPhone, notes: notes || null, status: "pending" }).select("id,event_slug,status,created_at").single();
    if (insertError) { if (insertError.code === "23505") return NextResponse.json({ error: "Kamu sudah terdaftar pada event ini." }, { status: 409 }); console.error(insertError); return NextResponse.json({ error: "Pendaftaran gagal disimpan. Silakan coba lagi." }, { status: 500 }); }
    return NextResponse.json({ registration: created });
  } catch (error) { console.error("Event registration error:", error); return NextResponse.json({ error: "Terjadi kesalahan server saat mendaftarkan peserta." }, { status: 500 }); }
}
