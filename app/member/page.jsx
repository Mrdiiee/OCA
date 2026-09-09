"use client";

import { useState } from "react";

const SAMPLE_CODE = "OCA-2026-001";

const sampleMember = {
  name: "Member Oxygen Gear",
  event: "Pendakian Bersama — Papandayan",
  date: "12 September 2026",
  status: "AKTIF",
  benefits: ["Harga khusus member", "Akses agenda event", "Prioritas informasi event berikutnya"],
};

export default function MemberPage() {
  const [code, setCode] = useState("");
  const [member, setMember] = useState(null);
  const [error, setError] = useState("");

  function verifyCode(event) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();

    if (!normalized) {
      setMember(null);
      setError("Masukkan kode member terlebih dahulu.");
      return;
    }

    if (normalized === SAMPLE_CODE) {
      setMember(sampleMember);
      setError("");
      return;
    }

    setMember(null);
    setError("Kode belum ditemukan. Untuk contoh ini, gunakan OCA-2026-001.");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f4f2ed", color: "#151513", padding: "96px 24px 64px" }}>
      <section style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: ".16em", fontWeight: 700 }}>OXYGEN GEAR</p>
          <h1 style={{ margin: "12px 0 10px", fontSize: "clamp(40px, 7vw, 72px)", lineHeight: .95, letterSpacing: "-.04em" }}>MEMBER</h1>
          <p style={{ maxWidth: 560, margin: 0, color: "#66635c", lineHeight: 1.7 }}>
            Masukkan kode yang kamu dapatkan setelah mengikuti event Oxygen Gear untuk melihat status member dan benefit kamu.
          </p>
        </div>

        <form onSubmit={verifyCode} style={{ background: "#fff", border: "1px solid #ddd9d1", padding: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: OCA-2026-001"
            aria-label="Kode member"
            style={{ flex: "1 1 300px", minWidth: 0, border: "1px solid #c9c5bc", padding: "15px 16px", fontSize: 14, outline: "none", textTransform: "uppercase" }}
          />
          <button type="submit" style={{ border: 0, background: "#151513", color: "#fff", padding: "15px 24px", fontWeight: 700, letterSpacing: ".04em", cursor: "pointer" }}>
            CEK KODE
          </button>
        </form>

        <div style={{ marginTop: 12, color: "#8a877f", fontSize: 12 }}>
          Demo sementara: gunakan kode <strong style={{ color: "#151513" }}>{SAMPLE_CODE}</strong>
        </div>

        {error && (
          <div role="alert" style={{ marginTop: 24, padding: 16, background: "#fff", border: "1px solid #d8b9b1", color: "#8a3f32", lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {member && (
          <article style={{ marginTop: 24, background: "#151513", color: "#f7f6f3", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "start", flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, letterSpacing: ".14em", color: "#aaa69d" }}>MEMBER TERDAFTAR</p>
                <h2 style={{ margin: "10px 0 6px", fontSize: 28 }}>{member.name}</h2>
                <p style={{ margin: 0, color: "#c5c1b8" }}>{member.event}</p>
              </div>
              <span style={{ border: "1px solid #77736a", padding: "7px 10px", fontSize: 11, letterSpacing: ".1em" }}>{member.status}</span>
            </div>

            <div style={{ height: 1, background: "#35332e", margin: "24px 0" }} />
            <p style={{ margin: "0 0 16px", color: "#aaa69d", fontSize: 12 }}>EVENT</p>
            <p style={{ margin: "0 0 24px", fontSize: 16 }}>{member.date}</p>
            <p style={{ margin: "0 0 12px", color: "#aaa69d", fontSize: 12 }}>BENEFIT MEMBER</p>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
              {member.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          </article>
        )}

        <p style={{ marginTop: 34, fontSize: 12, lineHeight: 1.7, color: "#77736b" }}>
          Ini masih versi contoh. Nantinya kode akan diambil dari database berdasarkan peserta event yang benar-benar terdaftar.
        </p>
      </section>
    </main>
  );
}
