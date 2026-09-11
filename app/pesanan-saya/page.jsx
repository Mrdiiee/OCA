'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

const STATUS = {
  pending_payment: 'Menunggu pembayaran', paid: 'Pembayaran berhasil', processing: 'Pesanan diproses',
  packed: 'Pesanan dikemas', shipped: 'Pesanan dikirim', in_transit: 'Dalam perjalanan',
  delivered: 'Pesanan sampai', cancelled: 'Pesanan dibatalkan',
};
const money = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const date = (value) => value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export default function PesananSayaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) { window.location.replace('/login?next=/pesanan-saya'); return; }

      const { data, error: queryError } = await supabase
        .from('orders')
        .select('id,order_number,status,payment_status,payment_type,courier,tracking_number,estimated_delivery,total_amount,created_at,updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!active) return;
      if (queryError) setError('Riwayat pesanan belum dapat dimuat.');
      else setOrders(data || []);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [supabase]);

  return (
    <main className="page">
      <header className="top"><a className="brand" href="/"><span className="mark" />OXYGEN GEAR</a><a className="back" href="/informasi-user">Profil saya</a></header>
      <section className="content">
        <p className="eyebrow">MEMBER / ORDER HISTORY</p>
        <h1>PESANAN<br /><em>SAYA.</em></h1>
        <p className="intro">Riwayat pembelian, pembayaran, kurir, resi, dan status pesanan Oxygen Gear kamu.</p>
        {loading ? <p>Memuat pesanan...</p> : error ? <div className="error">{error}</div> : !orders.length ? (
          <div className="empty">Belum ada pesanan.<br /><a className="shop" href="/produk">Mulai belanja →</a></div>
        ) : (
          <div className="orders">{orders.map((order) => (
            <article className="card" key={order.id}>
              <div className="head"><div><div className="label">NOMOR PESANAN</div><strong className="number">{order.order_number}</strong></div><span className="status">{STATUS[order.status] || order.status}</span></div>
              <div className="grid"><div><span>TOTAL</span><strong>{money(order.total_amount)}</strong></div><div><span>PEMBAYARAN</span><strong>{order.payment_status === 'paid' ? 'Berhasil' : 'Menunggu'}</strong></div><div><span>KURIR</span><strong>{order.courier || 'Belum ditentukan'}</strong></div><div><span>RESI</span><strong>{order.tracking_number || 'Belum tersedia'}</strong></div></div>
              <div className="foot"><span>Dibuat {date(order.created_at)}</span>{order.estimated_delivery && <span>Estimasi {new Date(`${order.estimated_delivery}T00:00:00`).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>}</div>
              <a className="detail" href={`/status-pengiriman?order=${encodeURIComponent(order.order_number)}`}>LIHAT DETAIL & TRACKING →</a>
            </article>
          ))}</div>
        )}
      </section>
      <style jsx>{`
        :global(body){margin:0;background:#0b0b0a}.page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,sans-serif}.top{display:flex;justify-content:space-between;padding:20px clamp(16px,5vw,60px);border-bottom:1px solid #302e29;position:sticky;top:0;background:rgba(11,11,10,.96);backdrop-filter:blur(12px);z-index:2}.brand,.back{color:#fff;text-decoration:none}.brand{font-weight:800;letter-spacing:1px}.mark{display:inline-block;width:13px;height:13px;background:#e1261c;margin-right:9px}.back{color:#aaa;font-size:13px}.content{max-width:1050px;margin:auto;padding:70px 20px 100px}.eyebrow,.label{font:10px monospace;color:#888;letter-spacing:1.5px}.eyebrow{font-size:11px;letter-spacing:2px}.content h1{font-size:clamp(50px,8vw,92px);line-height:.9;margin:12px 0 20px;letter-spacing:-.04em}.content h1 em{font-style:normal;color:#e1261c}.intro{max-width:620px;color:#bbb;line-height:1.6;margin-bottom:38px}.orders{display:grid;gap:18px}.card{border:1px solid #302e29;background:#111;padding:24px}.head{display:flex;justify-content:space-between;gap:18px;padding-bottom:18px;border-bottom:1px solid #25231f}.number{display:block;font:700 20px monospace;margin-top:8px}.status{border:1px solid #444;padding:8px 10px;height:max-content;font:10px monospace}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:20px 0;border-bottom:1px solid #25231f}.grid div{display:grid;gap:7px}.grid span{font:10px monospace;color:#777}.grid strong{font-size:13px}.foot{display:flex;justify-content:space-between;color:#777;font:10px monospace;padding:16px 0}.detail,.shop{display:inline-block;color:#fff;text-decoration:none;font:10px monospace;letter-spacing:1px}.detail:hover,.shop:hover{color:#e1261c}.empty,.error{border:1px solid #302e29;padding:30px;color:#888}.error{color:#ff8178;border-color:#7c4b47}.shop{margin-top:14px;border:1px solid #555;padding:11px 14px}.shop:hover{background:#fff;color:#111}@media(max-width:700px){.head{flex-direction:column}.grid{grid-template-columns:1fr 1fr}.foot{flex-direction:column;gap:8px}}@media(max-width:420px){.grid{grid-template-columns:1fr}.top{gap:12px}}
      `}</style>
    </main>
  );
}
