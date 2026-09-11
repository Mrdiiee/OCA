'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

const STATUS = {
  pending_payment: 'Menunggu pembayaran',
  paid: 'Pembayaran berhasil',
  processing: 'Pesanan diproses',
  packed: 'Pesanan dikemas',
  shipped: 'Pesanan dikirim',
  in_transit: 'Dalam perjalanan',
  delivered: 'Pesanan sampai',
  cancelled: 'Pesanan dibatalkan',
};

const money = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '-';

export default function StatusPengirimanPage() {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState({});
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      window.location.replace('/login?next=/status-pengiriman');
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(
        'id,order_number,status,payment_status,payment_type,courier,tracking_number,estimated_delivery,total_amount,created_at,updated_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (orderError) {
      setError('Status pesanan belum dapat dimuat.');
      setLoading(false);
      return;
    }

    const safeOrders = orderData || [];
    const ids = safeOrders.map((order) => order.id);

    if (!ids.length) {
      setOrders([]);
      setEvents({});
      setItems({});
      setLoading(false);
      return;
    }

    const [eventResult, itemResult] = await Promise.all([
      supabase
        .from('order_tracking_events')
        .select('id,order_id,status,description,location,occurred_at')
        .in('order_id', ids)
        .order('occurred_at', { ascending: false }),
      supabase
        .from('order_items')
        .select('id,order_id,product_name,quantity,unit_price')
        .in('order_id', ids)
        .order('created_at', { ascending: true }),
    ]);

    const eventGroups = {};
    const itemGroups = {};

    (eventResult.data || []).forEach((event) => {
      if (!eventGroups[event.order_id]) eventGroups[event.order_id] = [];
      eventGroups[event.order_id].push(event);
    });

    (itemResult.data || []).forEach((item) => {
      if (!itemGroups[item.order_id]) itemGroups[item.order_id] = [];
      itemGroups[item.order_id].push(item);
    });

    setOrders(safeOrders);
    setEvents(eventGroups);
    setItems(itemGroups);
    setLoading(false);
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel('oxygen-orders-member')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_tracking_events' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const focus =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('order')
      : null;

  return (
    <main className="page">
      <style jsx>{`
        :global(body) { margin: 0; background: #0b0b0a; }
        .page { min-height: 100vh; background: #0b0b0a; color: #f7f6f3; font-family: Arial, sans-serif; }
        .top { display: flex; justify-content: space-between; align-items: center; padding: 20px clamp(16px, 5vw, 60px); border-bottom: 1px solid #302e29; position: sticky; top: 0; background: rgba(11,11,10,.96); backdrop-filter: blur(12px); z-index: 2; }
        .brand, .back { color: #fff; text-decoration: none; }
        .brand { font-weight: 800; letter-spacing: 1px; }
        .mark { display: inline-block; width: 13px; height: 13px; background: #e1261c; margin-right: 9px; }
        .back { color: #aaa; font-size: 13px; }
        .back:hover { color: #e1261c; }
        .content { max-width: 1050px; margin: auto; padding: 70px 20px; }
        .eyebrow, .label, .grid span, .event small, .foot { font-family: monospace; }
        .eyebrow { font-size: 11px; color: #888; letter-spacing: 2px; }
        .title { font-size: clamp(48px, 8vw, 92px); line-height: .9; margin: 12px 0 20px; }
        .title em { font-style: normal; color: #e1261c; }
        .intro { color: #bbb; line-height: 1.6; max-width: 620px; margin-bottom: 38px; }
        .orders { display: grid; gap: 18px; }
        .card { border: 1px solid #302e29; background: #111; padding: 24px; }
        .highlight { border-color: #e1261c; box-shadow: 0 0 0 1px rgba(225,38,28,.15); }
        .head { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; padding-bottom: 18px; border-bottom: 1px solid #25231f; }
        .label { font-size: 10px; color: #888; letter-spacing: 1px; }
        .orderNo { font: 700 20px monospace; margin-top: 7px; }
        .status { border: 1px solid #444; padding: 8px 10px; font: 10px monospace; }
        .status-delivered { color: #b9d5b9; border-color: #637c63; }
        .status-cancelled { color: #ff8178; border-color: #7c4b47; }
        .payment { display: flex; gap: 8px; flex-wrap: wrap; padding: 14px 0; border-bottom: 1px solid #25231f; }
        .payment span { font: 10px monospace; border: 1px solid #333; padding: 7px 9px; color: #aaa; }
        .payment .ok { color: #b9d5b9; border-color: #637c63; }
        .payment .pending { color: #ffd39a; border-color: #806a45; }
        .payment .failed { color: #ff8178; border-color: #7c4b47; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 18px 0; border-bottom: 1px solid #25231f; }
        .grid div { display: grid; gap: 6px; }
        .grid span, .item small { font-size: 10px; color: #777; }
        .grid strong { font-size: 13px; }
        .items { padding: 18px 0; border-bottom: 1px solid #25231f; }
        .item { display: flex; justify-content: space-between; gap: 15px; padding: 7px 0; font-size: 13px; }
        .timeline { padding: 18px 0; }
        .event { display: grid; grid-template-columns: 12px 1fr; gap: 13px; padding-bottom: 18px; }
        .dot { width: 9px; height: 9px; border: 1px solid #777; border-radius: 50%; margin-top: 3px; }
        .active { background: #e1261c; border-color: #e1261c; }
        .event strong { font-size: 13px; }
        .event p { margin: 4px 0; color: #bbb; font-size: 13px; line-height: 1.5; }
        .event small { color: #777; font-size: 10px; }
        .foot { display: flex; justify-content: space-between; color: #777; font-size: 10px; }
        .empty, .error { border: 1px solid #302e29; padding: 30px; color: #888; }
        .error { border-color: #7c4b47; color: #ff8178; }
        .shop { display: inline-block; margin-top: 14px; border: 1px solid #555; padding: 11px 14px; color: #fff; text-decoration: none; font: 11px monospace; }
        .shop:hover { background: #fff; color: #111; }
        @media (max-width: 700px) { .head { flex-direction: column; } .grid { grid-template-columns: 1fr; } .foot { flex-direction: column; gap: 8px; } }
      `}</style>

      <header className="top">
        <a className="brand" href="/member"><span className="mark" />OXYGEN GEAR</a>
        <a className="back" href="/pesanan-saya">← Pesanan saya</a>
      </header>

      <section className="content">
        <div className="eyebrow">MEMBER / TRACKING</div>
        <h1 className="title">STATUS<br /><em>PENGIRIMAN.</em></h1>
        <p className="intro">Pantau pembayaran, produk yang dibeli, kurir, resi, dan perjalanan pesanan secara langsung.</p>

        {loading ? (
          <p>Memuat pesanan...</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : !orders.length ? (
          <div className="empty">
            Belum ada pesanan.<br />
            <a className="shop" href="/produk">Mulai belanja →</a>
          </div>
        ) : (
          <div className="orders">
            {orders.map((order) => {
              const orderEvents = events[order.id] || [];
              const orderItems = items[order.id] || [];
              const paymentClass =
                order.payment_status === 'paid'
                  ? 'ok'
                  : order.payment_status === 'failed'
                    ? 'failed'
                    : 'pending';

              return (
                <article className={`card ${focus === order.order_number ? 'highlight' : ''}`} key={order.id}>
                  <div className="head">
                    <div>
                      <div className="label">NOMOR PESANAN</div>
                      <div className="orderNo">{order.order_number}</div>
                    </div>
                    <span className={`status status-${order.status}`}>
                      {STATUS[order.status] || order.status}
                    </span>
                  </div>

                  <div className="payment">
                    <span className={paymentClass}>
                      PEMBAYARAN: {order.payment_status === 'paid' ? 'BERHASIL' : order.payment_status === 'failed' ? 'GAGAL' : 'MENUNGGU'}
                    </span>
                    {order.payment_type && <span>METODE: {order.payment_type}</span>}
                  </div>

                  <div className="grid">
                    <div><span>TOTAL</span><strong>{money(order.total_amount)}</strong></div>
                    <div><span>KURIR</span><strong>{order.courier || 'Belum ditentukan'}</strong></div>
                    <div><span>RESI</span><strong>{order.tracking_number || 'Belum tersedia'}</strong></div>
                  </div>

                  <div className="items">
                    <div className="label">PRODUK</div>
                    {orderItems.length ? orderItems.map((item) => (
                      <div className="item" key={item.id}>
                        <span>{item.product_name} × {item.quantity}</span>
                        <strong>{money(item.unit_price * item.quantity)}</strong>
                      </div>
                    )) : <p className="event">Detail produk belum tersedia.</p>}
                  </div>

                  <div className="timeline">
                    <div className="label">TIMELINE PERJALANAN</div>
                    {orderEvents.length ? orderEvents.map((event, index) => (
                      <div className="event" key={event.id}>
                        <span className={`dot ${index === 0 ? 'active' : ''}`} />
                        <div>
                          <strong>{STATUS[event.status] || event.status}</strong>
                          <p>{event.description || 'Pembaruan status pesanan.'}</p>
                          <small>{event.location || 'Lokasi belum tersedia'} · {formatDate(event.occurred_at)}</small>
                        </div>
                      </div>
                    )) : <p className="event">Belum ada pembaruan perjalanan.</p>}
                  </div>

                  <div className="foot">
                    <span>Dibuat {formatDate(order.created_at)}</span>
                    <span>
                      {order.estimated_delivery
                        ? `Estimasi ${new Date(`${order.estimated_delivery}T00:00:00`).toLocaleDateString('id-ID', { dateStyle: 'medium' })}`
                        : ''}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
