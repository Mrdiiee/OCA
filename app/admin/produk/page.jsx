'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const emptyForm = { name: '', slug: '', description: '', price: '', stock: '', imageUrl: '', isActive: true };
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminProdukPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadProducts() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/products', { cache: 'no-store' });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) { window.location.href = '/admin/login'; return; }
      if (!response.ok) throw new Error(data.error || 'Produk gagal dimuat.');
      setProducts(data.products || []);
    } catch (err) { setError(err.message || 'Produk gagal dimuat.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, []);

  function resetForm() { setForm(emptyForm); setEditingId(null); }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({ name: product.name || '', slug: product.slug || '', description: product.description || '', price: product.price ?? '', stock: product.stock ?? '', imageUrl: product.image_url || '', isActive: product.is_active });
    setMessage('Mode edit aktif.');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveProduct(event) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), slug: slugify(form.slug || form.name) };
      const response = await fetch('/api/admin/products', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) { window.location.href = '/admin/login'; return; }
      if (!response.ok) throw new Error(data.error || 'Produk gagal disimpan.');
      setMessage(editingId ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.');
      resetForm();
      await loadProducts();
    } catch (err) { setError(err.message || 'Produk gagal disimpan.'); }
    finally { setSaving(false); }
  }

  async function toggleActive(product) {
    setSavingId(product.id); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, isActive: !product.is_active }) });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) { window.location.href = '/admin/login'; return; }
      if (!response.ok) throw new Error(data.error || 'Status produk gagal diubah.');
      setProducts((items) => items.map((item) => item.id === product.id ? data.product : item));
      setMessage(`${product.name} ${data.product.is_active ? 'diaktifkan' : 'dinonaktifkan'}.`);
    } catch (err) { setError(err.message || 'Status produk gagal diubah.'); }
    finally { setSavingId(''); }
  }

  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.slug}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const activeCount = products.filter((p) => p.is_active).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <main style={styles.page}><div style={styles.shell}>
      <header style={styles.header}>
        <div><div style={styles.kicker}>OXYGEN GEAR / ADMIN</div><h1 style={styles.title}>PRODUK.</h1><p style={styles.sub}>Kelola katalog, harga, stok, dan status produk yang tersedia di toko.</p></div>
        <nav style={styles.nav}><Link href="/admin" style={styles.link}>ADMIN</Link><Link href="/admin/pengiriman" style={styles.link}>PENGIRIMAN</Link><Link href="/" style={styles.link}>TOKO</Link></nav>
      </header>

      <section style={styles.stats}><div style={styles.stat}><span>TOTAL PRODUK</span><strong>{products.length}</strong></div><div style={styles.stat}><span>AKTIF</span><strong>{activeCount}</strong></div><div style={styles.stat}><span>STOK MENIPIS</span><strong>{lowStock}</strong><small>1–5 unit</small></div><div style={styles.stat}><span>HABIS</span><strong>{outOfStock}</strong></div></section>

      <section style={styles.card}><div style={styles.sectionTitle}>{editingId ? 'EDIT PRODUK' : 'TAMBAH PRODUK'}</div>
        <form onSubmit={saveProduct} style={styles.form}>
          <label style={styles.label}>NAMA PRODUK<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })} placeholder="Contoh: Keygen V1" style={styles.input} /></label>
          <label style={styles.label}>SLUG<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="keygen-v1" style={styles.input} /></label>
          <label style={styles.label}>HARGA (RUPIAH)<input required type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="550000" style={styles.input} /></label>
          <label style={styles.label}>STOK<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="20" style={styles.input} /></label>
          <label style={styles.label}>URL GAMBAR <span style={styles.hint}>opsional</span><input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." style={styles.input} /></label>
          <label style={styles.label}>DESKRIPSI<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi produk..." style={{ ...styles.input, minHeight: 100, resize: 'vertical' }} /></label>
          <label style={styles.check}><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> PRODUK AKTIF DAN BOLEH DIBELI</label>
          <div style={styles.formActions}><button disabled={saving} style={styles.button}>{saving ? 'MENYIMPAN...' : editingId ? 'SIMPAN PERUBAHAN' : 'TAMBAH PRODUK'}</button>{editingId && <button type="button" onClick={resetForm} style={styles.secondary}>BATAL EDIT</button>}</div>
        </form>
        {message && <div style={styles.message}>{message}</div>}{error && <div style={styles.error}>{error}</div>}
      </section>

      <section style={styles.card}><div style={styles.sectionHead}><div><div style={styles.sectionTitle}>INVENTARIS PRODUK</div><p style={styles.hint}>Produk dengan stok 0 tetap tersimpan, tetapi checkout tidak dapat membelinya.</p></div><div style={styles.tools}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk" style={styles.search}/><button onClick={loadProducts} style={styles.refresh}>REFRESH</button></div></div>
        {loading ? <p style={styles.muted}>Memuat produk...</p> : filtered.length === 0 ? <p style={styles.muted}>Produk tidak ditemukan.</p> : <div style={styles.list}>{filtered.map((product) => {
          const stockStyle = product.stock === 0 ? styles.out : product.stock <= 5 ? styles.low : styles.ok;
          return <article key={product.id} style={styles.row}>
            <div style={styles.productVisual}>{product.image_url ? <img src={product.image_url} alt="" style={styles.image} /> : <div style={styles.noImage}>NO IMAGE</div>}</div>
            <div style={styles.details}><strong>{product.name}</strong><span>{product.slug}</span><span>{money.format(Number(product.price || 0))}</span></div>
            <div style={styles.stock}><span style={{ ...styles.stockBadge, ...stockStyle }}>{product.stock === 0 ? 'HABIS' : `${product.stock} UNIT`}</span><small>{product.is_active ? 'AKTIF' : 'NONAKTIF'}</small></div>
            <div style={styles.actions}><button onClick={() => startEdit(product)} style={styles.smallButton}>EDIT</button><button disabled={savingId === product.id} onClick={() => toggleActive(product)} style={styles.smallButton}>{savingId === product.id ? '...' : product.is_active ? 'NONAKTIFKAN' : 'AKTIFKAN'}</button></div>
          </article>;
        })}</div>}
      </section>
    </div></main>
  );
}

const styles = {
  page:{minHeight:'100vh',background:'#0b0b0b',color:'#f4f4f4',padding:'42px 20px',fontFamily:'Arial, sans-serif'}, shell:{maxWidth:1100,margin:'0 auto'}, header:{display:'flex',justifyContent:'space-between',gap:24,alignItems:'flex-end',marginBottom:28,borderBottom:'1px solid #292929',paddingBottom:22}, kicker:{fontSize:11,letterSpacing:2.5,color:'#a3a3a3',marginBottom:8}, title:{margin:0,fontSize:42,letterSpacing:1}, sub:{margin:'8px 0 0',color:'#9d9d9d'}, nav:{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'flex-end'}, link:{color:'#fff',fontSize:11,letterSpacing:1.2,textDecoration:'none'}, stats:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}, stat:{background:'#111',border:'1px solid #292929',padding:18}, statSpan:{fontSize:9}, stat:{background:'#111',border:'1px solid #292929',padding:18,display:'grid',gap:7}, card:{background:'#111',border:'1px solid #292929',padding:24,marginBottom:18}, sectionTitle:{fontSize:12,letterSpacing:2,fontWeight:700,marginBottom:18}, form:{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:16}, label:{display:'grid',gap:7,fontSize:10,letterSpacing:1.4,color:'#bdbdbd'}, hint:{fontSize:11,letterSpacing:0,color:'#777'}, input:{width:'100%',boxSizing:'border-box',background:'#0b0b0b',border:'1px solid #333',color:'#fff',padding:'13px 12px',fontSize:14,outline:'none'}, check:{gridColumn:'1 / -1',display:'flex',alignItems:'center',gap:9,fontSize:10,letterSpacing:1.2,color:'#bbb'}, formActions:{gridColumn:'1 / -1',display:'flex',gap:10}, button:{border:0,background:'#fff',color:'#000',padding:'14px 18px',fontWeight:700,letterSpacing:1,cursor:'pointer'}, secondary:{background:'transparent',border:'1px solid #555',color:'#fff',padding:'13px 18px',cursor:'pointer',letterSpacing:1}, message:{marginTop:14,color:'#b8ffb8',fontSize:13}, error:{marginTop:14,color:'#ff8e8e',fontSize:13}, sectionHead:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:18,marginBottom:18}, tools:{display:'flex',gap:8,alignItems:'center'}, search:{width:220,maxWidth:'100%',background:'#0b0b0b',border:'1px solid #333',color:'#fff',padding:'10px 11px',outline:'none'}, refresh:{background:'transparent',border:'1px solid #444',color:'#fff',padding:'10px 11px',cursor:'pointer',fontSize:10,letterSpacing:1}, muted:{color:'#777'}, list:{display:'grid'}, row:{display:'grid',gridTemplateColumns:'76px 1.5fr 120px auto',gap:16,alignItems:'center',borderTop:'1px solid #252525',padding:'15px 0'}, productVisual:{width:76,height:76,background:'#171717',border:'1px solid #292929',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}, image:{width:'100%',height:'100%',objectFit:'cover'}, noImage:{fontSize:8,letterSpacing:1,color:'#666'}, details:{display:'grid',gap:5,fontSize:12}, detailsStrong:{color:'#fff'}, detailsSpan:{color:'#777'}, stock:{display:'grid',gap:6,justifyItems:'start'}, stockBadge:{padding:'6px 8px',fontSize:9,letterSpacing:1,fontWeight:700}, ok:{background:'#18351e',color:'#9cffaa'}, low:{background:'#493c18',color:'#ffe58a'}, out:{background:'#3b2119',color:'#ff9d88'}, actions:{display:'flex',gap:7,flexWrap:'wrap',justifyContent:'flex-end'}, smallButton:{background:'transparent',border:'1px solid #444',color:'#ddd',padding:'7px 9px',fontSize:9,letterSpacing:1,cursor:'pointer'},
};
