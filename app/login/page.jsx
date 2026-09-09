"use client";

import { useMemo, useState } from "react";

const PRODUCTS = [
  {
    id: "keygen-v1",
    code: "MODEL / KEYGEN-V1",
    name: "Keygen V1",
    kind: "Keril 45L",
    price: 550000,
    specs: [
      ["Kapasitas", "45 Liter"],
      ["Material", "Cordura 600D, tahan air"],
      ["Rangka", "Aluminium 7075, ringan"],
      ["Berat kosong", "1.8 kg"],
    ],
    blurb: "Keril utama untuk pendakian multi-hari. Dirancang agar beban tetap dekat ke punggung, dengan akses cepat ke kompartemen bawah.",
  },
  {
    id: "running-vest",
    code: "MODEL / RV-02",
    name: "Running Vest",
    kind: "Hidrasi 5L",
    price: 375000,
    specs: [
      ["Kapasitas", "5 Liter"],
      ["Material", "Ripstop, breathable mesh"],
      ["Kantong botol", "4 unit, akses depan"],
      ["Berat kosong", "220 gram"],
    ],
    blurb: "Vest ringan untuk trail running dan fastpacking jarak menengah. Pas di badan, minim guncangan saat berlari.",
  },
];

const TRIP = {
  id: "private-trip",
  code: "JASA / TRIP-PVT",
  name: "Private Trip",
  kind: "Gunung Papandayan · 2D1N",
  price: 1250000,
  unit: "per orang",
  specs: [
    ["Grup", "Maks. 6 orang"],
    ["Guide", "1 pemandu berpengalaman"],
    ["Termasuk", "Logistik, tenda, izin masuk"],
    ["Itinerary", "Bisa disesuaikan"],
  ],
  blurb: "Trip eksklusif kelompok kecil dengan rute yang bisa disesuaikan dengan kemampuan tim. Cocok untuk yang ingin naik gunung tanpa keramaian open trip.",
};

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

function ContourLines({ opacity = 0.18 }) {
  const paths = [
    "M-50,120 C150,40 350,200 550,90 S900,10 1050,110",
    "M-50,220 C180,140 330,300 560,190 S900,120 1050,210",
    "M-50,320 C160,260 360,400 570,290 S900,230 1050,310",
    "M-50,20 C140,-40 340,100 540,-10 S880,-70 1050,10",
    "M-50,390 C140,320 340,470 560,370 S900,310 1050,390",
  ];
  return (
    <svg viewBox="0 0 1000 380" preserveAspectRatio="none" className="contours" style={{ opacity }} aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1" />)}
    </svg>
  );
}

function ProductVisual({ label, variant = "pack" }) {
  return (
    <div className={`product-visual ${variant}`}>
      <ContourLines opacity={0.32} />
      <div className="visual-mark" aria-hidden="true">
        {variant === "vest" ? <><span className="vest-shape" /><span className="bottle bottle-a" /><span className="bottle bottle-b" /></> : <><span className="pack-shape" /><span className="pack-pocket" /><span className="pack-strap" /></>}
      </div>
      <span className="visual-label">{label}</span>
    </div>
  );
}

export default function OxygenGearSite() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === item.id);
      return found
        ? prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p)
        : [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((p) => p.id === id ? { ...p, qty: p.qty + delta } : p).filter((p) => p.qty > 0));
  };

  const total = useMemo(() => cart.reduce((sum, p) => sum + p.price * p.qty, 0), [cart]);
  const itemCount = cart.reduce((sum, p) => sum + p.qty, 0);

  const submitOrder = async (e) => {
    e.preventDefault();
    setPaying(true);
    setPayError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
          items: cart,
          total: total,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPayError(data.error || "Gagal memproses pesanan.");
        setPaying(false);
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: () => {
          setConfirmed(true);
          setPaying(false);
        },
        onPending: () => {
          setConfirmed(true);
          setPaying(false);
        },
        onError: () => {
          setPayError("Pembayaran gagal. Silakan coba lagi.");
          setPaying(false);
        },
        onClose: () => {
          setPaying(false);
        },
      });
    } catch (err) {
      setPayError("Terjadi kesalahan. Coba lagi.");
      setPaying(false);
    }
  };

  return (
    <main className="site-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        :root { --bg:#0b0b0a; --panel:#151412; --line:#2e2c28; --muted:#8c897f; --text:#f7f6f3; --soft:#d9d7d0; --accent:#e1261c; }
        * { box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { margin:0; background:var(--bg); }
        button, input, textarea { font:inherit; }
        button { cursor:pointer; }
        .site-shell { min-height:100vh; background:var(--bg); color:var(--text); font-family:'IBM Plex Sans',sans-serif; }
        .nav { position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:24px; padding:18px clamp(18px,4vw,48px); border-bottom:1px solid var(--line); background:rgba(11,11,10,.94); backdrop-filter:blur(12px); }
        .brand { display:flex; align-items:center; gap:10px; color:var(--text); text-decoration:none; font:20px 'Anton',sans-serif; letter-spacing:.02em; white-space:nowrap; }
        .brand-mark { width:14px; height:14px; background:var(--accent); display:inline-block; }
        .nav-links { display:flex; gap:28px; }
        .nav-link { color:var(--soft); text-decoration:none; font-size:14px; }
        .nav-link:hover { color:var(--text); }
        .cart-btn, .btn { border:1px solid var(--line); border-radius:2px; padding:11px 16px; color:var(--text); background:transparent; }
        .cart-btn:hover, .btn-ghost:hover { border-color:var(--accent); color:var(--accent); }
        .btn-primary { background:var(--text); color:var(--bg); border-color:var(--text); text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
        .btn-primary:hover { background:var(--accent); border-color:var(--accent); color:var(--text); }
        .btn-primary:disabled { opacity:.55; cursor:wait; }
        .hero { position:relative; min-height:650px; overflow:hidden; border-bottom:1px solid var(--line); display:flex; align-items:center; padding:90px clamp(18px,7vw,96px); }
        .hero::after { content:''; position:absolute; inset:auto 0 0; height:180px; background:linear-gradient(transparent,var(--bg)); pointer-events:none; }
        .contours { position:absolute; inset:0; width:100%; height:100%; color:#f7f6f3; pointer-events:none; }
        .hero-inner { position:relative; z-index:1; max-width:760px; }
        .eyebrow, .code, .section-index, .footer-est { font-family:'IBM Plex Mono',monospace; letter-spacing:.03em; }
        .eyebrow { color:var(--muted); font-size:12px; margin-bottom:24px; }
        .hero-title { font:normal clamp(58px,9vw,116px)/.88 'Anton',sans-serif; letter-spacing:-.015em; margin:0 0 30px; max-width:900px; }
        .hero-title em { color:var(--accent); font-style:normal; }
        .hero-sub { color:var(--soft); max-width:570px; font-size:17px; line-height:1.65; margin:0 0 34px; }
        .hero-actions { display:flex; flex-wrap:wrap; gap:10px; }
        .section { padding:84px clamp(18px,4vw,48px); border-bottom:1px solid var(--line); }
        .section-head { display:flex; align-items:baseline; gap:14px; margin-bottom:38px; }
        .section-index { color:var(--accent); font-size:13px; }
        .section-title { margin:0; font:normal 38px 'Anton',sans-serif; }
        .product-grid { max-width:1180px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:22px; }
        .product-card { border:1px solid var(--line); padding:18px; background:#0e0e0d; transition:transform .2s ease,border-color .2s ease; }
        .product-card:hover { transform:translateY(-3px); border-color:#5d5a52; }
        .product-visual, .trip-visual { position:relative; overflow:hidden; min-height:330px; background:var(--panel); color:var(--text); display:flex; align-items:flex-end; }
        .product-visual::after, .trip-visual::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.55)); }
        .visual-label { position:relative; z-index:2; padding:14px; color:var(--soft); font:11px 'IBM Plex Mono',monospace; }
        .visual-mark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:1; opacity:.92; }
        .pack-shape { width:150px; height:205px; border:2px solid #f7f6f3; border-radius:28px 28px 22px 22px; position:relative; transform:rotate(-5deg); }
        .pack-shape::before { content:''; position:absolute; width:80px; height:46px; border:2px solid #f7f6f3; border-bottom:0; border-radius:25px 25px 0 0; left:33px; top:-28px; }
        .pack-pocket { position:absolute; width:100px; height:60px; border:2px solid var(--accent); border-radius:10px; left:25px; bottom:28px; }
        .pack-strap { position:absolute; width:190px; height:80px; border-left:2px solid #f7f6f3; border-right:2px solid #f7f6f3; border-radius:40%; }
        .vest-shape { width:190px; height:210px; border:2px solid #f7f6f3; border-radius:48px 48px 25px 25px; position:relative; clip-path:polygon(20% 0,80% 0,100% 38%,84% 100%,16% 100%,0 38%); }
        .bottle { width:35px; height:75px; border:2px solid var(--accent); border-radius:9px; position:absolute; bottom:48px; }
        .bottle-a { margin-left:-120px; } .bottle-b { margin-left:120px; }
        .code { color:var(--muted); font-size:11px; margin:20px 0 6px; }
        .product-name { font:normal 30px 'Anton',sans-serif; margin:0 0 9px; }
        .product-blurb { color:var(--soft); line-height:1.6; font-size:14.5px; margin:0 0 18px; }
        .spec-list { margin:0 0 20px; }
        .spec-row { display:flex; justify-content:space-between; gap:20px; border-top:1px solid var(--line); padding:9px 0; font-size:13px; }
        .spec-key { color:var(--muted); } .spec-val { text-align:right; }
        .product-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .price { font-weight:600; font-size:17px; }
        .trip-grid { max-width:1180px; display:grid; grid-template-columns:1fr 1.1fr; gap:42px; align-items:center; }
        .trip-visual { min-height:460px; }
        .mountain { position:absolute; left:8%; right:8%; bottom:14%; height:48%; z-index:1; background:linear-gradient(135deg,transparent 50%,#2e2c28 50%) left/50% 100% no-repeat,linear-gradient(225deg,transparent 50%,#454139 50%) right/50% 100% no-repeat; clip-path:polygon(0 100%,45% 25%,58% 45%,74% 0,100% 100%); }
        .trip-copy .product-name { font-size:48px; }
        .trip-copy .product-blurb { max-width:580px; font-size:16px; }
        .about-layout { max-width:900px; }
        .about-text { color:var(--soft); font-size:clamp(22px,3vw,34px); line-height:1.35; margin:0; }
        .footer { padding:55px clamp(18px,4vw,48px) 30px; }
        .footer-grid { display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:40px; margin:45px 0 60px; }
        .footer-head { color:var(--muted); font:11px 'IBM Plex Mono',monospace; margin-bottom:12px; }
        .footer-text { color:var(--soft); font-size:14px; margin-bottom:5px; }
        .footer-link { color:var(--soft); text-decoration:none; font-size:14px; }
        .footer-bottom { border-top:1px solid var(--line); padding-top:18px; color:#6b6963; font-size:12px; display:flex; justify-content:space-between; gap:20px; }
        .overlay { position:fixed; inset:0; z-index:60; background:rgba(0,0,0,.72); display:flex; justify-content:flex-end; }
        .drawer { width:min(430px,100%); height:100%; background:var(--bg); border-left:1px solid var(--line); padding:24px; display:flex; flex-direction:column; gap:18px; }
        .modal { width:min(460px,92vw); margin:auto; background:var(--bg); border:1px solid var(--line); padding:26px; }
        .drawer-head { display:flex; align-items:center; justify-content:space-between; }
        .drawer-title { font:normal 25px 'Anton',sans-serif; }
        .close-btn { border:0; background:none; color:var(--muted); }
        .empty-text { color:var(--muted); font-size:14px; line-height:1.6; }
        .cart-list { flex:1; overflow:auto; }
        .cart-row { display:flex; align-items:center; justify-content:space-between; gap:18px; border-bottom:1px solid var(--line); padding:16px 0; }
        .cart-item-name { font-size:15px; margin-bottom:4px; } .cart-item-price { color:var(--muted); font-size:13px; }
        .qty { display:flex; align-items:center; gap:8px; } .qty button { width:28px; height:28px; border:1px solid var(--line); background:transparent; color:var(--text); } .qty button:hover { background:var(--line); }
        .total { display:flex; justify-content:space-between; padding:13px 0; font-weight:600; }
        .form { display:flex; flex-direction:column; gap:12px; margin-top:15px; }
        .input { width:100%; background:var(--panel); border:1px solid var(--line); border-radius:2px; color:var(--text); padding:12px; outline:none; }
        .input:focus { border-color:var(--muted); }
        .confirmation { text-align:center; padding:25px 5px; }
        .confirmation .drawer-title { display:block; margin-bottom:12px; }
        .feedback { margin:8px 0 0; font-size:13px; line-height:1.5; }
        .feedback.error { color:#ff716a; }
        @media(max-width:820px){ .nav-links{display:none}.hero{min-height:580px;padding:80px 20px}.product-grid,.trip-grid{grid-template-columns:1fr}.trip-visual{min-height:330px}.footer-grid{grid-template-columns:1fr 1fr}.footer-grid > :first-child{grid-column:1/-1} }
        @media(max-width:520px){ .nav{padding:15px 16px}.brand{font-size:18px}.cart-btn{padding:9px 11px;font-size:12px}.hero-title{font-size:60px}.hero-sub{font-size:15px}.section{padding:60px 16px}.section-title{font-size:32px}.product-card{padding:13px}.product-visual{min-height:280px}.trip-copy .product-name{font-size:40px}.footer{padding:45px 16px 25px}.footer-grid{grid-template-columns:1fr}.footer-grid > :first-child{grid-column:auto}.footer-bottom{flex-direction:column}.drawer{padding:18px}.spec-row{font-size:12px} }
      `}</style>

      <header className="nav">
        <a href="#top" className="brand"><span className="brand-mark" />OXYGEN GEAR</a>
        <nav className="nav-links" aria-label="Navigasi utama">
          <a className="nav-link" href="#produk">Produk</a>
          <a className="nav-link" href="#trip">Private Trip</a>
          <a className="nav-link" href="#tentang">Tentang</a>
          <a className="nav-link" href="#kontak">Kontak</a>
        </nav>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>Keranjang ({itemCount})</button>
      </header>

      <section id="top" className="hero">
        <ContourLines opacity={0.13} />
        <div className="hero-inner">
          <div className="eyebrow">ALT 2350 MDPL — SIAP TURUN LAPANGAN</div>
          <h1 className="hero-title">PERALATAN UNTUK<br />PERJALANAN YANG<br /><em>LEBIH JAUH.</em></h1>
          <p className="hero-sub">Oxygen Gear Equipment membuat perlengkapan teknis dan menyelenggarakan trip privat untuk mereka yang serius soal medan terbuka.</p>
          <div className="hero-actions">
            <a href="#produk" className="btn btn-primary">Lihat produk</a>
            <a href="#trip" className="btn btn-ghost">Jasa private trip</a>
          </div>
        </div>
      </section>

      <section id="produk" className="section">
        <div className="section-head"><span className="section-index">01</span><h2 className="section-title">Perlengkapan</h2></div>
        <div className="product-grid">
          {PRODUCTS.map((p, index) => (
            <article key={p.id} className="product-card">
              <ProductVisual label={p.kind} variant={index === 1 ? "vest" : "pack"} />
              <div className="code">{p.code}</div>
              <h3 className="product-name">{p.name}</h3>
              <p className="product-blurb">{p.blurb}</p>
              <dl className="spec-list">{p.specs.map(([k,v]) => <div className="spec-row" key={k}><dt className="spec-key">{k}</dt><dd className="spec-val">{v}</dd></div>)}</dl>
              <div className="product-footer"><span className="price">{fmt(p.price)}</span><button className="btn btn-primary" onClick={() => addToCart(p)}>Tambah ke keranjang</button></div>
            </article>
          ))}
        </div>
      </section>

      <section id="trip" className="section">
        <div className="section-head"><span className="section-index">02</span><h2 className="section-title">Private Trip</h2></div>
        <div className="trip-grid">
          <div className="trip-visual"><ContourLines opacity={0.25} /><span className="mountain" /><span className="visual-label">{TRIP.kind}</span></div>
          <div className="trip-copy">
            <div className="code">{TRIP.code}</div><h3 className="product-name">{TRIP.name}</h3><p className="product-blurb">{TRIP.blurb}</p>
            <dl className="spec-list">{TRIP.specs.map(([k,v]) => <div className="spec-row" key={k}><dt className="spec-key">{k}</dt><dd className="spec-val">{v}</dd></div>)}</dl>
            <div className="product-footer"><span className="price">{fmt(TRIP.price)} <small style={{color:"var(--muted)",fontWeight:400}}>/ {TRIP.unit}</small></span><button className="btn btn-primary" onClick={() => addToCart(TRIP)}>Pesan trip</button></div>
          </div>
        </div>
      </section>

      <section id="tentang" className="section">
        <div className="section-head"><span className="section-index">03</span><h2 className="section-title">Tentang</h2></div>
        <div className="about-layout"><p className="about-text">Oxygen Gear Equipment dimulai dari kebutuhan sederhana: perlengkapan yang bisa diandalkan di medan yang tidak mudah. Kami merancang setiap unit untuk teruji di lapangan, bukan hanya di etalase — dan memandu trip langsung bagi mereka yang ingin pergi lebih jauh bersama tim kecil.</p></div>
      </section>

      <footer id="kontak" className="footer">
        <a href="#top" className="brand"><span className="brand-mark" />OXYGEN GEAR</a>
        <div className="footer-est">EST 2020</div>
        <div className="footer-grid">
          <div><div className="footer-head">MANIFESTO</div><div className="footer-text">Built for open terrain.</div></div>
          <div><div className="footer-head">KONTAK</div><div className="footer-text">hello@oxygengear.co</div><div className="footer-text">+62 83856834372</div></div>
          <div><div className="footer-head">IKUTI</div><a className="footer-link" href="#kontak">Instagram</a><br /><a className="footer-link" href="#kontak">TikTok</a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Oxygen Gear Equipment.</span><span>Field-tested mindset.</span></div>
      </footer>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head"><span className="drawer-title">Keranjang</span><button className="close-btn" onClick={() => setCartOpen(false)}>Tutup</button></div>
        {cart.length === 0 ? <p className="empty-text">Keranjang masih kosong.</p> : <>
          <div className="cart-list">{cart.map(item => <div className="cart-row" key={item.id}><div><div className="cart-item-name">{item.name}</div><div className="cart-item-price">{fmt(item.price)}</div></div><div className="qty"><button onClick={() => updateQty(item.id,-1)}>−</button><span>{item.qty}</span><button onClick={() => updateQty(item.id,1)}>+</button></div></div>)}</div>
          <div className="total"><span>Total</span><span>{fmt(total)}</span></div><button className="btn btn-primary" onClick={() => {setCartOpen(false);setCheckoutOpen(true)}}>Checkout</button>
        </>}
      </aside></div>}

      {checkoutOpen && <div className="overlay" onClick={() => {setCheckoutOpen(false);setConfirmed(false)}}><section className="modal" onClick={(e) => e.stopPropagation()}>
        {!confirmed ? <>
          <div className="drawer-head"><span className="drawer-title">Checkout</span><button className="close-btn" onClick={() => setCheckoutOpen(false)}>Tutup</button></div>
          <p className="empty-text">Mode uji coba Sandbox. Belum ada uang asli yang terpotong.</p>
          <form className="form" onSubmit={submitOrder}>
            <input className="input" required placeholder="Nama lengkap" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} />
            <input className="input" required placeholder="Nomor WhatsApp" value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})} />
            <textarea className="input" required placeholder="Alamat pengiriman" rows={4} value={form.address} onChange={(e) => setForm({...form,address:e.target.value})} />
            <div className="total"><span>Total bayar</span><span>{fmt(total)}</span></div>
            {payError && <p className="feedback error">{payError}</p>}
            <button type="submit" className="btn btn-primary" disabled={paying}>{paying ? "MEMPROSES..." : "Konfirmasi & Bayar"}</button>
          </form>
        </> : <div className="confirmation"><span className="drawer-title">Pesanan tercatat</span><p className="empty-text">Pembayaran sedang diproses Midtrans. Kamu akan dihubungi setelah pesanan dikonfirmasi.</p><button className="btn btn-ghost" onClick={() => {setCheckoutOpen(false);setConfirmed(false);setCart([])}}>Selesai</button></div>}
      </section></div>}
    </main>
  );
}
