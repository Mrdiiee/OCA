"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const RESULTS = {
  berhasil: { eyebrow: "PEMBAYARAN / BERHASIL", title: "PEMBAYARAN\nBERHASIL.", text: "Pembayaran Anda telah dikonfirmasi. Pesanan akan diproses setelah status pembayaran diterima sistem." },
  pending: { eyebrow: "PEMBAYARAN / MENUNGGU", title: "PEMBAYARAN\nMENUNGGU.", text: "Pembayaran belum terkonfirmasi. Sistem akan memeriksa status transaksi secara otomatis." },
  gagal: { eyebrow: "PEMBAYARAN / GAGAL", title: "PEMBAYARAN\nGAGAL.", text: "Pembayaran belum berhasil. Anda dapat memeriksa pesanan dan mencoba metode pembayaran kembali bila tersedia." },
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

  return <main className="page"><style>{`body{margin:0;background:#0b0b0a;color:#f7f6f3;font-family:Arial,sans-serif}.page{min-height:100vh;padding:40px clamp(20px,8vw,120px);display:grid;place-items:center}.box{width:min(760px,100%);border:1px solid #302e29;background:#11110f;padding:clamp(30px,6vw,70px)}.eyebrow{font:11px monospace;letter-spacing:2px;color:#8c897f}.title{white-space:pre-line;font-size:clamp(52px,9vw,100px);line-height:.86;letter-spacing:-.05em;margin:18px 0 25px}.title::first-line{color:#e1261c}.text{max-width:600px;color:#b7b3aa;line-height:1.7}.checking{color:#e1261c;font:11px monospace;letter-spacing:1px}.order{margin:28px 0;padding:15px;border:1px solid #302e29;font:12px monospace}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:30px}.btn{display:inline-block;padding:13px 17px;border:1px solid #f7f6f3;color:#111;background:#f7f6f3;text-decoration:none;font-weight:800;font-size:11px}.secondary{background:transparent;color:#f7f6f3;border-color:#555149}.btn:hover{background:#e1261c;color:#fff;border-color:#e1261c}`}</style><section className="box"><div className="eyebrow">{config.eyebrow}</div><h1 className="title">{config.title}</h1>{checking&&<div className="checking">MEMERIKSA STATUS TRANSAKSI...</div>}<p className="text">{text}</p>{order&&<div className="order">NOMOR PESANAN · {order}</div>}<div className="actions"><Link className="btn" href={order?`/pesanan/${encodeURIComponent(order)}`:'/status-pengiriman'}>LIHAT PESANAN →</Link><Link className="btn secondary" href="/produk">KEMBALI KE PRODUK</Link></div></section></main>;
}
