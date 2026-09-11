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

  const filtered = useMemo(() => registrations.filter(r => `${r.full_name} ${r.email} ${r.phone} ${r.emergency_contact_name} ${r.emergency_contact_phone}`.toLowerCase().includes(query.toLowerCase())), [registrations, query]);
  const counts = useMemo(() => ({ total: registrations.length, pending: registrations.filter(r => r.status === 'pending').length, confirmed: registrations.filter(r => r.status === 'confirmed').length, waitlist: registrations.filter(r => r.status === 'waitlist').length }), [registrations]);

  return <main className="page"><div className="shell">
    <header className="header"><div><div className="kicker">OXYGEN GEAR / ADMIN / EVENT</div><h1>EVENT<br/><em>REGISTRATION.</em></h1><p>Kelola peserta event, verifikasi pendaftaran, dan tentukan status keberangkatan.</p></div><nav><Link href="/admin">ADMIN</Link><Link href="/admin/member">MEMBER</Link><Link href="/admin/pengiriman">PENGIRIMAN</Link></nav></header>
    {error && <div className="notice">{error}</div>}
    <section className="stats"><div><span>TOTAL</span><strong>{counts.total}</strong></div><div><span>PENDING</span><strong>{counts.pending}</strong></div><div><span>CONFIRMED</span><strong>{counts.confirmed}</strong></div><div><span>WAITLIST</span><strong>{counts.waitlist}</strong></div></section>
    <section className="toolbar"><select value={event} onChange={e => setEvent(e.target.value)}>{Object.entries(EVENTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={status} onChange={e => setStatus(e.target.value)}><option value="">Semua status</option>{Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama / email / nomor HP / kontak darurat"/><button onClick={load}>REFRESH</button></section>
    {loading ? <div className="empty">MEMUAT PENDAFTARAN...</div> : filtered.length === 0 ? <div className="empty">Belum ada pendaftaran untuk filter ini.</div> : <section className="tableWrap"><table><thead><tr><th>NO</th><th>PESERTA</th><th>KONTAK</th><th>EVENT</th><th>KONTAK DARURAT</th><th>CATATAN</th><th>DAFTAR</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>{filtered.map((r, index) => <tr key={r.id}><td className="num">{index + 1}</td><td><strong className="name">{r.full_name}</strong><span className="muted">{r.email}</span></td><td><span className="nowrap">{r.phone}</span></td><td><span className="event">{EVENTS[r.event_slug] || r.event_slug}</span></td><td><strong>{r.emergency_contact_name}</strong><span className="muted nowrap">{r.emergency_contact_phone}</span></td><td className="notes">{r.notes || '-'}</td><td className="date">{new Date(r.created_at).toLocaleString('id-ID')}</td><td><span className={`badge ${r.status}`}>{STATUS[r.status] || r.status}</span></td><td><div className="actions">{r.status !== 'confirmed' && <button disabled={saving === r.id} onClick={() => changeStatus(r.id, 'confirmed')}>KONFIRMASI</button>}{r.status !== 'waitlist' && r.status !== 'cancelled' && <button className="dark" disabled={saving === r.id} onClick={() => changeStatus(r.id, 'waitlist')}>WAITLIST</button>}{r.status !== 'cancelled' && <button className="danger" disabled={saving === r.id} onClick={() => changeStatus(r.id, 'cancelled')}>BATALKAN</button>}{r.status === 'cancelled' && <button className="dark" disabled={saving === r.id} onClick={() => changeStatus(r.id, 'pending')}>AKTIFKAN</button>}</div></td></tr>)}</tbody></table></section>}
    <p className="tableHint">Geser tabel ke kanan/kiri jika layar sempit untuk melihat seluruh data peserta.</p>
  </div><style jsx>{`:global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif;padding:42px 20px 100px}.shell{max-width:1500px;margin:auto}.header{display:flex;justify-content:space-between;gap:25px;align-items:flex-end;border-bottom:1px solid #302e29;padding-bottom:25px;margin-bottom:20px}.kicker{font:10px monospace;letter-spacing:2px;color:#8b887f;margin-bottom:15px}h1{font-size:clamp(55px,9vw,100px);line-height:.84;letter-spacing:-4px;margin:0}h1 em{font-style:normal;color:#e1261c}.header p{color:#aaa69d;max-width:650px;line-height:1.6;margin:18px 0 0}.header nav{display:flex;gap:15px;flex-wrap:wrap}.header nav a{color:#aaa69d;text-decoration:none;font-size:10px;letter-spacing:1px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.stats div{border:1px solid #302e29;background:#11110f;padding:18px}.stats span{display:block;color:#77736b;font:9px monospace;letter-spacing:1px}.stats strong{display:block;font-size:32px;margin-top:8px}.toolbar{display:grid;grid-template-columns:1fr 1fr 2.5fr auto;gap:8px;margin-bottom:18px}.toolbar select,.toolbar input,.toolbar button{border:1px solid #3a3731;background:#11110f;color:#fff;padding:12px;font:12px Arial;min-width:0}.toolbar button{cursor:pointer}.notice{border:1px solid #7c4b47;background:#17100f;color:#ff8178;padding:13px;margin-bottom:15px}.empty{border:1px solid #302e29;background:#11110f;padding:45px;text-align:center;color:#77736b;font:10px monospace;letter-spacing:1px}.tableWrap{width:100%;overflow-x:auto;border:1px solid #302e29;background:#11110f;-webkit-overflow-scrolling:touch}.tableWrap table{width:100%;min-width:1250px;border-collapse:collapse;table-layout:auto}.tableWrap th{background:#171714;color:#77736b;font:9px monospace;letter-spacing:1px;text-align:left;white-space:nowrap;padding:13px 12px;border-bottom:1px solid #302e29}.tableWrap td{padding:15px 12px;border-bottom:1px solid #25231f;vertical-align:top;font-size:12px;color:#aaa69d}.tableWrap tbody tr:last-child td{border-bottom:0}.tableWrap tbody tr:hover{background:#141411}.tableWrap td strong{display:block;color:#f7f6f3;font-size:12px}.num{width:45px;color:#77736b!important}.name{font-size:14px!important;min-width:140px}.muted{display:block;color:#77736b;font-size:10px;margin-top:5px;line-height:1.4}.event{display:block;color:#e1261c;font:9px monospace;letter-spacing:.7px;line-height:1.4;max-width:150px}.nowrap{white-space:nowrap}.notes{max-width:180px;min-width:130px;white-space:normal;line-height:1.5}.date{min-width:145px;white-space:nowrap;font-size:10px!important}.badge{display:inline-block;padding:7px 9px;font:9px monospace;letter-spacing:1px;white-space:nowrap}.badge.pending{background:#3a3020;color:#ffd38a}.badge.confirmed{background:#18351e;color:#9cffaa}.badge.waitlist{background:#24283b;color:#aab8ff}.badge.cancelled{background:#351817;color:#ff8178}.actions{display:flex;gap:6px;flex-wrap:wrap;min-width:145px}.actions button{border:1px solid #f7f6f3;background:#f7f6f3;color:#0b0b0a;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:.5px;cursor:pointer;white-space:nowrap}.actions .dark{background:transparent;color:#fff;border-color:#555149}.actions .danger{background:transparent;color:#ff8178;border-color:#7c4b47}.actions button:disabled{opacity:.45;cursor:not-allowed}.tableHint{margin:9px 2px 0;color:#66635d;font:9px monospace;letter-spacing:.5px}.tableWrap::-webkit-scrollbar{height:8px}.tableWrap::-webkit-scrollbar-track{background:#11110f}.tableWrap::-webkit-scrollbar-thumb{background:#454139;border-radius:10px}@media(max-width:800px){.page{padding:28px 12px 80px}.header{align-items:flex-start;flex-direction:column}.stats{grid-template-columns:1fr 1fr}.toolbar{grid-template-columns:1fr 1fr}.toolbar input{grid-column:1/-1}.toolbar button{grid-column:1/-1}.tableHint{display:block}}`}</style></main>;
}
