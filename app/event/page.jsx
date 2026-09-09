"use client";

const EVENTS = [
  {
    id: "pendakian-bersama",
    type: "PENDAKIAN BERSAMA",
    title: "Pendakian Bersama",
    copy: "Agenda pendakian terbuka untuk bertemu, belajar, dan berjalan bersama komunitas Oxygen Gear.",
    status: "SEGERA HADIR",
  },
  {
    id: "ekspedisi",
    type: "EKSPEDISI",
    title: "Ekspedisi",
    copy: "Perjalanan eksplorasi dengan persiapan dan karakter rute yang lebih khusus.",
    status: "SEGERA HADIR",
  },
  {
    id: "private-trip",
    type: "PRIVATE TRIP",
    title: "Private Trip Papandayan",
    copy: "Trip eksklusif kelompok kecil dengan rute yang disesuaikan dengan kemampuan tim.",
    status: "TERSEDIA",
    href: "/private-trip",
  },
];

export default function EventPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0b0a", color: "#f7f6f3", fontFamily: "Arial,Helvetica,sans-serif" }}>
      <div style={{ background: "#e1261c", padding: "9px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: ".08em" }}>
        OXYGEN GEAR · EVENT
      </div>
      <header style={{ borderBottom: "1px solid #302e29", padding: "22px 24px" }}>
        <a href="/" style={{ color: "inherit", textDecoration: "none", fontWeight: 900, letterSpacing: ".05em" }}>← OXYGEN GEAR</a>
      </header>
      <section style={{ width: "min(1100px,calc(100% - 48px))", margin: "0 auto", padding: "80px 0" }}>
        <p style={{ color: "#e1261c", fontFamily: "monospace", fontSize: 11, letterSpacing: ".12em" }}>01 / EVENT</p>
        <h1 style={{ fontSize: "clamp(48px,8vw,96px)", lineHeight: .9, letterSpacing: "-.06em", margin: "0 0 24px" }}>GO FURTHER<br /><span style={{ color: "#e1261c" }}>TOGETHER.</span></h1>
        <p style={{ maxWidth: 620, color: "#8b887f", lineHeight: 1.7 }}>Semua kegiatan Oxygen Gear dikumpulkan di sini: pendakian bersama, ekspedisi, dan private trip.</p>
        <div style={{ display: "grid", gap: 14, marginTop: 55 }}>
          {EVENTS.map((event) => (
            <article id={event.id} key={event.id} style={{ border: "1px solid #302e29", padding: 28, background: "#151412", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end" }}>
              <div>
                <div style={{ color: "#8b887f", fontFamily: "monospace", fontSize: 10, letterSpacing: ".1em" }}>{event.type}</div>
                <h2 style={{ margin: "8px 0", fontSize: 28 }}>{event.title}</h2>
                <p style={{ margin: 0, maxWidth: 650, color: "#8b887f", fontSize: 13, lineHeight: 1.6 }}>{event.copy}</p>
              </div>
              {event.href ? (
                <a href={event.href} style={{ display: "inline-flex", padding: "12px 16px", background: "#f7f6f3", color: "#0b0b0a", fontWeight: 800, fontSize: 11, textDecoration: "none" }}>LIHAT PRIVATE TRIP →</a>
              ) : (
                <span style={{ color: "#8b887f", fontFamily: "monospace", fontSize: 10 }}>{event.status}</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
