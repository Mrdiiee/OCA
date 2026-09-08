"use client";

import { useState, useMemo } from "react";

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
    blurb:
      "Keril utama untuk pendakian multi-hari. Dirancang agar beban tetap dekat ke punggung, dengan akses cepat ke kompartemen bawah.",
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
    blurb:
      "Vest ringan untuk trail running dan fastpacking jarak menengah. Pas di badan, minim guncangan saat berlari.",
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
  blurb:
    "Trip eksklusif kelompok kecil dengan rute yang bisa disesuaikan dengan kemampuan tim. Cocok untuk yang ingin naik gunung tanpa keramaian open trip.",
};

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

function ContourLines({ opacity = 0.14 }) {
  const paths = [
    "M-50,120 C150,40 350,200 550,90 S900,10 1050,110",
    "M-50,220 C180,140 330,300 560,190 S900,120 1050,210",
    "M-50,320 C160,260 360,400 570,290 S900,230 1050,310",
    "M-50,20 C140,-40 340,100 540,-10 S880,-70 1050,10",
  ];
  return (
    <svg
      viewBox="0 0 1000 380"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
      }}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#F7F6F3"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export default function OxygenGearSite() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty + delta } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const total = useMemo(
    () => cart.reduce((sum, p) => sum + p.price * p.qty, 0),
    [cart]
  );
  const itemCount = cart.reduce((sum, p) => sum + p.qty, 0);

  const submitOrder = (e) => {
    e.preventDefault();
    setConfirmed(true);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .oxy-btn { transition: background-color .15s ease, color .15s ease, border-color .15s ease; cursor: pointer; }
        .oxy-btn-primary:hover { background: #E1261C !important; color: #F7F6F3 !important; border-color: #E1261C !important; }
        .oxy-btn-ghost:hover { border-color: #E1261C !important; color: #E1261C !important; }
        .oxy-card { transition: border-color .15s ease; }
        .oxy-card:hover { border-color: #8C897F; }
        .oxy-qty-btn:hover { background: #2E2C28; }
        @media (max-width: 780px) {
          .oxy-hero-title { font-size: 58px !important; }
          .oxy-grid-2 { grid-template-columns: 1fr !important; }
          .oxy-nav-links { display: none !important; }
        }
      `}</style>

      {/* NAV */}
      <header style={styles.nav}>
        <div style={styles.navMark}>
          <span style={styles.navMarkSwatch} />
          OXYGEN GEAR
        </div>
        <nav className="oxy-nav-links" style={styles.navLinks}>
          <a href="#produk" style={styles.navLink}>Produk</a>
          <a href="#trip" style={styles.navLink}>Private Trip</a>
          <a href="#tentang" style={styles.navLink}>Tentang</a>
          <a href="#kontak" style={styles.navLink}>Kontak</a>
        </nav>
        <button
          className="oxy-btn"
          onClick={() => setCartOpen(true)}
          style={styles.cartBtn}
        >
          Keranjang ({itemCount})
        </button>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <ContourLines />
        <div style={styles.heroInner}>
          <div style={styles.heroTag}>ALT 2350 MDPL — SIAP TURUN LAPANGAN</div>
          <h1 className="oxy-hero-title" style={styles.heroTitle}>
            Peralatan untuk
            <br />
            perjalanan yang
            <br />
            lebih jauh.
          </h1>
          <p style={styles.heroSub}>
            Oxygen Gear Equipment membuat perlengkapan teknis dan
            menyelenggarakan trip privat untuk mereka yang serius soal medan
            terbuka.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#produk" className="oxy-btn oxy-btn-primary" style={styles.btnPrimary}>
              Lihat produk
            </a>
            <a href="#trip" className="oxy-btn oxy-btn-ghost" style={styles.btnGhost}>
              Jasa private trip
            </a>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="produk" style={styles.section}>
        <div style={styles.sectionHead}>
          <span style={styles.sectionIndex}>01</span>
          <h2 style={styles.sectionTitle}>Perlengkapan</h2>
        </div>
        <div style={styles.productGrid}>
          {PRODUCTS.map((p) => (
            <div key={p.id} className="oxy-card" style={styles.productCard}>
              <div style={styles.productPhoto}>
                <ContourLines opacity={0.5} />
                <span style={styles.productPhotoLabel}>{p.kind}</span>
              </div>
              <div style={styles.productCode}>{p.code}</div>
              <h3 style={styles.productName}>{p.name}</h3>
              <p style={styles.productBlurb}>{p.blurb}</p>
              <dl style={styles.specList}>
                {p.specs.map(([k, v]) => (
                  <div key={k} style={styles.specRow}>
                    <dt style={styles.specKey}>{k}</dt>
                    <dd style={styles.specVal}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div style={styles.productFooter}>
                <span style={styles.price}>{fmt(p.price)}</span>
                <button
                  className="oxy-btn oxy-btn-primary"
                  style={styles.btnPrimarySmall}
                  onClick={() => addToCart(p)}
                >
                  Tambah ke keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRIP */}
      <section id="trip" style={{ ...styles.section, borderTop: "1px solid #2E2C28" }}>
        <div style={styles.sectionHead}>
          <span style={styles.sectionIndex}>02</span>
          <h2 style={styles.sectionTitle}>Private Trip</h2>
        </div>
        <div className="oxy-grid-2" style={styles.tripGrid}>
          <div style={styles.tripPhoto}>
            <ContourLines opacity={0.5} />
            <span style={styles.productPhotoLabel}>{TRIP.kind}</span>
          </div>
          <div>
            <div style={styles.productCode}>{TRIP.code}</div>
            <h3 style={styles.productName}>{TRIP.name}</h3>
            <p style={styles.productBlurb}>{TRIP.blurb}</p>
            <dl style={styles.specList}>
              {TRIP.specs.map(([k, v]) => (
                <div key={k} style={styles.specRow}>
                  <dt style={styles.specKey}>{k}</dt>
                  <dd style={styles.specVal}>{v}</dd>
                </div>
              ))}
            </dl>
            <div style={styles.productFooter}>
              <span style={styles.price}>
                {fmt(TRIP.price)}{" "}
                <span style={{ color: "#8C897F", fontSize: 14 }}>
                  / {TRIP.unit}
                </span>
              </span>
              <button
                className="oxy-btn oxy-btn-primary"
                style={styles.btnPrimarySmall}
                onClick={() => addToCart(TRIP)}
              >
                Pesan trip
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="tentang" style={{ ...styles.section, borderTop: "1px solid #2E2C28" }}>
        <div style={styles.sectionHead}>
          <span style={styles.sectionIndex}>03</span>
          <h2 style={styles.sectionTitle}>Tentang</h2>
        </div>
        <p style={styles.aboutText}>
          Oxygen Gear Equipment dimulai dari kebutuhan sederhana: perlengkapan
          yang bisa diandalkan di medan yang tidak mudah. Kami merancang
          setiap unit untuk teruji di lapangan, bukan hanya di etalase — dan
          memandu trip langsung bagi mereka yang ingin pergi lebih jauh
          bersama tim kecil.
        </p>
      </section>

      {/* FOOTER */}
      <footer id="kontak" style={styles.footer}>
        <div style={styles.navMark}>
          <span style={styles.navMarkSwatch} />
          OXYGEN GEAR
        </div>
        <div style={styles.footerEst}>EST 2020</div>
        <div style={styles.footerCols}>
          <div>
            <div style={styles.footerHead}>Kontak</div>
            <div style={styles.footerText}>hello@oxygengear.co</div>
            <div style={styles.footerText}>+62 83856834372</div>
          </div>
          <div>
            <div style={styles.footerHead}>Ikuti</div>
            <div style={styles.footerText}>Instagram</div>
            <div style={styles.footerText}>TikTok</div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          © {new Date().getFullYear()} Oxygen Gear Equipment. Data kontak &
          harga di halaman ini contoh awal — akan diperbarui.
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div style={styles.overlay} onClick={() => setCartOpen(false)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHead}>
              <span style={styles.drawerTitle}>Keranjang</span>
              <button style={styles.closeBtn} onClick={() => setCartOpen(false)}>
                Tutup
              </button>
            </div>
            {cart.length === 0 ? (
              <p style={styles.emptyText}>Keranjang masih kosong.</p>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={styles.cartRow}>
                      <div>
                        <div style={styles.cartItemName}>{item.name}</div>
                        <div style={styles.cartItemPrice}>{fmt(item.price)}</div>
                      </div>
                      <div style={styles.qtyControl}>
                        <button
                          className="oxy-qty-btn"
                          style={styles.qtyBtn}
                          onClick={() => updateQty(item.id, -1)}
                        >
                          −
                        </button>
                        <span style={{ minWidth: 18, textAlign: "center" }}>
                          {item.qty}
                        </span>
                        <button
                          className="oxy-qty-btn"
                          style={styles.qtyBtn}
                          onClick={() => updateQty(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.cartTotalRow}>
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
                <button
                  className="oxy-btn oxy-btn-primary"
                  style={styles.btnPrimary}
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                >
                  Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <div
          style={styles.overlay}
          onClick={() => {
            setCheckoutOpen(false);
            setConfirmed(false);
          }}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {!confirmed ? (
              <>
                <div style={styles.drawerHead}>
                  <span style={styles.drawerTitle}>Checkout (mode uji coba)</span>
                  <button
                    style={styles.closeBtn}
                    onClick={() => setCheckoutOpen(false)}
                  >
                    Tutup
                  </button>
                </div>
                <p style={styles.emptyText}>
                  Ini form contoh. Pembayaran asli akan aktif setelah payment
                  gateway dihubungkan pada tahap berikutnya.
                </p>
                <form onSubmit={submitOrder} style={styles.form}>
                  <input
                    required
                    placeholder="Nama lengkap"
                    style={styles.input}
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                  <input
                    required
                    placeholder="Nomor WhatsApp"
                    style={styles.input}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                  <textarea
                    required
                    placeholder="Alamat pengiriman"
                    style={{ ...styles.input, minHeight: 70, resize: "vertical" }}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                  <div style={styles.cartTotalRow}>
                    <span>Total bayar</span>
                    <span>{fmt(total)}</span>
                  </div>
                  <button
                    type="submit"
                    className="oxy-btn oxy-btn-primary"
                    style={styles.btnPrimary}
                  >
                    Konfirmasi pesanan (uji coba)
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={styles.drawerTitle}>Pesanan tercatat</div>
                <p style={styles.emptyText}>
                  Ini simulasi checkout — belum ada transaksi nyata. Setelah
                  payment gateway aktif, pelanggan akan menerima instruksi
                  pembayaran di langkah ini.
                </p>
                <button
                  className="oxy-btn oxy-btn-ghost"
                  style={styles.btnGhost}
                  onClick={() => {
                    setCheckoutOpen(false);
                    setConfirmed(false);
                    setCart([]);
                  }}
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: "#0B0B0A",
    color: "#F7F6F3",
    minHeight: "100vh",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 32px",
    borderBottom: "1px solid #2E2C28",
  },
  navMark: {
    fontFamily: "'Anton', sans-serif",
    fontSize: 20,
    letterSpacing: "0.02em",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  navMarkSwatch: {
    width: 14,
    height: 14,
    background: "#E1261C",
    display: "inline-block",
  },
  footerEst: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    color: "#8C897F",
    marginTop: 8,
  },
  navLinks: { display: "flex", gap: 28 },
  navLink: {
    color: "#D9D7D0",
    textDecoration: "none",
    fontSize: 15,
  },
  cartBtn: {
    background: "transparent",
    color: "#F7F6F3",
    border: "1px solid #8C897F",
    borderRadius: 2,
    padding: "8px 14px",
    fontSize: 14,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    padding: "96px 32px 110px",
    borderBottom: "1px solid #2E2C28",
  },
  heroInner: { position: "relative", maxWidth: 640 },
  heroTag: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    color: "#8C897F",
    marginBottom: 22,
    letterSpacing: "0.03em",
  },
  heroTitle: {
    fontFamily: "'Anton', sans-serif",
    fontWeight: 800,
    fontSize: 76,
    lineHeight: 0.98,
    margin: "0 0 22px",
  },
  heroSub: {
    fontSize: 17,
    lineHeight: 1.6,
    color: "#D9D7D0",
    maxWidth: 480,
    margin: "0 0 32px",
  },
  btnPrimary: {
    background: "#F7F6F3",
    color: "#0B0B0A",
    border: "1px solid #F7F6F3",
    borderRadius: 2,
    padding: "13px 22px",
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center",
  },
  btnPrimarySmall: {
    background: "#F7F6F3",
    color: "#0B0B0A",
    border: "1px solid #F7F6F3",
    borderRadius: 2,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 500,
  },
  btnGhost: {
    background: "transparent",
    color: "#D9D7D0",
    border: "1px solid #8C897F",
    borderRadius: 2,
    padding: "13px 22px",
    fontSize: 15,
    textDecoration: "none",
    display: "inline-block",
  },
  section: { padding: "70px 32px" },
  sectionHead: {
    display: "flex",
    alignItems: "baseline",
    gap: 14,
    marginBottom: 40,
  },
  sectionIndex: {
    fontFamily: "'IBM Plex Mono', monospace",
    color: "#E1261C",
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: "'Anton', sans-serif",
    fontWeight: 700,
    fontSize: 34,
    margin: 0,
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 28,
    maxWidth: 1100,
  },
  productCard: {
    border: "1px solid #2E2C28",
    borderRadius: 2,
    padding: 22,
  },
  productPhoto: {
    position: "relative",
    height: 150,
    background: "#151412",
    borderRadius: 2,
    marginBottom: 18,
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  productPhotoLabel: {
    position: "relative",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    color: "#8C897F",
    padding: 10,
  },
  productCode: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: "#8C897F",
    marginBottom: 6,
  },
  productName: {
    fontFamily: "'Anton', sans-serif",
    fontWeight: 700,
    fontSize: 26,
    margin: "0 0 8px",
  },
  productBlurb: {
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "#D9D7D0",
    margin: "0 0 16px",
  },
  specList: { margin: "0 0 20px" },
  specRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "7px 0",
    borderTop: "1px solid #2E2C28",
    fontSize: 13.5,
  },
  specKey: { color: "#8C897F", margin: 0 },
  specVal: { margin: 0 },
  productFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  price: { fontSize: 17, fontWeight: 600 },
  tripGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.1fr",
    gap: 40,
    maxWidth: 1100,
    alignItems: "start",
  },
  tripPhoto: {
    position: "relative",
    height: 260,
    background: "#151412",
    borderRadius: 2,
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  aboutText: {
    fontSize: 19,
    lineHeight: 1.7,
    color: "#D9D7D0",
    maxWidth: 640,
  },
  footer: {
    padding: "50px 32px 30px",
    borderTop: "1px solid #2E2C28",
  },
  footerCols: {
    display: "flex",
    gap: 60,
    margin: "26px 0 40px",
  },
  footerHead: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    color: "#8C897F",
    marginBottom: 10,
  },
  footerText: { fontSize: 14.5, color: "#D9D7D0", marginBottom: 4 },
  footerBottom: { fontSize: 12.5, color: "#6B6963" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 50,
  },
  drawer: {
    background: "#0B0B0A",
    borderLeft: "1px solid #2E2C28",
    width: "min(380px, 100%)",
    height: "100%",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modal: {
    margin: "auto",
    background: "#0B0B0A",
    border: "1px solid #2E2C28",
    borderRadius: 2,
    width: "min(420px, 92%)",
    padding: 26,
  },
  drawerHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerTitle: {
    fontFamily: "'Anton', sans-serif",
    fontWeight: 700,
    fontSize: 22,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#8C897F",
    fontSize: 14,
    cursor: "pointer",
  },
  emptyText: { color: "#8C897F", fontSize: 14, lineHeight: 1.6 },
  cartRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #2E2C28",
  },
  cartItemName: { fontSize: 15, marginBottom: 4 },
  cartItemPrice: { fontSize: 13, color: "#8C897F" },
  qtyControl: { display: "flex", alignItems: "center", gap: 10 },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 2,
    border: "1px solid #2E2C28",
    background: "transparent",
    color: "#F7F6F3",
    fontSize: 15,
    cursor: "pointer",
  },
  cartTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 16,
    fontWeight: 600,
    padding: "10px 0",
  },
  form: { display: "flex", flexDirection: "column", gap: 12, marginTop: 14 },
  input: {
    background: "#151412",
    border: "1px solid #2E2C28",
    borderRadius: 2,
    padding: "11px 12px",
    color: "#F7F6F3",
    fontSize: 14.5,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
};
