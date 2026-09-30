"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase-browser";

const EVENT_NAMES = { "pendakian-bersama": "Pendakian Bersama", ekspedisi: "Ekspedisi", "private-trip": "Private Trip Papandayan" };
const PAYMENT_LABELS = { pending: "MENUNGGU PEMBAYARAN", authorized: "MENUNGGU OTORISASI", paid: "LUNAS", failed: "GAGAL", expired: "KEDALUWARSA", cancelled: "DIBATALKAN", refunded: "REFUND DIPROSES", partially_refunded: "REFUND SEBAGIAN" };

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function loadMidtransSnap(payment) {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    const existing = document.querySelector("script[data-oxygen-midtrans]");
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = payment.snapJsUrl;
    script.dataset.clientKey = payment.clientKey;
    script.dataset.oxygenMidtrans = "true";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function EventRegistrationPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [form, setForm] = useState({ fullName: "", phone: "", emergencyContactName: "", emergencyContactPhone: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [success, setSuccess] = useState(null);
  const [payment, setPayment] = useState(null);

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

  useEffect(() => {
    let mounted = true;
    async function loadEvent() {
      try {
        const response = await fetch("/api/events", { cache: "no-store" });
        const data = await response.json();
        if (!mounted) return;
        if (!response.ok) throw new Error(data.error || "Detail event gagal dimuat.");
        const current = (data.events || []).find(event => event.slug === id);
        if (!current) throw new Error("Event tidak ditemukan atau belum dipublikasikan.");
        setEventInfo(current);
      } catch (eventError) {
        if (mounted) setError(eventError.message || "Detail event gagal dimuat.");
      }
    }
    loadEvent();
    return () => { mounted = false; };
  }, [id]);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  function validate() {
    const name = form.fullName.trim(), phone = form.phone.trim(), emergencyName = form.emergencyContactName.trim(), emergencyPhone = form.emergencyContactPhone.trim();
    if (name.length < 2) return "Nama lengkap minimal 2 karakter.";
    if (phone.length < 8) return "Nomor HP peserta minimal 8 karakter.";
    if (emergencyName.length < 2) return "Nama kontak darurat minimal 2 karakter.";
    if (emergencyPhone.length < 8) return "Nomor HP kontak darurat minimal 8 karakter.";
    return "";
  }

  async function checkPaymentStatus(orderId = payment?.orderId) {
    if (!orderId) return;
    setPaymentBusy(true);
    setPaymentMessage("");
    try {
      const response = await fetch(`/api/midtrans/status?order=${encodeURIComponent(orderId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) { setPaymentMessage(data.error || "Status pembayaran belum dapat diperiksa."); return; }
      const nextStatus = data.status || "pending";
      setPayment(current => current ? { ...current, status: nextStatus } : current);
      if (nextStatus === "paid") {
        setSuccess(current => ({ ...current, status: "confirmed", message: "Pembayaran diterima. Pendaftaran event kamu sudah dikonfirmasi." }));
      } else {
        setPaymentMessage(nextStatus === "expired" || nextStatus === "failed" || nextStatus === "cancelled"
          ? "Pembayaran belum berhasil. Kamu dapat membuat transaksi baru."
          : "Pembayaran sedang diproses. Konfirmasi akan diperbarui otomatis setelah Midtrans mengirim statusnya.");
      }
    } catch {
      setPaymentMessage("Koneksi bermasalah saat memeriksa pembayaran.");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function openPayment(paymentDetails) {
    if (!paymentDetails?.token) return;
    setPaymentBusy(true);
    setPaymentMessage("");
    try {
      await loadMidtransSnap(paymentDetails);
      if (!window.snap) throw new Error("Widget pembayaran Midtrans belum siap.");
      window.snap.pay(paymentDetails.token, {
        onSuccess: () => checkPaymentStatus(paymentDetails.orderId),
        onPending: () => {
          setPayment(current => current ? { ...current, status: "pending" } : current);
          setPaymentMessage("Pembayaran masih menunggu penyelesaian. Kamu bisa melanjutkannya kapan saja.");
          setPaymentBusy(false);
        },
        onError: () => {
          setPaymentBusy(false);
          setPaymentMessage("Pembayaran belum berhasil. Memeriksa status transaksi...");
          checkPaymentStatus(paymentDetails.orderId);
        },
        onClose: () => {
          setPaymentMessage("Jendela pembayaran ditutup. Lanjutkan pembayaran untuk mengamankan tempatmu.");
          setPaymentBusy(false);
        },
      });
    } catch (paymentError) {
      setPaymentMessage(paymentError.message || "Pembayaran belum dapat dibuka. Silakan coba lagi.");
      setPaymentBusy(false);
    }
  }

  async function register(attemptKey) {
    setError(""); setPaymentMessage("");
    if (!user) { router.replace(`/login?next=${encodeURIComponent(`/event/${id}/daftar`)}`); return; }
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    if (!eventInfo) { setError("Detail event belum siap. Silakan muat ulang halaman."); return; }
    setSubmitting(true);
    try {
      const response = await fetch("/api/event-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: id,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          emergencyContactName: form.emergencyContactName.trim(),
          emergencyContactPhone: form.emergencyContactPhone.trim(),
          notes: form.notes.trim(),
          paymentAttemptKey: attemptKey,
        }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Pendaftaran gagal. Silakan periksa kembali data kamu."); return; }
      setSuccess({ status: data.registration?.status || "pending", message: data.message || "" });
      if (data.payment) {
        const nextPayment = { ...data.payment, status: "pending" };
        setPayment(nextPayment);
        await openPayment(nextPayment);
      } else {
        setPayment(null);
      }
    } catch {
      setError("Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    await register(crypto.randomUUID());
  }

  const inputStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #d8d8d5", background: "#fff", padding: "14px 15px", fontSize: 13, outline: "none" };
  const labelStyle = { display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".09em", marginBottom: 8 };
  const statusLabel = success?.status === "waitlist" ? "WAITLIST" : success?.status === "confirmed" ? "CONFIRMED" : "PENDING";
  const statusMessage = success?.message || (success?.status === "waitlist"
    ? "Kuota utama sedang penuh. Kamu masuk daftar tunggu dan akan dihubungi tim Oxygen Gear jika slot tersedia."
    : "Data pendaftaran kamu sudah tersimpan. Selesaikan pembayaran jika event ini berbayar.");
  const paymentRetryAvailable = ["failed", "expired", "cancelled"].includes(payment?.status);

  if (loading) return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Arial,Helvetica,sans-serif" }}>Memuat pendaftaran...</main>;

  return (
    <main style={{ minHeight: "100vh", background: "#f7f7f5", color: "#111", fontFamily: "Arial,Helvetica,sans-serif" }}>
      <div style={{ background: "#111", color: "#fff", padding: "9px 16px", textAlign: "center", fontSize: 10, fontWeight: 800, letterSpacing: ".12em" }}>OXYGEN GEAR · PENDAFTARAN EVENT</div>
      <header style={{ background: "#fff", borderBottom: "1px solid #ddd" }}><div style={{ width: "min(980px,calc(100% - 40px))", minHeight: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 15 }}><a href={`/event/${id}`} style={{ color: "#111", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>← KEMBALI KE EVENT</a><span style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".05em" }}>OXYGEN GEAR</span></div></header>
      <section style={{ width: "min(980px,calc(100% - 40px))", margin: "0 auto", padding: "68px 0 100px" }}>
        {!success ? <>
          <div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".12em", marginBottom: 14 }}>DAFTAR / {eventInfo?.title || EVENT_NAMES[id] || "EVENT"}</div>
          <h1 style={{ fontSize: "clamp(42px,7vw,82px)", lineHeight: .9, letterSpacing: "-.06em", margin: "0 0 18px", maxWidth: 760 }}>SIAP<br /><span style={{ color: "#e1261c" }}>BERANGKAT?</span></h1>
          <p style={{ color: "#666", maxWidth: 650, lineHeight: 1.75, fontSize: 14, marginBottom: 22 }}>Isi data peserta dengan benar. Data kontak darurat digunakan untuk kebutuhan keselamatan selama persiapan dan pelaksanaan perjalanan.</p>
          {eventInfo && <div style={{ maxWidth: 650, background: "#fff", border: "1px solid #ddd", padding: "16px 18px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".09em" }}>{eventInfo.title}</span>
            <span style={{ fontSize: 14, fontWeight: 800 }}>{Number(eventInfo.price) > 0 ? formatRupiah(eventInfo.price) : eventInfo.price == null ? "BIAYA DIKONFIRMASI ADMIN" : "GRATIS"}</span>
          </div>}
          {error && <div style={{ background: "#fff0ef", border: "1px solid #f0b5b0", color: "#b21d16", padding: 14, fontSize: 12, lineHeight: 1.5, marginBottom: 20 }}>{error}</div>}
          <form onSubmit={submit} noValidate style={{ background: "#fff", border: "1px solid #ddd", padding: "clamp(24px,5vw,48px)" }}><div style={{ display: "grid", gap: 25 }}>
            <div><label style={labelStyle}>NAMA LENGKAP *</label><input style={inputStyle} value={form.fullName} onChange={e => update("fullName", e.target.value)} autoComplete="name" required /></div>
            <div><label style={labelStyle}>EMAIL</label><input style={{ ...inputStyle, background: "#f3f3f1", color: "#666" }} value={user?.email || ""} readOnly /></div>
            <div><label style={labelStyle}>NOMOR HP *</label><input style={inputStyle} value={form.phone} onChange={e => update("phone", e.target.value)} autoComplete="tel" inputMode="tel" placeholder="Contoh: 081234567890" required /></div>
            <div style={{ paddingTop: 15, borderTop: "1px solid #e5e5e5" }}><div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".1em", marginBottom: 20 }}>KONTAK DARURAT</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><div><label style={labelStyle}>NAMA *</label><input style={inputStyle} value={form.emergencyContactName} onChange={e => update("emergencyContactName", e.target.value)} autoComplete="name" placeholder="Nama keluarga / kontak" required /></div><div><label style={labelStyle}>NOMOR HP *</label><input style={inputStyle} value={form.emergencyContactPhone} onChange={e => update("emergencyContactPhone", e.target.value)} inputMode="tel" placeholder="Contoh: 081234567890" required /></div></div></div>
            <div><label style={labelStyle}>CATATAN TAMBAHAN</label><textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Kondisi khusus, kebutuhan perjalanan, atau informasi lain yang perlu kami ketahui." /></div>
            <button type="submit" disabled={submitting || !user || !eventInfo} style={{ border: 0, background: submitting || !user || !eventInfo ? "#777" : "#111", color: "#fff", padding: "16px 20px", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", cursor: submitting || !user || !eventInfo ? "not-allowed" : "pointer" }}>{submitting ? "MEMPROSES..." : Number(eventInfo?.price) > 0 ? "DAFTAR & BAYAR →" : "KIRIM PENDAFTARAN →"}</button>
          </div></form>
        </> : <div style={{ background: "#111", color: "#fff", padding: "clamp(35px,7vw,75px)" }}>
          <div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".12em", marginBottom: 15 }}>OXYGEN GEAR · REGISTRATION</div>
          <h1 style={{ fontSize: "clamp(40px,7vw,76px)", lineHeight: .9, letterSpacing: "-.06em", margin: "0 0 20px" }}>{success.status === "confirmed" ? <>PAYMENT<br />CONFIRMED.</> : <>SEE YOU<br />OUT THERE.</>}</h1>
          <p style={{ color: "#bbb", maxWidth: 600, lineHeight: 1.75, fontSize: 14 }}>{statusMessage} Status: <strong style={{ color: "#fff" }}>{statusLabel}</strong>.</p>
          {payment && <div style={{ marginTop: 26, padding: 20, border: "1px solid #444", maxWidth: 620 }}>
            <div style={{ font: "700 10px monospace", letterSpacing: ".1em", color: "#aaa" }}>STATUS PEMBAYARAN</div>
            <strong style={{ display: "block", marginTop: 8, fontSize: 14 }}>{PAYMENT_LABELS[payment.status] || payment.status?.toUpperCase()}</strong>
            <div style={{ marginTop: 8, color: "#aaa", fontSize: 12 }}>Total: {formatRupiah(eventInfo?.price)}</div>
            {paymentMessage && <p role="status" style={{ color: "#ddd", fontSize: 12, lineHeight: 1.6, margin: "15px 0 0" }}>{paymentMessage}</p>}
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 18 }}>
              {payment.status !== "paid" && !paymentRetryAvailable && <button type="button" onClick={() => openPayment(payment)} disabled={paymentBusy} style={{ border: 0, background: "#fff", color: "#111", padding: "13px 16px", fontSize: 10, fontWeight: 800, letterSpacing: ".06em", cursor: paymentBusy ? "wait" : "pointer" }}>{paymentBusy ? "MEMBUKA..." : "LANJUTKAN PEMBAYARAN"}</button>}
              {paymentRetryAvailable && <button type="button" onClick={() => register(crypto.randomUUID())} disabled={submitting || paymentBusy} style={{ border: 0, background: "#fff", color: "#111", padding: "13px 16px", fontSize: 10, fontWeight: 800, letterSpacing: ".06em", cursor: submitting || paymentBusy ? "wait" : "pointer" }}>{submitting ? "MENYIAPKAN..." : "COBA PEMBAYARAN LAGI"}</button>}
              {payment.status !== "paid" && <button type="button" onClick={() => checkPaymentStatus()} disabled={paymentBusy} style={{ border: "1px solid #666", background: "transparent", color: "#fff", padding: "13px 16px", fontSize: 10, fontWeight: 800, letterSpacing: ".06em", cursor: paymentBusy ? "wait" : "pointer" }}>{paymentBusy ? "MEMERIKSA..." : "PERIKSA STATUS"}</button>}
            </div>
          </div>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 30 }}>
            <a href="/member" style={{ background: "#fff", color: "#111", padding: "15px 18px", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".07em" }}>KE MEMBER AREA →</a>
            <a href="/event" style={{ border: "1px solid #555", color: "#fff", padding: "15px 18px", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".07em" }}>LIHAT EVENT</a>
          </div>
        </div>}
      </section>
    </main>
  );
}
