'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const TYPES = {
  pendakian_bersama: 'Pendakian Bersama',
  ekspedisi: 'Ekspedisi',
  private_trip: 'Private Trip',
  community_event: 'Event Komunitas',
  volunteer_crew: 'Volunteer / Crew',
  social: 'Kegiatan Sosial',
  environment: 'Kegiatan Lingkungan',
  other: 'Aktivitas Lain',
  product_purchase: 'Pembelian Produk',
};

export default function AdminMemberPage() {
  const [data, setData] = useState({ users: [], activities: [] });
  const [selected, setSelected] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ activityType: 'pendakian_bersama', title: '', description: '', activityDate: '', role: '', verified: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/member', { cache: 'no-store' });
      const body = await response.json();
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      if (!response.ok) throw new Error(body.error || 'Data Member gagal dimuat.');
      setData(body);
      setSelected((current) => current || body.users?.[0]?.id || '');
    } catch (err) {
      setError(err.message || 'Data Member gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const users = useMemo(() => data.users.filter((user) => `${user.full_name} ${user.email}`.toLowerCase().includes(query.toLowerCase())), [data.users, query]);
  const selectedUser = data.users.find((user) => user.id === selected) || null;
  const activities = useMemo(() => data.activities.filter((item) => item.user_id === selected), [data.activities, selected]);
  const verified = activities.filter((item) => item.verified);
  const qualifying = verified.filter((item) => item.activity_type !== 'product_purchase');

  async function saveActivity(event) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: selected }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Aktivitas gagal disimpan.');
      setMessage('Aktivitas berhasil dicatat.');
      setForm({ activityType: form.activityType, title: '', description: '', activityDate: '', role: '', verified: true });
      await load();
    } catch (err) {
      setError(err.message || 'Aktivitas gagal disimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function setVerified(id, verifiedValue) {
    setError('');
    try {
      const response = await fetch('/api/admin/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verified: verifiedValue }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Status aktivitas gagal diperbarui.');
      setMessage(verifiedValue ? 'Aktivitas diverifikasi.' : 'Verifikasi aktivitas dibatalkan.');
      await load();
    } catch (err) {
      setError(err.message || 'Status aktivitas gagal diperbarui.');
    }
  }

  return (
    <main className="page">
      <div className="shell">
        <header className="header">
          <div>
            <div className="kicker">OXYGEN GEAR / ADMIN / MEMBER</div>
            <h1>MEMBER.</h1>
            <p>Kelola perjalanan, verifikasi aktivitas, dan status Member Oxygen Gear.</p>
          </div>
          <nav><Link href="/admin">ADMIN</Link><Link href="/admin/oxygen-index">OXYGEN INDEX</Link><Link href="/member">LIHAT MEMBER</Link></nav>
        </header>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <section className="card">
          <div className="section-head">
            <div><b>PILIH AKUN</b><p>Member berasal dari akun terdaftar. Minimal satu aktivitas non-pembelian yang diverifikasi akan mengaktifkan Member.</p></div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama / email" />
          </div>
          {loading ? <p className="muted">Memuat...</p> : <div className="users">{users.map((user) => (
            <button key={user.id} className={user.id === selected ? 'user selected' : 'user'} onClick={() => setSelected(user.id)}>
              <strong>{user.full_name}</strong><span>{user.email}</span><small>{user.member?.status === 'active' ? 'MEMBER AKTIF' : 'BELUM MEMBER'}</small>
            </button>
          ))}</div>}
        </section>

        {selectedUser && (
          <>
            <section className="overview">
              <div><span>STATUS MEMBER</span><strong>{selectedUser.member?.status === 'active' ? 'AKTIF' : 'BELUM MEMBER'}</strong><small>{selectedUser.member?.member_since ? `Sejak ${new Date(selectedUser.member.member_since).toLocaleDateString('id-ID')}` : 'Belum memiliki aktivitas kualifikasi terverifikasi'}</small></div>
              <div><span>AKTIVITAS</span><strong>{activities.length}</strong><small>{qualifying.length} kualifikasi · {verified.filter((item) => item.activity_type === 'product_purchase').length} support</small></div>
              <div><span>TERVERIFIKASI</span><strong>{verified.length}</strong><small>{activities.length - verified.length} menunggu verifikasi</small></div>
            </section>

            <section className="card">
              <b>CATAT AKTIVITAS</b>
              <form onSubmit={saveActivity} className="form">
                <label>JENIS<select value={form.activityType} onChange={(event) => setForm({ ...form, activityType: event.target.value })}>{Object.entries(TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                <label>JUDUL<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Pendakian Papandayan" /></label>
                <label>TANGGAL<input type="date" value={form.activityDate} onChange={(event) => setForm({ ...form, activityDate: event.target.value })} /></label>
                <label>PERAN<input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} placeholder="Peserta / Crew / Volunteer" /></label>
                <label className="full">CATATAN<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" /></label>
                <label className="check"><input type="checkbox" checked={form.verified} onChange={(event) => setForm({ ...form, verified: event.target.checked })} /> VERIFIKASI SEKARANG</label>
                <button disabled={saving} className="primary">{saving ? 'MENYIMPAN...' : 'SIMPAN AKTIVITAS'}</button>
              </form>
            </section>

            <section className="card">
              <div className="section-head"><div><b>RIWAYAT AKTIVITAS</b><p>Aktivitas terverifikasi akan muncul di halaman Member.</p></div></div>
              {activities.length === 0 ? <p className="muted">Belum ada aktivitas untuk akun ini.</p> : <div className="activity-list">{activities.map((item) => (
                <article key={item.id}>
                  <div><strong>{item.title}</strong><span>{TYPES[item.activity_type] || item.activity_type} {item.role ? `· ${item.role}` : ''}</span><small>{item.activity_date ? new Date(item.activity_date).toLocaleDateString('id-ID') : 'Tanggal belum diisi'}</small></div>
                  <button className={item.verified ? 'verified' : 'pending'} onClick={() => setVerified(item.id, !item.verified)}>{item.verified ? 'TERVERIFIKASI' : 'VERIFIKASI'}</button>
                </article>
              ))}</div>}
            </section>
          </>
        )}
      </div>
      <style jsx>{`
        *{box-sizing:border-box}.page{min-height:100vh;background:#0b0b0b;color:#f5f5f2;padding:32px 18px 70px;font-family:Arial,Helvetica,sans-serif}.shell{max-width:1160px;margin:auto}.header{display:flex;justify-content:space-between;align-items:flex-end;gap:28px;border-bottom:1px solid #2b2b2b;padding-bottom:24px;margin-bottom:18px}.kicker{font:10px monospace;letter-spacing:2px;color:#888;margin-bottom:9px}h1{font-size:clamp(52px,8vw,88px);line-height:.85;margin:0;letter-spacing:-4px}header p{color:#999;max-width:650px;line-height:1.5;margin:14px 0 0;font-size:12px}nav{display:flex;gap:16px;flex-wrap:wrap;justify-content:flex-end}nav a{color:#fff;text-decoration:none;font:10px monospace;letter-spacing:1px}.card{border:1px solid #2b2b2b;background:#111;padding:22px;margin-bottom:14px}.section-head{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:18px}.section-head p{color:#777;font-size:11px;line-height:1.5;margin:7px 0 0}.section-head input{width:260px;background:#0b0b0b;border:1px solid #333;color:#fff;padding:11px}.users{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.user{display:grid;text-align:left;gap:7px;background:#0b0b0b;border:1px solid #2b2b2b;color:#fff;padding:15px;cursor:pointer}.user.selected{border-color:#fff}.user span,.user small{color:#777;font-size:10px;overflow-wrap:anywhere}.user small{color:#e1261c;letter-spacing:1px}.overview{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}.overview div{border:1px solid #2b2b2b;background:#111;padding:18px;display:grid;gap:7px}.overview span{font:9px monospace;letter-spacing:1.5px;color:#e1261c}.overview strong{font-size:25px}.overview small{color:#777;line-height:1.4}.form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}.form label{display:grid;gap:7px;font:9px monospace;letter-spacing:1px;color:#aaa}.form .full{grid-column:1/-1}.form input,.form select,.form textarea{width:100%;background:#0b0b0b;border:1px solid #333;color:#fff;padding:12px;font:13px Arial}.form select option{background:#111}.check{display:flex!important;align-items:center;gap:8px}.check input{width:auto}.primary{border:0;background:#fff;color:#000;padding:13px;font-weight:700;cursor:pointer}.activity-list{display:grid}.activity-list article{border-top:1px solid #262626;padding:15px 0;display:flex;justify-content:space-between;align-items:center;gap:18px}.activity-list article div{display:grid;gap:5px}.activity-list span,.activity-list small{color:#777;font-size:11px}.activity-list button{background:transparent;padding:8px 10px;font:9px monospace;letter-spacing:1px;cursor:pointer}.verified{border:1px solid #56715b;color:#b8e5bf}.pending{border:1px solid #765a4f;color:#ffd0c2}.alert{padding:12px;margin-bottom:14px;font-size:12px}.error{border:1px solid #6b3530;color:#ff9c92;background:#170d0c}.success{border:1px solid #345a3c;color:#b8e5bf;background:#0d170f}.muted{color:#666;font-size:12px}@media(max-width:720px){.page{padding:20px 12px 50px}.header{display:grid;gap:18px}.header nav{justify-content:flex-start}.users,.overview,.form{grid-template-columns:1fr}.section-head{display:grid;align-items:stretch}.section-head input{width:100%}.form .full{grid-column:auto}.activity-list article{align-items:flex-start;display:grid}.activity-list button{width:max-content}}
      `}</style>
    </main>
  );
}
