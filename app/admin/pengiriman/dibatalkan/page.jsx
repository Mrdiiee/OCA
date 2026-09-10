'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

export default function CancelledOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/cancelled-orders', { cache: 'no-store' });
        const result = await response.json();
        if (response.status === 401 || response.status === 403) {
          window.location.replace('/admin/login');
          return;
        }
        if (!response.ok) throw new Error(result.error || 'Riwayat pembatalan gagal dimuat.');
        setOrders(result.orders || []);
      } catch (err) {
        setError(err.message || 'Riwayat pembatalan gagal dimuat.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <main className="page"><p className="loading">MEMUAT RIWAYAT PEMBATALAN...</p></main>;

  return <main className="page">
    <header className="topbar">
      <Link href="/admin" className="brand"><span className="mark" />OXYGEN GEAR / ADMIN</Link>
      <nav className="links">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/pengiriman">Kelola Pengiriman</Link>
        <Link href="/status-pengiriman">Status pelanggan</Link>
      </nav>
    </header>

    <section className="content">
      <Link href="/admin/pengiriman" className="back">← KEMBALI KE PENGIRIMAN</Link>
      <p className="eyebrow">ADMIN / ORDER HISTORY</p>
      <div className="titleRow">
        <div><h1>RIWAYAT<br/><em>DIBATALKAN.</em></h1><p className="intro">Daftar pesanan yang telah dibatalkan admin. Riwayat tetap tersimpan agar mudah ditelusuri.</p></div>
        <div className="count"><strong>{orders.length}</strong><span>PESANAN DIBATALKAN</span></div>
      </div>

      {error && <div className="notice">{error}</div>}
      {orders.length === 0 ? <section className="empty card"><h2>Belum ada pesanan dibatalkan.</h2><p>Pesanan yang dibatalkan dari Kelola Pengiriman akan muncul di sini.</p></section> :
        <div className="orders">{orders.map((order) => <article className="card order" key={order.id}>
          <div className="head"><div><span className="label">NOMOR PESANAN</span><h2>{order.order_number}</h2></div><span className="status">DIBATALKAN</span></div>
          <div className="details">
            <div><span>TOTAL</span><b>{money.format(Number(order.total_amount || 0))}</b></div>
            <div><span>DIBUAT</span><b>{new Date(order.created_at).toLocaleString('id-ID')}</b></div>
            <div><span>DIBATALKAN / DIPERBARUI</span><b>{new Date(order.updated_at || order.created_at).toLocaleString('id-ID')}</b></div>
            <div><span>USER ID</span><b>{order.user_id || '-'}</b></div>
          </div>
          <div className="footer"><span>Pesanan tidak lagi masuk ke alur pengiriman aktif.</span><Link href={`/status-pengiriman?order=${encodeURIComponent(order.order_number)}`} className="track">LIHAT STATUS →</Link></div>
        </article>)}</div>}
    </section>

    <style jsx>{`:global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif}.topbar{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px clamp(16px,5vw,60px);border-bottom:1px solid #302e29;position:sticky;top:0;background:rgba(11,11,10,.96);z-index:5}.brand{color:#f7f6f3;text-decoration:none;font-weight:800;letter-spacing:.05em}.mark{display:inline-block;width:13px;height:13px;background:#e1261c;margin-right:9px}.links{display:flex;gap:16px;flex-wrap:wrap}.links a,.back{color:#aaa69d;text-decoration:none;font-size:11px}.content{max-width:1100px;margin:auto;padding:55px 20px 100px}.back{display:inline-block;margin-bottom:45px;font:10px monospace;letter-spacing:.08em}.eyebrow,.label{font:10px monospace;color:#8b887f;letter-spacing:.08em}.eyebrow{margin-bottom:18px}.titleRow{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:40px}h1{font-size:clamp(52px,8vw,94px);line-height:.88;letter-spacing:-.04em;margin:0 0 22px}h1 em{font-style:normal;color:#e1261c}.intro{max-width:650px;color:#aaa69d;line-height:1.6;margin:0}.count{border:1px solid #302e29;background:#11110f;padding:20px 24px;min-width:190px}.count strong{display:block;font:700 34px monospace}.count span{display:block;color:#77736b;font:9px monospace;margin-top:5px}.orders{display:grid;gap:16px}.card{border:1px solid #302e29;background:#11110f}.order{padding:24px}.head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.head h2{margin:8px 0 0;font:700 21px monospace}.status{padding:8px 10px;border:1px solid #7c4b47;color:#ff8178;font:10px monospace}.details{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;border-top:1px solid #25231f;border-bottom:1px solid #25231f;padding:18px 0;margin:22px 0}.details div{display:grid;gap:7px}.details span{font:9px monospace;color:#77736b}.details b{font:11px monospace;color:#d8d5cd;word-break:break-word}.footer{display:flex;justify-content:space-between;gap:15px;align-items:center;color:#77736b;font-size:11px}.track{color:#d8d5cd;text-decoration:none;font:10px monospace}.notice{padding:14px;margin-bottom:18px;border:1px solid #7c4b47;color:#ff8178;background:#17100f;font-size:13px}.empty{padding:40px;text-align:center}.empty h2{margin:0 0 10px}.empty p{color:#aaa69d}.loading{padding:40px 20px;color:#aaa69d}@media(max-width:800px){.titleRow{align-items:flex-start;flex-direction:column}.details{grid-template-columns:1fr 1fr}}@media(max-width:600px){.head,.footer{flex-direction:column;align-items:flex-start}.details{grid-template-columns:1fr}.content{padding-top:35px}}`}</style>
  </main>;
}
