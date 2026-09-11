'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const EVENTS = { '': 'Semua event', 'pendakian-bersama': 'Pendakian Bersama', ekspedisi: 'Ekspedisi', 'private-trip': 'Private Trip Papandayan' };
const STATUS = { pending: 'PENDING', confirmed: 'CONFIRMED', waitlist: 'WAITLIST', cancelled: 'CANCELLED' };

export default function AdminEventPage() {
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams(); if (event) params.set('event', event); if (status) params.set('status', status);
      const response = await fetch(`/api/admin/event-registrations?${params}`, { cache: 'no-store' });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) { window.location.replace('/admin/login'); return; }
      if (!response.ok) throw new Error(data.error || 'Pendaftaran gagal dimuat.');
      setRegistrations(data.registrations || []);
    } catch (e) { setError(e.message || 'Pendaftaran gagal dimuat.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [event, status]);

  async function changeStatus(id, nextStatus) {
    setSaving(id); setError('');
    try {
      const response = await fetch('/api/admin/event-registrations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: nextStatus }) });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) { window.location.replace('/admin/login'); return; }
      if (!response.ok) throw new Error(data.error || 'Status gagal diperbarui.');
      setRegistrations(items => items.map(item => item.id === id ? data.registration : item));
    } catch (e) { setError(e.message || 'Status gagal diperbarui.'); }
    finally { setSaving(''); }
  }

  const filtered = useMemo(() => registrations.filter(r => `${r.full_name} ${r.email} ${r.phone}`.toLowerCase().includes(query.toLowerCase())), [registrations, query]);
  const counts = useMemo(() => ({ total: registrations.length, pending: registrations.filter(r => r.status === 'pending').length, confirmed: registrations.filter(r => r.status === 'confirmed').length, waitlist: registrations.filter(r => r.status === 'waitlist').length }), [registrations]);

  return <main className="page"><div className="shell">
    <header className="header"><div><div className="kicker">OXYGEN GEAR / ADMIN / EVENT</div><h1>EVENT<br/><em>REGISTRATION.</em></h1><p>Kelola peserta event, verifikasi pendaftaran, dan tentukan status keberangkatan.</p></div><nav><Link href="/admin">ADMIN</Link><Link href="/admin/member">MEMBER</Link><Link href="/admin/pengiriman">PENGIRIMAN</Link></nav></header>
    {error && <div className="notice">{error}</div>}
    <section className="stats"><div><span>TOTAL</span><strong>{counts.total}</strong></div><div><span>PENDING</span><strong>{counts.pending}</strong></div><div><span>CONFIRMED</span><strong>{counts.confirmed}</strong></div><div><span>WAITLIST</span><strong>{counts.waitlist}</strong></div></section>
    <section className="toolbar"><select value={event} onChange={e => setEvent(e.target.value)}>{Object.entries(EVENTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={status} onChange={e => setStatus(e.target.value)}><option value="">Semua status</option>{Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama / email / nomor HP"/><button onClick={load}>REFRESH</button></section>
    {loading ? <div className="empty">MEMUAT PENDAFTARAN...</div> : filtered.length === 0 ? <div className="empty">Belum ada pendaftaran untuk filter ini.</div> : <section className="list">{filtered.map(r => <article className="card" key={r.id}><div className="main"><div><span className="event">{EVENTS[r.event_slug] || r.event_slug}</span><h2>{r.full_name}</h2><div className="contact">{r.email} · {r.phone}</div></div><span className={`badge ${r.status}`}>{STATUS[r.status] || r.status}</span></div><div className="details"><div><small>KONTAK DARURAT</small><strong>{r.emergency_contact_name}</strong><span>{r.emergency_contact_phone}</span></div><div><small>CATATAN</small><span>{r.notes || '-'}</span></div><div><small>DAFTAR</small><span>{new Date(r.created_at).toLocaleString('id-ID')}</span></div></div><div className="actions">{r.status !== 'confirmed' && <button disabled={saving === r.id} onClick={() => changeStatus(r.id, 'confirmed')}>KONFIRMASI</button>}{r.status !== 'waitlist' && r.status !== 'cancelled' && <button className="dark" disabled={saving === r.id} onClick={() => changeStatus(r.id, 'waitlist')}>WAITLIST</button>}{r.status !== 'cancelled' && <button className="danger" disabled={saving === r.id} onClick={() => changeStatus(r.id, 'cancelled')}>BATALKAN</button>}{r.status === 'cancelled' && <button className="dark" disabled={saving === r.id} onClick={() => changeStatus(r.id, 'pending')}>AKTIFKAN KEMBALI</button>}</div></article>)}</section>}
  </div><style jsx>{`:global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif;padding:42px 20px 100px}.shell{max-width:1120px;margin:auto}.header{display:flex;justify-content:space-between;gap:25px;align-items:flex-end;border-bottom:1px solid #302e29;padding-bottom:25px;margin-bottom:20px}.kicker{font:10px monospace;letter-spacing:2px;color:#8b887f;margin-bottom:15px}h1{font-size:clamp(55px,9vw,100px);line-height:.84;letter-spacing:-4px;margin:0}h1 em{font-style:normal;color:#e1261c}.header p{color:#aaa69d;max-width:650px;line-height:1.6;margin:18px 0 0}.header nav{display:flex;gap:15px;flex-wrap:wrap}.header nav a{color:#aaa69d;text-decoration:none;font-size:10px;letter-spacing:1px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.stats div{border:1px solid #302e29;background:#11110f;padding:18px}.stats span{display:block;color:#77736b;font:9px monospace;letter-spacing:1px}.stats strong{display:block;font-size:32px;margin-top:8px}.toolbar{display:grid;grid-template-columns:1fr 1fr 2fr auto;gap:8px;margin-bottom:18px}.toolbar select,.toolbar input,.toolbar button{border:1px solid #3a3731;background:#11110f;color:#fff;padding:12px;font:12px Arial}.toolbar button{cursor:pointer}.notice{border:1px solid #7c4b47;background:#17100f;color:#ff8178;padding:13px;margin-bottom:15px}.empty{border:1px solid #302e29;background:#11110f;padding:45px;text-align:center;color:#77736b;font:10px monospace;letter-spacing:1px}.list{display:grid;gap:12px}.card{border:1px solid #302e29;background:#11110f;padding:22px}.main{display:flex;justify-content:space-between;gap:20px}.event{color:#e1261c;font:9px monospace;letter-spacing:1px}.card h2{margin:8px 0 5px;font-size:22px}.contact{color:#77736b;font-size:11px}.badge{padding:7px 9px;height:max-content;font:9px monospace;letter-spacing:1px}.badge.pending{background:#3a3020;color:#ffd38a}.badge.confirmed{background:#18351e;color:#9cffaa}.badge.waitlist{background:#24283b;color:#aab8ff}.badge.cancelled{background:#351817;color:#ff8178}.details{display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:18px;border-top:1px solid #25231f;border-bottom:1px solid #25231f;margin:18px 0;padding:16px 0}.details div{display:grid;gap:6px}.details small{color:#77736b;font:9px monospace;letter-spacing:1px}.details strong,.details span{font-size:12px}.details span{color:#aaa69d}.actions{display:flex;gap:8px;flex-wrap:wrap}.actions button{border:1px solid #f7f6f3;background:#f7f6f3;color:#0b0b0a;padding:10px 13px;font-size:10px;font-weight:800;letter-spacing:.7px;cursor:pointer}.actions .dark{background:transparent;color:#fff;border-color:#555149}.actions .danger{background:transparent;color:#ff8178;border-color:#7c4b47}@media(max-width:700px){.header{align-items:flex-start;flex-direction:column}.stats{grid-template-columns:1fr 1fr}.toolbar{grid-template-columns:1fr 1fr}.toolbar input{grid-column:1/-1}.details{grid-template-columns:1fr}.main{flex-direction:column}}`}</style></main>;
}
