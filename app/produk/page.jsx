"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase-browser";

const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const fallbackImage = "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=85";

export default function Produk() {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [checkoutKey, setCheckoutKey] = useState("");
  const [category, setCategory] = useState("Semua");
  const [subcategory, setSubcategory] = useState("Semua");

  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem("oxygen_cart") || "[]"); if (Array.isArray(saved)) setCart(saved); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("oxygen_cart", JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const nextCategory = params.get("category") || "Semua";
      const nextSubcategory = params.get("subcategory") || "Semua";
      setCategory(nextCategory);
      setSubcategory(nextSubcategory);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  async function load() {
    try {
      const r = await fetch("/api/products", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Produk gagal dimuat.");
      setProducts(d.products || []);
      setCart((c) => c.map((i) => { const p = (d.products || []).find((x) => x.id === i.id); return p ? { ...i, ...p, qty: Math.min(i.qty, p.stock) } : null; }).filter((i) => i && i.qty > 0));
    } catch (e) { setLoadError(e.message || "Produk gagal dimuat"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); const channel = supabase.channel("oxygen-products").on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => load()).subscribe(); return () => { supabase.removeChannel(channel); }; }, [supabase]);

  function add(p) {
    if (!p.stock) { setError("Produk sedang habis."); setOpen(true); return; }
    setCart((c) => { const x = c.find((i) => i.id === p.id); if (x) { const qty = Math.min(x.qty + 1, p.stock); return c.map((i) => i.id === p.id ? { ...i, qty } : i); } return [...c, { ...p, qty: 1 }]; });
    setOpen(true); setError("");
  }
  function remove(id) { setCart((c) => c.filter((i) => i.id !== id)); }
  function changeQty(id, delta) { setCart((c) => c.map((i) => { if (i.id !== id) return i; const stock = products.find((p) => p.id === id)?.stock ?? i.stock; return { ...i, qty: Math.max(0, Math.min(i.qty + delta, stock)) }; }).filter((i) => i.qty > 0)); }

  async function startCheckout() {
    if (!cart.length) { setError("Keranjang masih kosong."); return; }
    setError(""); setCheckoutKey(crypto.randomUUID()); setCheckoutOpen(true);
    try { const r = await fetch("/api/profile", { cache: "no-store" }); if (r.ok) { const d = await r.json(); setName(d.profile?.full_name || ""); setPhone(d.profile?.phone || ""); setAddress(d.profile?.address || ""); } } catch {}
  }

  async function pay() {
    if (!name.trim() || !phone.trim() || !address.trim()) { setError("Nama, nomor HP, dan alamat wajib diisi."); return; }
    if (paying) return;
    setPaying(true); setError(""); const key = checkoutKey || crypto.randomUUID(); setCheckoutKey(key);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", "X-Checkout-Idempotency-Key": key }, body: JSON.stringify({ name, phone, address, items: cart.map((i) => ({ id: i.id, qty: i.qty })) }) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Checkout gagal."); setPaying(false); return; }
      setCheckoutOpen(false); setOpen(false);
      if (window.snap && d.token) window.snap.pay(d.token, { onClose: () => setPaying(false), onError: () => { setError("Pembayaran gagal diproses."); setOpen(true); setPaying(false); }, onSuccess: () => { setCart([]); setCheckoutKey(""); setPaying(false); window.location.href = `/pembayaran/pending?order=${encodeURIComponent(d.orderId)}`; }, onPending: () => { setCheckoutKey(""); setPaying(false); window.location.href = `/pembayaran/pending?order=${encodeURIComponent(d.orderId)}`; } });
      else { setError("Pembayaran belum siap. Silakan coba lagi."); setPaying(false); }
    } catch { setError("Tidak dapat terhubung ke server checkout."); setPaying(false); }
  }

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(products.map((p) => p.category || "Lainnya")))], [products]);
  const subcategories = useMemo(() => category === "Semua" ? ["Semua", ...Array.from(new Set(products.map((p) => p.subcategory || "Lainnya")))] : ["Semua", ...Array.from(new Set(products.filter((p) => (p.category || "Lainnya") === category).map((p) => p.subcategory || "Lainnya")))], [products, category]);
  const filtered = useMemo(() => products.filter((p) => (category === "Semua" || (p.category || "Lainnya") === category) && (subcategory === "Semua" || (p.subcategory || "Lainnya") === subcategory)), [products, category, subcategory]);
  const grouped = useMemo(() => { const map = new Map(); filtered.forEach((p) => { const key = p.category || "Lainnya"; if (!map.has(key)) map.set(key, []); map.get(key).push(p); }); return Array.from(map.entries()); }, [filtered]);
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  function chooseCategory(value) {
    setCategory(value);
    setSubcategory("Semua");
    const params = new URLSearchParams(window.location.search);
    if (value === "Semua") params.delete("category");
    else params.set("category", value);
    params.delete("subcategory");
    const query = params.toString();
    window.history.pushState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function chooseSubcategory(value) {
    setSubcategory(value);
    const params = new URLSearchParams(window.location.search);
    if (value === "Semua") params.delete("subcategory");
    else params.set("subcategory", value);
    const query = params.toString();
    window.history.pushState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  return <main className="page"><style>{`body{margin:0;background:#0b0b0a;color:#f7f6f3;font-family:Arial,sans-serif}.page{min-height:100vh;padding:40px clamp(20px,6vw,90px)}a{color:#f7f6f3}.back{display:inline-block;margin-bottom:40px;text-decoration:none}.eyebrow{color:#e1261c;font-size:12px;letter-spacing:2px}.title{font-size:clamp(52px,9vw,110px);line-height:.9;margin:12px 0 20px}.tools{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:30px 0 18px}.cartButton{border:1px solid #eee;background:#eee;color:#111;padding:12px 16px;font-weight:bold;cursor:pointer}.filters{display:flex;gap:8px;flex-wrap:wrap;overflow:auto;padding-bottom:4px}.filter{border:1px solid #393733;background:transparent;color:#bdb9b0;padding:10px 14px;cursor:pointer;white-space:nowrap;font-size:11px;letter-spacing:1px}.filter.active{background:#eee;color:#111;border-color:#eee}.subfilters{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 42px;padding-bottom:18px;border-bottom:1px solid #2e2c28}.subfilter{border:0;background:transparent;color:#777;padding:5px 0;margin-right:14px;cursor:pointer;font-size:11px}.subfilter.active{color:#fff;text-decoration:underline;text-underline-offset:5px}.categoryBlock{margin:42px 0 65px}.categoryHead{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-bottom:18px}.categoryTitle{font-size:34px;margin:0}.categoryMeta{color:#777;font-size:11px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.card{border:1px solid #2e2c28;padding:28px;background:#151412}.visual{height:300px;background:#111;overflow:hidden;border-bottom:1px solid #2e2c28;position:relative}.visual img{width:100%;height:100%;object-fit:cover;display:block}.visual img.broken{display:none}.stock{position:absolute;left:12px;top:12px;background:#e1261c;color:#fff;padding:7px 9px;font-size:10px;font-weight:bold}.name{font-size:32px;margin:24px 0 8px}.kind{color:#8c897f}.price{font-weight:bold;margin-top:25px}.description{color:#b7b3aa;line-height:1.6}.actions{display:flex;gap:8px;margin-top:20px}.btn{flex:1;padding:12px;border:1px solid #eee;background:#eee;color:#111;font-weight:bold;cursor:pointer}.secondary{background:transparent;color:#eee}.btn:hover:not(:disabled),.cartButton:hover,.checkout:hover{background:#e1261c;border-color:#e1261c;color:#fff}.btn:disabled{opacity:.45;cursor:not-allowed}.detail{display:block;margin-top:12px;text-align:center;padding:11px;border:1px solid #2e2c28;text-decoration:none;font-size:12px;letter-spacing:1px}.empty-products{color:#8c897f;padding:30px 0}.empty-filter{border:1px solid #2e2c28;padding:45px;color:#8c897f}.drawer,.modal{position:fixed;z-index:30;background:#0b0b0a;border:1px solid #2e2c28}.drawer{right:0;top:0;height:100%;width:min(460px,100%);padding:28px;box-sizing:border-box;display:flex;flex-direction:column}.modal{left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100% - 32px));max-height:90vh;overflow:auto;padding:28px;box-sizing:border-box;z-index:30}.overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:25}.drawer-head{display:flex;justify-content:space-between;align-items:center}.close{background:none;border:0;color:#aaa;cursor:pointer}.cart-list{flex:1;overflow:auto;margin-top:15px}.row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:15px 0;border-bottom:1px solid #2e2c28}.qty{display:flex;align-items:center;gap:8px}.qty button{width:28px;height:28px;background:transparent;border:1px solid #2e2c28;color:#fff;cursor:pointer}.remove{border:0;background:none;color:#e1261c;cursor:pointer;font-size:11px}.checkout{width:100%;padding:14px;border:1px solid #eee;background:#eee;color:#111;font-weight:bold;cursor:pointer}.error{border:1px solid #7c4b47;color:#ff8178;padding:12px;font-size:12px;line-height:1.5;margin:12px 0}.field{display:grid;gap:7px;margin:14px 0;font-size:11px;letter-spacing:1px;color:#aaa}.field input,.field textarea{background:#111;border:1px solid #333;color:#fff;padding:13px;font:14px Arial;resize:vertical}.summary{border-top:1px solid #2e2c28;border-bottom:1px solid #2e2c28;padding:14px 0;margin:18px 0}.summary div{display:flex;justify-content:space-between;padding:5px 0}.status{color:#8c897f;margin:-5px 0 25px}@media(max-width:700px){.grid{grid-template-columns:1fr}.page{padding:24px}.card{padding:18px}.tools{align-items:flex-start;flex-direction:column}.categoryTitle{font-size:27px}.modal{padding:20px}}`}</style>
    <a className="back" href="/">← OXYGEN GEAR</a>
    <div className="eyebrow">01 / EQUIPMENT</div>
    <h1 className="title">PRODUK.</h1>

    <div className="tools"><div className="filters">{categories.map((item) => <button key={item} type="button" className={`filter ${category === item ? "active" : ""}`} onClick={() => chooseCategory(item)}>{item.toUpperCase()}</button>)}</div><button className="cartButton" type="button" onClick={() => setOpen(true)}>KERANJANG · {count}</button></div>
    <div className="subfilters">{subcategories.map((item) => <button key={item} type="button" className={`subfilter ${subcategory === item ? "active" : ""}`} onClick={() => chooseSubcategory(item)}>{item}</button>)}</div>

    {loading ? <p className="status">Memuat produk...</p> : loadError ? <div className="error">{loadError}</div> : products.length === 0 ? <p className="empty-products">Belum ada produk aktif.</p> : !filtered.length ? <div className="empty-filter">Tidak ada produk dalam filter ini.</div> : grouped.map(([group, items]) => <section className="categoryBlock" key={group}><div className="categoryHead"><h2 className="categoryTitle">{group}</h2><span className="categoryMeta">{items.length} PRODUK</span></div><div className="grid">{items.map((p) => <article className="card" key={p.id}><div className="visual"><img src={p.image || fallbackImage} alt={p.name} onError={(e) => e.currentTarget.classList.add("broken")} />{!p.stock && <span className="stock">HABIS</span>}</div><div className="kind">{p.subcategory || "Outdoor"}</div><h2 className="name">{p.name}</h2><p className="description">{p.blurb || p.description}</p><div className="price">{fmt(p.price)}</div><div className="kind">Stok: {p.stock}</div><div className="actions"><button className="btn secondary" disabled={!p.stock} onClick={() => add(p)}>{p.stock ? "Tambah ke keranjang" : "Stok habis"}</button><button className="btn" disabled={!p.stock} onClick={() => { add(p); setTimeout(startCheckout, 0); }}>Checkout</button></div><a className="detail" href={`/produk/${encodeURIComponent(p.slug || "")}`}>LIHAT DETAIL →</a></article>)}</div></section>)}

    {open && <><div className="overlay" onClick={() => setOpen(false)} /><div className="drawer"><div className="drawer-head"><h2>Keranjang</h2><button className="close" onClick={() => setOpen(false)}>Tutup</button></div>{cart.length === 0 ? <p>Keranjang kosong.</p> : <div className="cart-list">{cart.map((i) => { const stock = products.find((p) => p.id === i.id)?.stock ?? i.stock; return <div className="row" key={i.id}><div><strong>{i.name}</strong><div className="kind">{fmt(i.price)} × {i.qty}</div><button className="remove" onClick={() => remove(i.id)}>HAPUS</button></div><div className="qty"><button disabled={i.qty <= 1} onClick={() => changeQty(i.id, -1)}>−</button><span>{i.qty}</span><button disabled={i.qty >= stock} onClick={() => changeQty(i.id, 1)}>+</button></div></div>; })}</div>}<h3 style={{ textAlign: "right" }}>Total {fmt(total)}</h3>{error && <div className="error">{error}</div>}<button className="checkout" disabled={!cart.length || paying} onClick={startCheckout}>{paying ? "Memproses..." : "Checkout"}</button></div></>}
    {checkoutOpen && <><div className="overlay" onClick={() => !paying && setCheckoutOpen(false)} /><div className="modal"><div className="drawer-head"><h2>Data Pengiriman</h2><button className="close" disabled={paying} onClick={() => setCheckoutOpen(false)}>Tutup</button></div><label className="field">NAMA<input value={name} onChange={(e) => setName(e.target.value)} /></label><label className="field">NOMOR HP<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label><label className="field">ALAMAT<textarea rows="4" value={address} onChange={(e) => setAddress(e.target.value)} /></label>{error && <div className="error">{error}</div>}<div className="summary"><div><span>Item</span><strong>{count}</strong></div><div><span>Total</span><strong>{fmt(total)}</strong></div></div><button className="checkout" disabled={paying} onClick={pay}>{paying ? "Memproses..." : "Bayar"}</button></div></>}
  </main>;
}
