'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

const STATUS_LABELS = {
  pending_payment: 'Menunggu pembayaran',
  paid: 'Pembayaran berhasil',
  processing: 'Pesanan diproses',
  packed: 'Pesanan dikemas',
  shipped: 'Pesanan dikirim',
  in_transit: 'Dalam perjalanan',
  delivered: 'Pesanan sampai',
  cancelled: 'Pesanan dibatalkan',
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function StatusPengirimanPage() {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    setLoading(true);
    setError('');

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      window.location.replace('/login?next=/status-pengiriman');
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status, courier, tracking_number, estimated_delivery, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (orderError) {
      setError('Status pesanan belum dapat dimuat. Silakan coba lagi.');
      setLoading(false);
      return;
    }

    const orderIds = (orderData || []).map((order) => order.id);
    let eventData = [];

    if (orderIds.length) {
      const result = await supabase
        .from('order_tracking_events')
        .select('id, order_id, status, description, location, occurred_at')
        .in('order_id', orderIds)
        .order('occurred_at', { ascending: false });
      if (result.error) {
        console.error('Gagal memuat tracking events:', result.error);
      } else {
        eventData = result.data || [];
      }
    }

    const grouped = {};
    eventData.forEach((event) => {
      if (!grouped[event.order_id]) grouped[event.order_id] = [];
      grouped[event.order_id].push(event);
    });

    setOrders(orderData || []);
    setEvents(grouped);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      await loadOrders();
    })();
    return () => { active = false; };
  }, [supabase]);

  if (loading) return <main className="page"><p className="loading">Memuat status pengiriman...</p></main>;

  return (
    <main className="page">
      <header className="topbar">
        <a href="/" className="brand"><span className="mark" />OXYGEN GEAR</a>
        <a href="/" className="back">Kembali ke beranda</a>
      </header>

      <section className="content">
        <p className="eyebrow">MEMBER / ORDER TRACKING</p>
        <h1>STATUS<br /><em>PENGIRIMAN.</em></h1>
        <p className="intro">Pantau pesanan Oxygen Gear kamu dari pembayaran sampai paket tiba.</p>

        {error && <div className="notice error">{error}</div>}

        {!error && orders.length === 0 && (
          <section className="empty card">
            <span className="empty-mark">+</span>
            <h2>Belum ada pesanan.</h2>
            <p>Pesanan yang sudah dibuat akan muncul di halaman ini lengkap dengan nomor order dan status pengiriman.</p>
            <a className="btn" href="/produk">BELANJA SEKARANG</a>
          </section>
        )}

        <div className="orders">
          {orders.map((order) => {
            const orderEvents = events[order.id] || [];
            const currentLabel = STATUS_LABELS[order.status] || order.status;
            return (
              <article className="order card" key={order.id}>
                <div className="order-head">
                  <div>
                    <div className="label">NOMOR PESANAN</div>
                    <h2>{order.order_number}</h2>
                  </div>
                  <span className={`status status-${order.status}`}>{currentLabel}</span>
                </div>

                <div className="meta">
                  <div><span>Kurir</span><strong>{order.courier || 'Belum ditentukan'}</strong></div>
                  <div><span>Nomor resi</span><strong className="mono">{order.tracking_number || 'Belum tersedia'}</strong></div>
                  <div><span>Estimasi tiba</span><strong>{order.estimated_delivery ? new Date(`${order.estimated_delivery}T00:00:00`).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Belum tersedia'}</strong></div>
                </div>

                <div className="timeline">
                  <div className="label">PERJALANAN PESANAN</div>
                  {orderEvents.length === 0 ? (
                    <p className="muted">Belum ada pembaruan perjalanan untuk pesanan ini.</p>
                  ) : (
                    orderEvents.map((event, index) => (
                      <div className="event" key={event.id}>
                        <span className={`dot ${index === 0 ? 'active' : ''}`} />
                        <div>
                          <strong>{STATUS_LABELS[event.status] || event.status}</strong>
                          <p>{event.description}</p>
                          <small>{event.location || 'Lokasi belum tersedia'} · {formatDate(event.occurred_at)}</small>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="order-foot">
                  <span>Dibuat {formatDate(order.created_at)}</span>
                  {order.tracking_number && <span className="tracking">RESI: {order.tracking_number}</span>}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        :global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}
        .page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:20px clamp(16px,5vw,60px);border-bottom:1px solid #302e29;position:sticky;top:0;background:rgba(11,11,10,.96);backdrop-filter:blur(12px);z-index:5}
        .brand{color:#f7f6f3;text-decoration:none;font-weight:800;letter-spacing:.05em}.mark{display:inline-block;width:13px;height:13px;background:#e1261c;margin-right:9px}
        .back{color:#aaa69d;text-decoration:none;font-size:13px}.back:hover{color:#e1261c}
        .content{max-width:1050px;margin:0 auto;padding:80px 20px 100px}.eyebrow{font:11px monospace;color:#8b887f;letter-spacing:.08em;margin:0 0 18px}
        h1{font-size:clamp(54px,9vw,100px);line-height:.88;letter-spacing:-.04em;margin:0 0 25px}h1 em{font-style:normal;color:#e1261c}.intro{max-width:620px;color:#d8d5cd;line-height:1.65;margin-bottom:45px}
        .card{border:1px solid #302e29;background:#11110f}.orders{display:grid;gap:18px}.order{padding:24px}.order-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:1px solid #25231f;padding-bottom:20px}.label{font:10px monospace;color:#8b887f;letter-spacing:.08em}.order h2{margin:8px 0 0;font:700 22px monospace;letter-spacing:.02em}.status{padding:8px 10px;border:1px solid #3c3933;color:#d8d5cd;font:10px monospace;text-transform:uppercase}.status-delivered{border-color:#637c63;color:#b9d5b9}.status-cancelled{border-color:#7c4b47;color:#ff8178}.status-shipped,.status-in_transit{border-color:#695d40;color:#e3c88a}
        .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;padding:20px 0;border-bottom:1px solid #25231f}.meta div{display:grid;gap:7px}.meta span{font:10px monospace;color:#8b887f;text-transform:uppercase}.meta strong{font-size:13px;line-height:1.45}.mono{font-family:monospace;overflow-wrap:anywhere}
        .timeline{padding:22px 0 8px}.timeline>.label{margin-bottom:18px}.event{position:relative;display:grid;grid-template-columns:14px 1fr;gap:14px;padding:0 0 20px}.dot{width:10px;height:10px;border:1px solid #68645c;margin-top:3px;border-radius:50%;background:#11110f}.dot.active{background:#e1261c;border-color:#e1261c;box-shadow:0 0 0 4px rgba(225,38,28,.08)}.event strong{font-size:13px}.event p{margin:5px 0;color:#d8d5cd;font-size:13px;line-height:1.5}.event small{color:#77736b;font-size:11px}.muted{color:#77736b;font-size:13px}
        .order-foot{display:flex;justify-content:space-between;gap:15px;padding-top:15px;border-top:1px solid #25231f;color:#77736b;font:10px monospace}.tracking{color:#aaa69d}.empty{padding:45px;text-align:center}.empty-mark{display:inline-grid;place-items:center;width:42px;height:42px;border:1px solid #3c3933;color:#e1261c;font-size:25px}.empty h2{font-size:24px;margin:18px 0 8px}.empty p{max-width:500px;margin:0 auto 24px;color:#aaa69d;line-height:1.6;font-size:13px}.btn{display:inline-block;padding:12px 16px;border:1px solid #f7f6f3;color:#f7f6f3;background:transparent;text-decoration:none;font-weight:800;font-size:11px;letter-spacing:.05em;cursor:pointer}.btn:hover{background:#e1261c;border-color:#e1261c}.notice{border:1px solid #7c4b47;background:#17100f;color:#ff8178;padding:15px;font-size:13px;margin-bottom:18px}.loading{padding:40px 20px;color:#aaa69d}
        @media(max-width:700px){.content{padding-top:55px}.order-head{flex-direction:column}.meta{grid-template-columns:1fr}.order-foot{flex-direction:column}.back{font-size:12px}}
      `}</style>
    </main>
  );
}
