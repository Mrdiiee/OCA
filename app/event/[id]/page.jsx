"use client";

import { notFound } from "next/navigation";

const EVENTS = {
  "pendakian-bersama": {
    type: "PENDAKIAN BERSAMA",
    title: "Pendakian Bersama",
    subtitle: "Berjalan lebih jauh, bersama lebih banyak cerita.",
    description: "Pendakian terbuka untuk siapa saja yang ingin menikmati jalur, belajar di lapangan, dan bertemu dengan orang-orang yang punya semangat yang sama.",
    status: "SEGERA HADIR",
    meta: [["FORMAT", "OPEN GROUP"], ["LEVEL", "MENENGAH"], ["DURASI", "1–2 HARI"], ["KUOTA", "AKAN DIBUKA"]],
    sections: [
      ["APA YANG KAMI BAWA", "Ritme perjalanan yang terukur, briefing sebelum berangkat, koordinasi selama perjalanan, dan ruang untuk menikmati perjalanan tanpa terburu-buru."],
      ["UNTUK SIAPA", "Pendaki pemula sampai menengah yang siap mengikuti arahan perjalanan, menjaga ritme kelompok, dan bertanggung jawab terhadap diri sendiri maupun lingkungan."],
      ["CATATAN", "Tanggal, gunung, harga, kuota, dan detail perlengkapan akan diumumkan ketika batch pendaftaran dibuka."],
    ],
  },
  ekspedisi: {
    type: "EKSPEDISI",
    title: "Ekspedisi",
    subtitle: "Rute lebih panjang. Persiapan lebih dalam.",
    description: "Ekspedisi Oxygen Gear dirancang untuk perjalanan dengan karakter rute dan persiapan yang lebih khusus, dengan fokus pada pengalaman lapangan yang matang.",
    status: "SEGERA HADIR",
    meta: [["FORMAT", "EXPEDITION"], ["LEVEL", "ADVANCED"], ["DURASI", "MULTI-DAY"], ["KUOTA", "AKAN DIBUKA"]],
    sections: [
      ["KARAKTER PERJALANAN", "Persiapan, pembagian peran, manajemen perlengkapan, dan pengambilan keputusan menjadi bagian penting dari perjalanan."],
      ["PERSIAPAN", "Peserta akan mendapatkan informasi mengenai kebutuhan fisik, perlengkapan, logistik, dan standar keselamatan sebelum keberangkatan."],
      ["CATATAN", "Rute dan tanggal ekspedisi berikutnya akan diumumkan setelah seluruh persiapan operasional selesai."],
    ],
  },
  "private-trip": {
    type: "PRIVATE TRIP",
    title: "Private Trip Papandayan",
    subtitle: "Perjalanan yang disusun untuk kelompokmu.",
    description: "Trip eksklusif untuk kelompok kecil dengan rute dan ritme perjalanan yang dapat disesuaikan dengan kebutuhan tim.",
    status: "TERSEDIA",
    meta: [["FORMAT", "PRIVATE GROUP"], ["LEVEL", "FLEXIBLE"], ["DURASI", "CUSTOM"], ["KUOTA", "DISKUSIKAN"]],
    sections: [
      ["APA YANG BISA DISESUAIKAN", "Tanggal perjalanan, ritme, kebutuhan kelompok, titik keberangkatan, dan pendekatan perjalanan dapat dibicarakan bersama tim Oxygen Gear."],
      ["COCOK UNTUK", "Teman, keluarga, komunitas kecil, maupun tim kerja yang ingin memiliki pengalaman outdoor bersama tanpa mengikuti jadwal open trip."],
      ["MULAI DARI SINI", "Hubungi tim Oxygen Gear untuk mendiskusikan jumlah peserta, tanggal yang diinginkan, dan kebutuhan perjalanan."],
    ],
    href: "/private-trip",
  },
};

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const event = EVENTS[id];
  if (!event) notFound();

  const wrap = { width: "min(1120px,calc(100% - 48px))", margin: "0 auto" };
  const button = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "15px 20px", background: "#111", color: "#fff", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" };

  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "Arial,Helvetica,sans-serif" }}>
      <div style={{ background: "#111", color: "#fff", padding: "9px 16px", textAlign: "center", fontSize: 10, fontWeight: 800, letterSpacing: ".1em" }}>OXYGEN GEAR · EVENT DETAIL</div>
      <header style={{ borderBottom: "1px solid #e5e5e5", position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.96)", backdropFilter: "blur(14px)" }}>
        <div style={{ ...wrap, minHeight: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <a href="/event" style={{ color: "#111", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>← SEMUA EVENT</a>
          <a href="/" style={{ color: "#111", textDecoration: "none", fontSize: 12, fontWeight: 900, letterSpacing: ".06em" }}>OXYGEN GEAR</a>
        </div>
      </header>

      <section style={{ ...wrap, padding: "86px 0 70px" }}>
        <div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".12em", marginBottom: 18 }}>{event.type}</div>
        <h1 style={{ maxWidth: 950, fontSize: "clamp(48px,8vw,104px)", lineHeight: .88, letterSpacing: "-.065em", margin: "0 0 25px" }}>{event.title}</h1>
        <p style={{ maxWidth: 760, fontSize: "clamp(20px,3vw,30px)", lineHeight: 1.25, letterSpacing: "-.025em", margin: "0 0 18px" }}>{event.subtitle}</p>
        <p style={{ maxWidth: 690, color: "#666", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{event.description}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginTop: 52, borderTop: "1px solid #111", borderBottom: "1px solid #ddd" }}>
          {event.meta.map(([label, value]) => <div key={label} style={{ padding: "20px 14px 20px 0", borderRight: "1px solid #ddd", marginRight: 14 }}><div style={{ color: "#777", font: "700 9px monospace", letterSpacing: ".1em", marginBottom: 8 }}>{label}</div><div style={{ fontSize: 12, fontWeight: 800 }}>{value}</div></div>)}
        </div>
      </section>

      <section style={{ background: "#f5f5f2", borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5" }}>
        <div style={{ ...wrap, padding: "68px 0" }}>
          <div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".12em", marginBottom: 28 }}>THE EXPERIENCE</div>
          <div style={{ display: "grid", gap: 1, background: "#ddd", border: "1px solid #ddd" }}>
            {event.sections.map(([title, copy], index) => <article key={title} style={{ background: "#fff", padding: "28px 30px", display: "grid", gridTemplateColumns: "180px 1fr", gap: 28 }}><div style={{ color: "#111", fontSize: 10, fontWeight: 800, letterSpacing: ".1em" }}>0{index + 1} / {title}</div><p style={{ maxWidth: 650, color: "#555", fontSize: 13, lineHeight: 1.75, margin: 0 }}>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section style={{ ...wrap, padding: "70px 0 110px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, flexWrap: "wrap" }}>
        <div><div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".12em", marginBottom: 12 }}>NEXT STEP</div><h2 style={{ fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-.045em", margin: 0 }}>{event.status === "TERSEDIA" ? "Siap membangun perjalananmu?" : "Tunggu pembukaan event."}</h2></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {event.href && <a href={event.href} style={button}>LIHAT PRIVATE TRIP →</a>}
          <a href="/kontak" style={{ ...button, background: "#fff", color: "#111", border: "1px solid #111" }}>HUBUNGI OXYGEN GEAR</a>
        </div>
      </section>

      <style>{`@media(max-width:700px){.event-detail-meta{grid-template-columns:1fr 1fr!important}}@media(max-width:640px){main section{ }}`}</style>
    </main>
  );
}
