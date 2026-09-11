"use client";

import { useEffect, useState } from "react";

const EVENTS = [
  { id: "pendakian-bersama", type: "PENDAKIAN BERSAMA", title: "Pendakian Bersama", copy: "Agenda pendakian terbuka untuk bertemu, belajar, dan berjalan bersama komunitas Oxygen Gear.", status: "SEGERA HADIR" },
  { id: "ekspedisi", type: "EKSPEDISI", title: "Ekspedisi", copy: "Perjalanan eksplorasi dengan persiapan dan karakter rute yang lebih khusus.", status: "SEGERA HADIR" },
  { id: "private-trip", type: "PRIVATE TRIP", title: "Private Trip Papandayan", copy: "Trip eksklusif kelompok kecil dengan rute yang disesuaikan dengan kemampuan tim.", status: "TERSEDIA", href: "/private-trip" },
];

const FILTERS = [
  { label: "Semua Event", value: "semua" },
  { label: "Pendakian Bersama", value: "pendakian-bersama" },
  { label: "Ekspedisi", value: "ekspedisi" },
  { label: "Private Trip", value: "private-trip" },
];

export default function EventPage() {
  const [active, setActive] = useState("semua");

  useEffect(() => {
    const syncHash = () => setActive(window.location.hash.replace("#", "") || "semua");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const visibleEvents = active === "semua" ? EVENTS : EVENTS.filter((event) => event.id === active);
  const selectFilter = (value) => {
    setActive(value);
    if (value === "semua") window.history.replaceState({}, "", "/event");
    else window.history.replaceState({}, "", `/event#${value}`);
  };

  const page = { minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "Arial,Helvetica,sans-serif" };
  const wrap = { width: "min(1120px,calc(100% - 48px))", margin: "0 auto" };

  return (
    <main style={page}>
      <div style={{ background: "#111", color: "#fff", padding: "9px 16px", textAlign: "center", fontSize: 10, fontWeight: 800, letterSpacing: ".1em" }}>OXYGEN GEAR · EVENT</div>
      <header style={{ borderBottom: "1px solid #e5e5e5", position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.96)", backdropFilter: "blur(14px)" }}>
        <div style={{ ...wrap, minHeight: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <a href="/" style={{ color: "#111", textDecoration: "none", fontSize: 12, fontWeight: 900, letterSpacing: ".06em" }}>← OXYGEN GEAR</a>
          <a href="/produk" style={{ color: "#111", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>LIHAT PRODUK →</a>
        </div>
      </header>

      <section style={{ ...wrap, padding: "92px 0 110px" }}>
        <p style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".12em", margin: "0 0 16px" }}>01 / EVENT</p>
        <h1 style={{ fontSize: "clamp(58px,9vw,120px)", lineHeight: .84, letterSpacing: "-.065em", margin: "0 0 25px" }}>GO FURTHER<br /><span style={{ color: "#e1261c" }}>TOGETHER.</span></h1>
        <p style={{ maxWidth: 650, color: "#666", fontSize: 15, lineHeight: 1.75, margin: 0 }}>Semua kegiatan Oxygen Gear dikumpulkan di sini: pendakian bersama, ekspedisi, dan private trip.</p>

        <div style={{ position: "sticky", top: 76, zIndex: 15, marginTop: 58, padding: "12px 0", background: "rgba(255,255,255,.94)", backdropFilter: "blur(14px)", borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
            {FILTERS.map((filter) => {
              const selected = active === filter.value;
              return <button key={filter.value} type="button" onClick={() => selectFilter(filter.value)} style={{ border: `1px solid ${selected ? "#111" : "#d9d9d9"}`, background: selected ? "#111" : "#fff", color: selected ? "#fff" : "#555", padding: "10px 14px", cursor: "pointer", whiteSpace: "nowrap", fontSize: 10, fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase" }}>{filter.label}</button>;
            })}
          </div>
        </div>

        <div style={{ display: "grid", gap: 1, background: "#e5e5e5", border: "1px solid #e5e5e5", marginTop: 26 }}>
          {visibleEvents.map((event) => <article id={event.id} key={event.id} style={{ background: "#fff", padding: "clamp(22px,4vw,30px)", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end" }}>
            <div><div style={{ color: "#e1261c", font: "700 10px monospace", letterSpacing: ".1em" }}>{event.type}</div><h2 style={{ fontSize: "clamp(22px,3vw,34px)", letterSpacing: "-.035em", margin: "9px 0" }}>{event.title}</h2><p style={{ maxWidth: 680, color: "#666", fontSize: 13, lineHeight: 1.65, margin: 0 }}>{event.copy}</p></div>
            {event.href ? <a href={event.href} style={{ display: "inline-flex", padding: "13px 16px", background: "#111", color: "#fff", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".06em", whiteSpace: "nowrap" }}>LIHAT PRIVATE TRIP →</a> : <span style={{ color: "#777", font: "700 10px monospace", letterSpacing: ".08em", whiteSpace: "nowrap" }}>{event.status}</span>}
          </article>)}
        </div>
      </section>

      <style>{`@media(max-width:700px){.event-row{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
