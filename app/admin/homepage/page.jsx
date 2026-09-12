'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SLOTS = [
  ['logo', 'Logo Oxygen Gear'],
  ['hero', 'Hero / Banner Utama'],
  ['oxygen_index', 'Oxygen Index'],
  ['homepage_01', 'Visual Homepage 01'],
  ['homepage_02', 'Visual Homepage 02'],
  ['homepage_03', 'Visual Homepage 03'],
  ['homepage_04', 'Visual Homepage 04'],
  ['homepage_05', 'Visual Homepage 05'],
  ['homepage_06', 'Visual Homepage 06'],
  ['homepage_07', 'Visual Homepage 07'],
  ['homepage_08', 'Visual Homepage 08'],
];

export default function HomepageMediaAdmin() {
  const [media, setMedia] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/homepage-media', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Media gagal dimuat.');
      setMedia(Object.fromEntries((d.media || []).map(item => [item.key, item])));
    } catch (e) { setError(e.message || 'Media gagal dimuat.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function upload(key, label, file) {
    if (!file) return;
    setSaving(key); setError(''); setMessage('');
    const form = new FormData();
    form.append('key', key); form.append('label', label); form.append('altText', label); form.append('file', file);
    try {
      const r = await fetch('/api/homepage-media', { method: 'POST', body: form });
      const d = await r.json();
      if (r.status === 401 || r.status === 403) { window.location.replace('/admin/login'); return; }
      if (!r.ok) throw new Error(d.error || 'Gambar gagal disimpan.');
      setMedia(current => ({ ...current, [key]: d.media }));
      setMessage(`${label} berhasil diperbarui.`);
    } catch (e) { setError(e.message || 'Gambar gagal disimpan.'); }
    finally { setSaving(''); }
  }

  async function remove(key, label) {
    if (!window.confirm(`Hapus gambar ${label}? Homepage akan kembali ke gambar bawaan.`)) return;
    setSaving(key); setError(''); setMessage('');
    try {
      const r = await fetch('/api/homepage-media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
      const d = await r.json();
      if (r.status === 401 || r.status === 403) { window.location.replace('/admin/login'); return; }
      if (!r.ok) throw new Error(d.error || 'Gambar gagal dihapus.');
      setMedia(current => { const next = { ...current }; delete next[key]; return next; });
      setMessage(`${label} dikembalikan ke gambar bawaan.`);
    } catch (e) { setError(e.message || 'Gambar gagal dihapus.'); }
    finally { setSaving(''); }
  }

  return <main style={styles.page}><div style={styles.shell}>
    <header style={styles.header}><div><div style={styles.kicker}>OXYGEN GEAR / HOMEPAGE CONTROL</div><h1 style={styles.title}>MEDIA.</h1><p style={styles.sub}>Kontrol seluruh gambar halaman utama. Gambar produk tetap dikelola terpisah melalui menu Produk.</p></div><Link href="/admin" style={styles.back}>← ADMIN</Link></header>
    {error && <div style={styles.error}>{error}</div>}{message && <div style={styles.message}>{message}</div>}
    <section style={styles.note}><strong>ATURAN KONTEN</strong><span>Upload JPG, PNG, WebP, atau GIF maksimal 8 MB. Ganti gambar kapan saja tanpa mengubah kode website.</span></section>
    {loading ? <div style={styles.loading}>MEMUAT MEDIA...</div> : <section style={styles.grid}>{SLOTS.map(([key, label]) => { const item = media[key]; return <article key={key} style={styles.card}>
      <div style={styles.cardTop}><div><div style={styles.slot}>{key}</div><h2 style={styles.cardTitle}>{label}</h2></div><span style={{...styles.status,...(item ? styles.active : styles.default)}}>{item ? 'TERKONTROL' : 'BAWAAN'}</span></div>
      <div style={styles.preview}>{item ? <img src={item.url} alt={item.alt_text || label} style={styles.image}/> : <div style={styles.placeholder}>BELUM ADA GAMBAR<br/><small>Website memakai gambar bawaan.</small></div>}</div>
      <div style={styles.actions}><label style={styles.upload}>{saving === key ? 'MENYIMPAN...' : item ? 'GANTI GAMBAR' : 'UPLOAD GAMBAR'}<input type="file" accept="image/*" disabled={saving === key} onChange={e => { const f=e.target.files?.[0]; e.target.value=''; upload(key,label,f); }} style={{display:'none'}}/></label>{item && <button type="button" disabled={saving===key} onClick={() => remove(key,label)} style={styles.remove}>HAPUS</button>}</div>
    </article>;})}</section>}
    <nav style={styles.bottom}><Link href="/" style={styles.link}>← LIHAT HOMEPAGE</Link><Link href="/admin/produk" style={styles.link}>KELOLA PRODUK →</Link></nav>
  </div><style jsx>{`@media(max-width:760px){.header{flex-direction:column!important;align-items:flex-start!important}.grid{grid-template-columns:1fr!important}.preview{height:220px!important}}`}</style></main>;
}

const styles={page:{minHeight:'100vh',background:'#0b0b0a',color:'#f7f6f3',padding:'32px 20px 70px',fontFamily:'Arial,Helvetica,sans-serif'},shell:{maxWidth:1180,margin:'0 auto'},header:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:25,borderBottom:'1px solid #302e29',paddingBottom:25,marginBottom:24},kicker:{fontSize:10,letterSpacing:2,color:'#8b887f',marginBottom:8},title:{fontSize:'clamp(55px,9vw,95px)',lineHeight:.85,margin:0,letterSpacing:-4},sub:{color:'#aaa69d',maxWidth:650,lineHeight:1.6,margin:'14px 0 0'},back:{border:'1px solid #444',padding:'11px 14px',color:'#fff',textDecoration:'none',fontSize:10,letterSpacing:1},error:{padding:14,border:'1px solid #7c4b47',background:'#17100f',color:'#ff8178',marginBottom:12,fontSize:13},message:{padding:14,border:'1px solid #385b3f',background:'#101710',color:'#a6e9ae',marginBottom:12,fontSize:13},note:{display:'flex',gap:18,alignItems:'center',border:'1px solid #302e29',background:'#11110f',padding:18,marginBottom:18,fontSize:11,color:'#77736b',lineHeight:1.5},grid:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12},card:{border:'1px solid #302e29',background:'#11110f',padding:14},cardTop:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,minHeight:54},slot:{font:'9px monospace',letterSpacing:1.5,color:'#e1261c',textTransform:'uppercase'},cardTitle:{fontSize:15,margin:'6px 0 0'},status:{fontSize:8,letterSpacing:1,padding:'5px 7px',whiteSpace:'nowrap'},active:{background:'#18351e',color:'#9cffaa'},default:{background:'#27251f',color:'#aaa69d'},preview:{height:250,background:'#090908',border:'1px solid #25231f',display:'grid',placeItems:'center',overflow:'hidden',margin:'12px 0'},image:{width:'100%',height:'100%',objectFit:'cover'},placeholder:{textAlign:'center',color:'#555149',fontSize:10,letterSpacing:1.3,lineHeight:1.7},actions:{display:'flex',gap:8},upload:{flex:1,display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'11px 12px',background:'#f7f6f3',color:'#0b0b0a',fontSize:9,fontWeight:800,letterSpacing:1,cursor:'pointer'},remove:{border:'1px solid #4a3b39',background:'transparent',color:'#ff8178',padding:'11px 12px',fontSize:9,letterSpacing:1,cursor:'pointer'},loading:{padding:50,textAlign:'center',color:'#77736b',fontSize:10,letterSpacing:1},bottom:{display:'flex',gap:20,marginTop:22},link:{color:'#77736b',textDecoration:'none',fontSize:10,letterSpacing:1}};
