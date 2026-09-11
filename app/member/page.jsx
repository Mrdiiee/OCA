'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

const STATUS = {
  pending_payment: 'Menunggu pembayaran', paid: 'Pembayaran berhasil', processing: 'Pesanan diproses',
  packed: 'Pesanan dikemas', shipped: 'Pesanan dikirim', in_transit: 'Dalam perjalanan',
  delivered: 'Pesanan sampai', cancelled: 'Pesanan dibatalkan',
};
const money = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function MemberPage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [member, setMember] = useState(null);
  const [codeError, setCodeError] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      if (!currentUser) {
        window.location.replace('/login?next=/member');
        return;
      }
      if (!active) return;
      setUser(currentUser);

      const [{ data: profileData, error: profileError }, { data: orderData, error: orderError }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', currentUser.id).maybeSingle(),
        supabase.from('orders').select('id,order_number,status,total_amount,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3),
      ]);

      if (!active) return;
      setProfile(profileData || null);
      setOrders(orderData || []);
      if (profileError || orderError) setError('Sebagian informasi member belum dapat dimuat.');
      setLoading(false);
    }
    loadDashboard();
    return () => { active = false; };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace('/login');
  }

  async function verifyCode(event) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    setMember(null);
    setCodeError('');
    if (!normalized) {
      setCodeError('Masukkan kode member terlebih dahulu.');
      return;
    }
    setCheckingCode(true);
    try {
      const response = await fetch('/api/member/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: normalized }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Kode tidak valid.');
      setMember(data.member);
    } catch (e) {
      setCodeError(e.message || 'Kode member belum dapat diperiksa.');
    } finally {
      setCheckingCode(false);
    }
  }

  if (loading) return <main className="page"><div className="loading">MEMUAT MEMBER AREA...</div></main>;

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Member';
  const activeOrder = orders.find((order) => !['delivered', 'cancelled'].includes(order.status));
  const formattedDate = member?.date
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${member.date}T00:00:00`))
    : '-';

  return (
    <main className="page">
      <header className="topbar">
        <a href="/" className="brand"><span className="mark" />OXYGEN GEAR</a>
        <a href="/" className="back">Kembali ke beranda</a>
      </header>

      <section className="content">
        <p className="eyebrow">OXYGEN GEAR / MEMBER AREA</p>
        <div className="hero">
          <div>
            <h1>HALO,<br /><em>{name}.</em></h1>
            <p className="intro">Semua akses akun, pesanan, pengiriman, dan benefit Oxygen Gear ada di satu tempat.</p>
          </div>
          <div className="verified">{user?.email_confirmed_at ? 'EMAIL TERVERIFIKASI' : 'EMAIL BELUM TERVERIFIKASI'}</div>
        </div>

        {error && <div className="notice">{error}</div>}

        <div className="quick-grid">
          <a className="quick-card" href="/informasi-user"><span className="number">01</span><strong>INFORMASI USER</strong><small>Profil, kontak & alamat</small><b>→</b></a>
          <a className="quick-card" href="/pesanan-saya"><span className="number">02</span><strong>PESANAN SAYA</strong><small>Riwayat & pembayaran</small><b>→</b></a>
          <a className="quick-card" href={activeOrder ? `/status-pengiriman?order=${encodeURIComponent(activeOrder.order_number)}` : '/pesanan-saya'}><span className="number">03</span><strong>STATUS PENGIRIMAN</strong><small>{activeOrder ? STATUS[activeOrder.status] || activeOrder.status : 'Belum ada pengiriman aktif'}</small><b>→</b></a>
        </div>

        <section className="section">
          <div className="section-head"><div><p className="eyebrow">AKTIVITAS TERBARU</p><h2>PESANAN TERAKHIR.</h2></div><a href="/pesanan-saya">LIHAT SEMUA →</a></div>
          {!orders.length ? (
            <div className="empty">Belum ada pesanan di akun ini.<br /><a href="/produk">JELAJAHI PRODUK →</a></div>
          ) : (
            <div className="orders">{orders.map((order) => (
              <a className="order" key={order.id} href={`/status-pengiriman?order=${encodeURIComponent(order.order_number)}`}>
                <div><span className="label">{order.order_number}</span><strong>{STATUS[order.status] || order.status}</strong></div>
                <div className="order-meta"><strong>{money(order.total_amount)}</strong><span>{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span></div>
                <b>→</b>
              </a>
            ))}</div>
          )}
        </section>

        <section className="member-check">
          <div>
            <p className="eyebrow">EVENT / MEMBERSHIP</p>
            <h2>CEK KODE<br /><em>MEMBER.</em></h2>
            <p>Masukkan kode yang kamu dapatkan setelah mengikuti event Oxygen Gear untuk melihat status dan benefit.</p>
          </div>
          <div>
            <form onSubmit={verifyCode} className="code-form">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="OCA-2026-001" aria-label="Kode member" autoComplete="off" />
              <button type="submit" disabled={checkingCode}>{checkingCode ? 'MEMERIKSA...' : 'CEK KODE'}</button>
            </form>
            {codeError && <div className="code-error" role="alert">{codeError}</div>}
            {member && <article className="member-result"><div><span className="label">MEMBER TERDAFTAR</span><h3>{member.name}</h3><p>{member.event}</p></div><span className="member-status">{member.status}</span><div className="benefit"><span>{formattedDate}</span><ul>{member.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></div></article>}
          </div>
        </section>

        <div className="bottom-actions"><a href="/produk" className="btn primary">BELANJA PRODUK</a><button className="btn" onClick={logout}>KELUAR</button></div>
      </section>

      <style jsx>{`
        :global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif}.topbar{display:flex;align-items:center;justify-content:space-between;padding:20px clamp(16px,5vw,60px);border-bottom:1px solid #302e29;position:sticky;top:0;background:rgba(11,11,10,.96);backdrop-filter:blur(12px);z-index:5}.brand{color:#f7f6f3;text-decoration:none;font-weight:800;letter-spacing:.05em}.mark{display:inline-block;width:13px;height:13px;background:#e1261c;margin-right:9px}.back{color:#aaa69d;text-decoration:none;font-size:13px}.back:hover,.section-head a:hover{color:#e1261c}.content{max-width:1050px;margin:0 auto;padding:72px 20px 100px}.eyebrow,.label{font:10px monospace;color:#8b887f;letter-spacing:.14em}.eyebrow{font-size:11px;margin:0 0 16px}.hero{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:38px}h1{font-size:clamp(58px,10vw,110px);line-height:.84;letter-spacing:-.055em;margin:0}h1 em,h2 em{font-style:normal;color:#e1261c}.intro{max-width:600px;color:#bcb9b1;line-height:1.7;margin:25px 0 0}.verified{border:1px solid #383631;padding:10px 12px;color:#9c9991;font:10px monospace;white-space:nowrap}.notice{border:1px solid #5f4743;color:#ff8178;padding:14px 16px;margin-bottom:20px;font-size:13px}.quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.quick-card{position:relative;min-height:180px;padding:22px;border:1px solid #302e29;background:#11110f;color:#f7f6f3;text-decoration:none;display:flex;flex-direction:column;transition:.2s}.quick-card:hover{border-color:#e1261c;transform:translateY(-2px)}.quick-card .number{color:#77736b;font:10px monospace}.quick-card strong{font-size:17px;margin-top:auto}.quick-card small{color:#88857d;font-size:12px;margin-top:7px}.quick-card b{position:absolute;right:22px;bottom:20px;font-size:20px}.section{margin-top:70px}.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:18px}.section-head h2,.member-check h2{font-size:clamp(28px,4vw,44px);letter-spacing:-.035em;margin:5px 0 0}.section-head a{color:#aaa69d;text-decoration:none;font:10px monospace;letter-spacing:.1em}.orders{border-top:1px solid #302e29}.order{display:grid;grid-template-columns:1fr auto 24px;align-items:center;gap:20px;padding:19px 0;border-bottom:1px solid #25231f;color:#f7f6f3;text-decoration:none}.order:hover strong,.order:hover>b{color:#e1261c}.order .label{display:block;margin-bottom:7px}.order-meta{display:grid;gap:6px;text-align:right}.order-meta span{color:#77736b;font:10px monospace}.order>b{font-size:18px}.empty{border:1px solid #302e29;padding:25px;color:#88857d;line-height:1.8}.empty a{display:inline-block;margin-top:10px;color:#fff;text-decoration:none;font:10px monospace}.member-check{margin-top:70px;border:1px solid #302e29;background:#11110f;padding:28px;display:grid;grid-template-columns:.75fr 1.25fr;gap:40px}.member-check p:not(.eyebrow){color:#88857d;line-height:1.6;font-size:13px}.member-check em{font-style:normal;color:#e1261c}.code-form{display:flex;gap:9px}.code-form input{flex:1;min-width:0;border:1px solid #3a3832;background:#0b0b0a;color:#fff;padding:14px;font-size:13px;text-transform:uppercase;outline:none}.code-form input:focus{border-color:#e1261c}.code-form button{border:0;background:#f7f6f3;color:#0b0b0a;padding:14px 18px;font-weight:800;cursor:pointer}.code-form button:disabled{opacity:.5}.code-error{margin-top:12px;color:#ff8178;font-size:12px}.member-result{margin-top:16px;border:1px solid #3a3832;padding:20px;display:grid;grid-template-columns:1fr auto;gap:20px}.member-result h3{font-size:24px;margin:8px 0 4px}.member-result p{margin:0!important}.member-status{border:1px solid #555;padding:7px 9px;height:max-content;font:10px monospace}.benefit{grid-column:1/-1;border-top:1px solid #292721;padding-top:15px;color:#bcb9b1;font-size:12px}.benefit ul{margin:9px 0 0;padding-left:18px;line-height:1.8}.bottom-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}.btn{border:1px solid #3a3832;background:transparent;color:#f7f6f3;padding:13px 17px;text-decoration:none;font-weight:700;cursor:pointer}.btn:hover{border-color:#e1261c;color:#e1261c}.btn.primary{background:#f7f6f3;color:#0b0b0a;border-color:#f7f6f3}.btn.primary:hover{background:#e1261c;border-color:#e1261c;color:#fff}.loading{padding:120px 20px;color:#888;font:11px monospace;letter-spacing:.12em}@media(max-width:760px){.hero{display:block}.verified{display:inline-block;margin-top:22px}.quick-grid{grid-template-columns:1fr}.quick-card{min-height:145px}.member-check{grid-template-columns:1fr;gap:25px}.section{margin-top:52px}}@media(max-width:520px){.content{padding-top:52px}.topbar{gap:12px}.back{font-size:11px}.order{grid-template-columns:1fr auto}.order>b{display:none}.order-meta{text-align:left}.code-form{display:grid;grid-template-columns:1fr}.member-result{grid-template-columns:1fr}.benefit{grid-column:auto}}
      `}</style>
    </main>
  );
}
