"use client";

import { useEffect, useState } from "react";

const EVENTS = [
  {
    id: "pendakian-bersama",
    type: "PENDAKIAN BERSAMA",
    number: "01",
    title: "Pendakian Bersama",
    copy: "Agenda pendakian terbuka untuk bertemu, belajar, dan berjalan bersama komunitas Oxygen Gear.",
    status: "SEGERA HADIR",
    meta: "OPEN GROUP",
  },
  {
    id: "ekspedisi",
    type: "EKSPEDISI",
    number: "02",
    title: "Ekspedisi",
    copy: "Perjalanan eksplorasi dengan persiapan yang lebih matang, karakter rute yang khusus, dan pengalaman yang lebih dalam.",
    status: "SEGERA HADIR",
    meta: "LIMITED GROUP",
  },
  {
    id: "private-trip",
    type: "PRIVATE TRIP",
    number: "03",
    title: "Private Trip Papandayan",
    copy: "Trip eksklusif kelompok kecil dengan rute dan ritme perjalanan yang dapat disesuaikan dengan kemampuan tim.",
    status: "TERSEDIA",
    meta: "BY REQUEST",
    href: "/private-trip",
  },
];

const FILTERS = [
  { label: "Semua", value: "semua" },
  { label: "Pendakian Bersama", value: "pendakian-bersama" },
  { label: "Ekspedisi", value: "ekspedisi" },
  { label: "Private Trip", value: "private-trip" },
];

const principles = [
  ["01", "BERJALAN", "Bukan sekadar sampai puncak. Kami percaya perjalanan adalah bagian dari pengalaman."],
  ["02", "BERSAMA", "Event dibuat untuk mempertemukan orang-orang yang punya rasa ingin tahu dan semangat yang sama."],
  ["03", "BERTANGGUNG JAWAB", "Persiapan, keselamatan, dan rasa hormat terhadap alam menjadi bagian dari setiap perjalanan."],
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

  const wrap = { width: "min(1160px, calc(100% - 40px))", margin: "0 auto" };
  const mono = { fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" };

  return (
    <main style={{ minHeight: "100vh", background: "#f7f7f5", color: "#111", fontFamily: "Arial,Helvetica,sans-serif" }}>
      <div style={{ background: "#111", color: "#fff", padding: "9px 16px", textAlign: "center", fontSize: 10, fontWeight: 800, letterSpacing: ".14em" }}>
        OXYGEN GEAR · EVENT
      </div>

      <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(247,247,245,.94)", backdropFilter: "blur(16px)", borderBottom: "1px solid #dededb" }}>
        <div style={{ ...wrap, minHeight: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <a href="/" style={{ color: "#111", textDecoration: "none", fontSize: 12, fontWeight: 900, letterSpacing: ".08em" }}>← OXYGEN GEAR</a>
          <a href="/produk" style={{ color: "#111", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".1em" }}>LIHAT PRODUK →</a>
        </div>
      </header>

      <section style={{ background: "#111", color: "#fff", overflow: "hidden" }}>
        <div style={{ ...wrap, padding: "clamp(64px,10vw,125px) 0 100px", position: "relative" }}>
          <div style={{ position: "absolute", right: "-5vw", top: "10%", width: "min(420px,45vw)", aspectRatio: "1", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", right: "8vw", top: "22%", width: "min(250px,28vw)", aspectRatio: "1", border: "1px solid rgba(225,38,28,.55)", borderRadius: "50%" }} />
          <p style={{ ...mono, color: "#e1261c", fontSize: 10, fontWeight: 700, letterSpacing: ".15em", margin: "0 0 20px" }}>01 / OXYGEN GEAR EVENT</p>
          <h1 style={{ position: "relative", fontSize: "clamp(58px,10.5vw,138px)", lineHeight: .82, letterSpacing: "-.07em", margin: 0, maxWidth: 900 }}>
            GO FURTHER<br /><span style={{ color: "#e1261c" }}>TOGETHER.</span>
          </h1>
          <div style={{ marginTop: 42, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 30, alignItems: "end", maxWidth: 900 }}>
            <p style={{ color: "#b7b7b3", fontSize: 15, lineHeight: 1.8, maxWidth: 620, margin: 0 }}>
              Kami membuat ruang untuk bertemu, berjalan, dan mengalami alam bersama. Dari pendakian komunitas sampai perjalanan yang lebih personal.
            </p>
            <span style={{ ...mono, color: "#777", fontSize: 10, letterSpacing: ".12em", whiteSpace: "nowrap" }}>EVENT / 2026</span>
          </div>
        </div>
      </section>

      <section style={{ ...wrap, padding: "70px 0 110px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginBottom: 22 }}>
          <div>
            <p style={{ ...mono, color: "#e1261c", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", margin: "0 0 10px" }}>02 / PILIH PERJALANAN</p>
            <h2 style={{ fontSize: "clamp(30px,5vw,58px)", lineHeight: .95, letterSpacing: "-.055em", margin: 0 }}>FIND YOUR<br />NEXT MOVE.</h2>
          </div>
          <p style={{ color: "#777", fontSize: 12, lineHeight: 1.6, maxWidth: 250, margin: 0, textAlign: "right" }}>Pilih format perjalanan yang paling sesuai dengan cara kamu ingin berada di luar ruang.</p>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 0", borderTop: "1px solid #dcdcd8", borderBottom: "1px solid #dcdcd8" }}>
          {FILTERS.map((filter) => {
            const selected = active === filter.value;
            return (
              <button key={filter.value} type="button" onClick={() => selectFilter(filter.value)} style={{ border: `1px solid ${selected ? "#111" : "#d2d2cf"}`, background: selected ? "#111" : "transparent", color: selected ? "#fff" : "#555", padding: "11px 15px", cursor: "pointer", whiteSpace: "nowrap", fontSize: 10, fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase" }}>
                {filter.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gap: 1, background: "#dcdcd8", border: "1px solid #dcdcd8", marginTop: 24 }}>
          {visibleEvents.map((event) => (
            <article id={event.id} key={event.id} style={{ background: "#fff", padding: "clamp(24px,5vw,48px)", display: "grid", gridTemplateColumns: "64px minmax(0,1fr) auto", gap: "clamp(18px,3vw,38px)", alignItems: "end" }}>
              <span style={{ ...mono, alignSelf: "start", color: "#b1b1ad", fontSize: 11, letterSpacing: ".1em" }}>{event.number}</span>
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                  <span style={{ ...mono, color: "#e1261c", fontSize: 10, fontWeight: 700, letterSpacing: ".12em" }}>{event.type}</span>
                  <span style={{ ...mono, color: "#999", fontSize: 9, letterSpacing: ".1em" }}>{event.meta}</span>
                </div>
                <h3 style={{ fontSize: "clamp(25px,4vw,45px)", lineHeight: .95, letterSpacing: "-.045em", margin: "11px 0 13px" }}>{event.title}</h3>
                <p style={{ maxWidth: 650, color: "#666", fontSize: 13, lineHeight: 1.75, margin: 0 }}>{event.copy}</p>
              </div>
              <div style={{ minWidth: 130, textAlign: "right" }}>
                {event.href ? (
                  <a href={event.href} style={{ display: "inline-flex", padding: "14px 17px", background: "#111", color: "#fff", textDecoration: "none", fontSize: 10, fontWeight: 800, letterSpacing: ".06em", whiteSpace: "nowrap" }}>LIHAT DETAIL →</a>
                ) : (
                  <span style={{ ...mono, color: "#777", fontSize: 9, fontWeight: 700, letterSpacing: ".08em" }}>{event.status}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ background: "#e1261c", color: "#fff" }}>
        <div style={{ ...wrap, padding: "72px 0 82px" }}>
          <p style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", margin: "0 0 15px" }}>03 / OUR WAY</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,1fr)", gap: 50, alignItems: "end" }}>
            <h2 style={{ fontSize: "clamp(38px,6vw,76px)", lineHeight: .9, letterSpacing: "-.06em", margin: 0 }}>THE OUTDOOR<br />IS BETTER<br />TOGETHER.</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, margin: 0, maxWidth: 500 }}>Event Oxygen Gear bukan hanya soal destinasi. Kami ingin membangun pengalaman yang membuat orang lebih siap, lebih dekat dengan alam, dan pulang membawa cerita.</p>
          </div>
        </div>
      </section>

      <section style={{ ...wrap, padding: "78px 0 105px" }}>
        <p style={{ ...mono, color: "#e1261c", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", margin: "0 0 15px" }}>04 / PRINCIPLES</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 1, background: "#dcdcd8", border: "1px solid #dcdcd8" }}>
          {principles.map(([number, title, copy]) => (
            <div key={number} style={{ background: "#fff", padding: "28px 25px 32px", minHeight: 190 }}>
              <span style={{ ...mono, color: "#aaa", fontSize: 10 }}>{number}</span>
              <h3 style={{ fontSize: 16, letterSpacing: ".04em", margin: "30px 0 10px" }}>{title}</h3>
              <p style={{ color: "#777", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#111", color: "#fff" }}>
        <div style={{ ...wrap, padding: "62px 0 68px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 30, flexWrap: "wrap" }}>
          <div>
            <p style={{ ...mono, color: "#e1261c", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", margin: "0 0 10px" }}>READY TO GO?</p>
            <h2 style={{ fontSize: "clamp(30px,4vw,48px)", letterSpacing: "-.05em", margin: 0 }}>YOUR NEXT ADVENTURE STARTS HERE.</h2>
          </div>
          <a href="/kontak" style={{ display: "inline-flex", background: "#fff", color: "#111", textDecoration: "none", padding: "15px 19px", fontSize: 10, fontWeight: 800, letterSpacing: ".07em", whiteSpace: "nowrap" }}>TANYAKAN EVENT →</a>
        </div>
      </section>

      <style>{`
        @media(max-width:760px){
          .event-desktop-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </main>
  );
}
