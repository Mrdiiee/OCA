"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const RESULTS = {
  berhasil: {
    eyebrow: "PEMBAYARAN / BERHASIL",
    title: "PEMBAYARAN\nBERHASIL.",
    text: "Pembayaran Anda telah dikonfirmasi. Pesanan akan diproses setelah status pembayaran diterima sistem.",
  },
  pending: {
    eyebrow: "PEMBAYARAN / MENUNGGU",
    title: "PEMBAYARAN\nMENUNGGU.",
    text: "Pembayaran belum terkonfirmasi. Sistem akan memeriksa status transaksi secara otomatis.",
  },
  gagal: {
    eyebrow: "PEMBAYARAN / GAGAL",
    title: "PEMBAYARAN\nGAGAL.",
    text: "Pembayaran belum berhasil. Anda dapat memeriksa pesanan dan mencoba metode pembayaran kembali bila tersedia.",
  },
};

export default function PaymentResultPage({ params, searchParams }) {
  const result = params?.result || "pending";
  const order = searchParams?.order || "";
  const [status, setStatus] = useState(result);
  const [checking, setChecking] = useState(result === "pending" && !!order);

  useEffect(() => {
    if (result !== "pending" || !order) return;

    let active = true;
    let attempts = 0;
    const check = async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/midtrans/status?order=${encodeURIComponent(order)}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok && (data.status === "paid" || data.result === "paid")) {
          setStatus("berhasil");
          setChecking(false);
          return;
        }
      } catch {}
      if (attempts >= 12) setChecking(false);
    };

    check();
    const timer = setInterval(() => {
      if (attempts >= 12) {
        clearInterval(timer);
        return;
      }
      check();
    }, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [result, order]);

  const config = RESULTS[status] || RESULTS.pending;
  const text = checking
    ? "Kami sedang memeriksa status pembayaran ke Midtrans. Halaman ini akan berubah otomatis setelah pembayaran terkonfirmasi."
    : config.text;

  return (
    <main className="payment-page">
      <section className="payment-box">
        <div className="brand-row"><span className="mark" /> OXYGEN GEAR</div>
        <div className="eyebrow">{config.eyebrow}</div>
        <h1>{config.title}</h1>
        {checking && <div className="checking">MEMERIKSA STATUS TRANSAKSI...</div>}
        <p className="text">{text}</p>
        {order && <div className="order">NOMOR PESANAN <strong>{order}</strong></div>}
        <div className="actions">
          <Link className="btn primary" href={order ? `/status-pengiriman?order=${encodeURIComponent(order)}` : "/status-pengiriman"}>LIHAT PESANAN →</Link>
          <Link className="btn secondary" href="/produk">KEMBALI KE PRODUK</Link>
        </div>
      </section>

      <style jsx>{`
        :global(*){box-sizing:border-box}
        :global(body){margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}
        .payment-page{min-height:100vh;background:#fff;display:grid;place-items:center;padding:28px 20px}
        .payment-box{width:min(760px,100%);border:1px solid #d9d9d5;background:#fff;padding:clamp(32px,6vw,72px);box-shadow:0 18px 60px rgba(0,0,0,.06)}
        .brand-row{font-weight:900;letter-spacing:.06em;font-size:12px;margin-bottom:70px}
        .mark{display:inline-block;width:12px;height:12px;background:#e1261c;margin-right:8px;vertical-align:-1px}
        .eyebrow{color:#e1261c;font:11px monospace;letter-spacing:.16em}
        h1{white-space:pre-line;font-size:clamp(54px,9vw,100px);line-height:.86;letter-spacing:-.055em;margin:18px 0 25px}
        h1::first-line{color:#e1261c}
        .checking{display:inline-block;border:1px solid #f0b4b0;color:#e1261c;padding:9px 11px;font:10px monospace;letter-spacing:.1em;margin-bottom:18px}
        .text{max-width:610px;color:#666;line-height:1.75;margin:0}
        .order{margin:30px 0;padding:16px 0;border-top:1px solid #deded9;border-bottom:1px solid #deded9;color:#777;font:10px monospace;letter-spacing:.08em;display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap}
        .order strong{color:#111;font-weight:700;letter-spacing:0}
        .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:30px}
        .btn{display:inline-block;padding:14px 18px;border:1px solid #111;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.04em;transition:.2s}
        .primary{background:#111;color:#fff}
        .secondary{background:#fff;color:#111}
        .btn:hover{background:#e1261c;border-color:#e1261c;color:#fff}
        @media(max-width:560px){.payment-page{padding:16px}.payment-box{padding:28px 22px}.brand-row{margin-bottom:48px}.actions{display:grid}.btn{text-align:center}}
      `}</style>
    </main>
  );
}
