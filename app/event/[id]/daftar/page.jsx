"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase-browser";

const EVENT_NAMES = { "pendakian-bersama": "Pendakian Bersama", ekspedisi: "Ekspedisi", "private-trip": "Private Trip Papandayan" };

export default function EventRegistrationPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ fullName: "", phone: "", emergencyContactName: "", emergencyContactPhone: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSession() {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;
      if (sessionError) { setError("Sesi login tidak dapat dibaca. Silakan login kembali."); setLoading(false); return; }
      const sessionUser = data?.session?.user;
      if (!sessionUser) { router.replace(`/login?next=${encodeURIComponent(`/event/${id}/daftar`)}`); return; }
      setUser(sessionUser);
      setForm(current => ({ ...current, fullName: current.fullName || sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || "" }));
      setLoading(false);
    }
    loadSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const sessionUser = session?.user || null;
      if (sessionUser) {
        setUser(sessionUser);
        setForm(current => ({ ...current, fullName: current.fullName || sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || "" }));
        setError(""); setLoading(false);
      } else setUser(null);
    });
    return () => { mounted = false; authListener?.subscription?.unsubscribe(); };
  }, [id, router, supabase]);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  function validate() {
    const name = form.fullName.trim();
    const phone = form.phone.trim();
    const emergencyName = form.emergencyContactName.trim();
    const emergencyPhone = form.emergencyContactPhone.trim();
    if (name.length < 2) return "Nama lengkap minimal 2 karakter.";
    if (phone.length < 8) return "Nomor HP peserta minimal 8 karakter.";
    if (emergencyName.length < 2) return "Nama kontak darurat minimal 2 karakter.";
    if (emergencyPhone.length < 8) return "Nomor HP kontak darurat minimal 8 karakter.";
    return "";
  }

  async function submit(event) {
    event.preventDefault(); setError("");
    if (!user) { router.replace(`/login?next=${encodeURIComponent(`/event/${id}/daftar`)}`); return; }
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSubmitting(true);
    try {
      const response = await fetch("/api/event-registration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventSlug: id, fullName: form.fullName.trim(), phone: form.phone.trim(), emergencyContactName: form.emergencyContactName.trim(), emergencyContactPhone: form.emergencyContactPhone.trim(), notes: form.notes.trim() }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Pendaftaran gagal. Silakan periksa kembali data kamu."); return; }
      setSuccess(true);
    } catch { setError("Koneksi bermasalah. Silakan coba lagi."); }
    finally { setSubmitting(false); }
  }

  const inputStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #d8d8d5", background: "#fff", padding: "14px 15px", fontSize: 13, outline: "none" };
  const labelStyle = { display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".09em", marginBottom: 8 };

  if (loading) return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Arial,Helvetica,sans-serif" }}>Memuat pendaftaran...</main>;

  return (
    <main style={{ minHeight: "100vh", background: "#f7f7f5", color: "#111", fontFamily: "Arial,Helvetica,sans-serif" }}>
      <div style={{ background: "#111", color: "#fff", padding: "9px 16px", textAlign: "center", fontSize: 10, fontWeight: 800, letterSpacing: ".12em" }}>OXYGEN GEAR · PENDAFTARAN EVENT</div>
      <header style={{ background: "#fff", borderBottom: "1px solid #ddd" }}><div style={{ width: "min(980px,calc(100% - 40px))", minHeight: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 15 }}><a href={`/event/${id}`} style={{ color: "#111", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>← KEMBALI KE EVENT</a><span style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".05em" }}>OXYGEN GEAR</span></div></header>
      <section style={{ width: "min(980px,calc(100% - 40px))", margin: "0 auto", padding: "68px 0 100px" }}>
        {!success ? <>
          <div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".12em", marginBottom: 14 }}>DAFTAR / {EVENT_NAMES[id] || "EVENT"}</div>
          <h1 style={{ fontSize: "clamp(42px,7vw,82px)", lineHeight: .9, letterSpacing: "-.06em", margin: "0 0 18px", maxWidth: 760 }}>SIAP<br /><span style={{ color: "#e1261c" }}>BERANGKAT?</span></h1>
          <p style={{ color: "#666", maxWidth: 650, lineHeight: 1.75, fontSize: 14, marginBottom: 42 }}>Isi data peserta dengan benar. Data kontak darurat digunakan untuk kebutuhan keselamatan selama persiapan dan pelaksanaan perjalanan.</p>
          {error && <div style={{ background: "#fff0ef", border: "1px solid #f0b5b0", color: "#b21d16", padding: 14, fontSize: 12, lineHeight: 1.5, marginBottom: 20 }}>{error}</div>}
          <form onSubmit={submit} noValidate style={{ background: "#fff", border: "1px solid #ddd", padding: "clamp(24px,5vw,48px)" }}>
            <div style={{ display: "grid", gap: 25 }}>
              <div><label style={labelStyle}>NAMA LENGKAP *</label><input style={inputStyle} value={form.fullName} onChange={e => update("fullName", e.target.value)} autoComplete="name" required /></div>
              <div><label style={labelStyle}>EMAIL</label><input style={{ ...inputStyle, background: "#f3f3f1", color: "#666" }} value={user?.email || ""} readOnly /></div>
              <div><label style={labelStyle}>NOMOR HP *</label><input style={inputStyle} value={form.phone} onChange={e => update("phone", e.target.value)} autoComplete="tel" inputMode="tel" placeholder="Contoh: 081234567890" required /></div>
              <div style={{ paddingTop: 15, borderTop: "1px solid #e5e5e5" }}><div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".1em", marginBottom: 20 }}>KONTAK DARURAT</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><div><label style={labelStyle}>NAMA *</label><input style={inputStyle} value={form.emergencyContactName} onChange={e => update("emergencyContactName", e.target.value)} autoComplete="name" placeholder="Nama keluarga / kontak" required /></div><div><label style={labelStyle}>NOMOR HP *</label><input style={inputStyle} value={form.emergencyContactPhone} onChange={e => update("emergencyContactPhone", e.target.value)} inputMode="tel" placeholder="Contoh: 081234567890" required /></div></div></div>
              <div><label style={labelStyle}>CATATAN TAMBAHAN</label><textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Kondisi khusus, kebutuhan perjalanan, atau informasi lain yang perlu kami ketahui." /></div>
              <button type="submit" disabled={submitting || !user} style={{ border: 0, background: submitting || !user ? "#777" : "#111", color: "#fff", padding: "16px 20px", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", cursor: submitting || !user ? "not-allowed" : "pointer" }}>{submitting ? "MENYIMPAN..." : "KIRIM PENDAFTARAN →"}</button>
            </div>
          </form>
        </> : <div style={{ background: "#111", color: "#fff", padding: "clamp(35px,7vw,75px)" }}><div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".12em", marginBottom: 15 }}>PENDAFTARAN DITERIMA</div><h1 style={{ fontSize: "clamp(40px,7vw,76px)", lineHeight: .9, letterSpacing: "-.06em", margin: "0 0 20px" }}>SEE YOU<br />OUT THERE.</h1><p style={{ color: "#bbb", maxWidth: 600, lineHeight: 1.75, fontSize: 14 }}>Data pendaftaran kamu sudah tersimpan. Status awal: <strong style={{ color: "#fff" }}>PENDING</strong>. Tim Oxygen Gear akan menghubungi kamu ketika detail event dan proses berikutnya sudah siap.</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 30 }}><a href="/member" style={{ background: "#fff", color: "#111", padding: "15px 18px", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".07em" }}>KE MEMBER AREA →</a><a href="/event" style={{ border: "1px solid #555", color: "#fff", padding: "15px 18px", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".07em" }}>LIHAT EVENT</a></div></div>}
      </section>
    </main>
  );
}
