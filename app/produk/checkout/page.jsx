"use client";

import { useEffect, useMemo, useState } from "react";

const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [checkoutKey, setCheckoutKey] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("oxygen_cart") || "[]");
      setCart(Array.isArray(saved) ? saved.filter((item) => Number(item?.qty) > 0) : []);
    } catch { setCart([]); }
    (async () => {
      try {
        const r = await fetch("/api/profile", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          setName(d.profile?.full_name || "");
          setPhone(d.profile?.phone || "");
          setAddress(d.profile?.address || "");
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0), [cart]);

  function changeQty(id, delta) {
    setCart((items) => items.map((item) => {
      if (item.id !== id) return item;
      const stock = Number(item.stock || 0);
      return { ...item, qty: Math.max(0, Math.min(Number(item.qty || 0) + delta, stock || Number(item.qty || 0) + delta)) };
    }).filter((item) => item.qty > 0));
  }

  async function pay() {
    if (!cart.length) { setError("Keranjang masih kosong."); return; }
    if (!name.trim() || !phone.trim() || !address.trim()) { setError("Nama, nomor HP, dan alamat wajib diisi."); return; }
    if (paying) return;
    setPaying(true); setError("");
    const key = checkoutKey || crypto.randomUUID();
    setCheckoutKey(key);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Checkout-Idempotency-Key": key },
        body: JSON.stringify({ name, phone, address, items: cart.map((item) => ({ id: item.id, qty: item.qty })) }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Checkout gagal."); setPaying(false); return; }
      if (!window.snap || !d.token) { setError("Pembayaran belum siap. Silakan coba lagi."); setPaying(false); return; }
      window.snap.pay(d.token, {
        onClose: () => setPaying(false),
        onError: () => { setError("Pembayaran gagal diproses. Silakan coba lagi."); setPaying(false); },
        onSuccess: () => { localStorage.removeItem("oxygen_cart"); window.location.href = `/pembayaran/pending?order=${encodeURIComponent(d.orderId)}`; },
        onPending: () => { localStorage.removeItem("oxygen_cart"); window.location.href = `/pembayaran/pending?order=${encodeURIComponent(d.orderId)}`; },
      });
    } catch {
      setError("Tidak dapat terhubung ke server checkout.");
      setPaying(false);
    }
  }

  if (loading) return <main className="checkoutPage"><p>Memuat checkout...</p></main>;

  return <main className="checkoutPage">
    <style>{`body{margin:0;background:#0b0b0a;color:#f7f6f3;font-family:Arial,sans-serif}.checkoutPage{min-height:100vh;padding:40px clamp(20px,6vw,90px) 90px;max-width:1100px;margin:auto}.back{display:inline-block;color:#f7f6f3;text-decoration:none;font-size:11px;letter-spacing:1.5px;margin-bottom:45px}.eyebrow{color:#e1261c;font-size:10px;letter-spacing:2px}.layout{display:grid;grid-template-columns:1.05fr .95fr;gap:60px}.title{font-size:clamp(48px,7vw,84px);line-height:.9;margin:12px 0 35px;letter-spacing:-2px}.panel{border:1px solid #2e2c28;padding:24px;background:#111}.item{display:grid;grid-template-columns:72px 1fr auto;gap:14px;padding:15px 0;border-bottom:1px solid #2e2c28;align-items:center}.thumb{width:72px;height:72px;object-fit:cover;background:#181715}.item h3{font-size:15px;margin:0 0 6px}.muted{color:#777;font-size:11px}.item b{font-size:13px}.qty{display:flex;align-items:center;gap:8px;margin-top:8px}.qty button{width:25px;height:25px;background:transparent;border:1px solid #333;color:#fff;cursor:pointer}.total{display:flex;justify-content:space-between;border-top:1px solid #444;margin-top:18px;padding-top:18px;font-size:18px;font-weight:bold}.field{display:grid;gap:7px;margin:15px 0}.field label{font-size:10px;letter-spacing:1.2px;color:#999}.field input,.field textarea{box-sizing:border-box;width:100%;background:#111;border:1px solid #333;color:#fff;padding:13px;font:14px Arial}.field textarea{min-height:110px;resize:vertical}.pay{width:100%;padding:16px;background:#eee;color:#111;border:1px solid #eee;font-weight:bold;cursor:pointer;margin-top:15px}.pay:hover:not(:disabled){background:#e1261c;border-color:#e1261c;color:#fff}.pay:disabled{opacity:.45;cursor:not-allowed}.error{border:1px solid #7c4b47;color:#ff8178;padding:12px;font-size:12px;line-height:1.5;margin:15px 0}.empty{border:1px solid #2e2c28;padding:30px;color:#888}.secure{color:#777;font-size:11px;line-height:1.6;margin-top:15px}@media(max-width:800px){.checkoutPage{padding:25px 20px 70px}.layout{grid-template-columns:1fr;gap:25px}.title{font-size:52px}.item{grid-template-columns:60px 1fr}.item>b{grid-column:2}.thumb{width:60px;height:60px}}`}</style>
    <a className="back" href="/produk">← KEMBALI KE PRODUK</a>
    <div className="eyebrow">OXYGEN GEAR / CHECKOUT</div>
    <h1 className="title">CHECKOUT.</h1>
    {!cart.length ? <div className="empty">Keranjang masih kosong. <a href="/produk">Kembali ke produk →</a></div> : <div className="layout">
      <section><div className="panel"><h2>Pesanan</h2>{cart.map((item) => <div className="item" key={item.id}><img className="thumb" src={item.image} alt={item.name}/><div><h3>{item.name}</h3><span className="muted">{fmt(item.price)} · Stok {item.stock}</span><div className="qty"><button type="button" onClick={() => changeQty(item.id,-1)}>−</button><span>{item.qty}</span><button type="button" onClick={() => changeQty(item.id,1)} disabled={item.qty >= item.stock}>+</button></div></div><b>{fmt(item.price * item.qty)}</b></div>)}<div className="total"><span>Total</span><span>{fmt(total)}</span></div></div></section>
      <section><div className="panel"><h2>Data pengiriman</h2><div className="field"><label>NAMA</label><input value={name} onChange={(e)=>setName(e.target.value)} required /></div><div className="field"><label>NOMOR HP</label><input value={phone} onChange={(e)=>setPhone(e.target.value)} inputMode="tel" required /></div><div className="field"><label>ALAMAT</label><textarea value={address} onChange={(e)=>setAddress(e.target.value)} required /></div>{error&&<div className="error">{error}</div>}<button className="pay" type="button" disabled={paying} onClick={pay}>{paying?"MEMPROSES...":"LANJUT KE PEMBAYARAN"}</button><p className="secure">Pembayaran akan dibuka melalui Midtrans setelah pesanan berhasil dibuat.</p></div></section>
    </div>}
  </main>;
}
