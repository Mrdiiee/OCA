'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const statusLabels = { active: 'AKTIF', inactive: 'NONAKTIF', expired: 'EXPIRED' };

export default function AdminMemberPage() {
  const [codes, setCodes] = useState([]);
  const [form, setForm] = useState({ memberName: '', eventName: '', eventDate: '', benefits: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newCode, setNewCode] = useState(null);

  async function loadCodes() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/member-codes', { cache: 'no-store' });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Kode gagal dimuat.');
      setCodes(data.memberCodes || []);
    } catch (err) {
      setError(err.message || 'Kode gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCodes(); }, []);

  async function createCode(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    setNewCode(null);
    try {
      const response = await fetch('/api/admin/member-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Kode gagal dibuat.');
      setNewCode(data.memberCode);
      setMessage('Kode member berhasil dibuat.');
      setForm({ memberName: '', eventName: '', eventDate: '', benefits: '' });
      await loadCodes();
    } catch (err) {
      setError(err.message || 'Kode gagal dibuat.');
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id, status) {
    setError('');
    try {
      const response = await fetch('/api/admin/member-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Status gagal diperbarui.');
      await loadCodes();
    } catch (err) {
      setError(err.message || 'Status gagal diperbarui.');
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setMessage(`Kode ${code} berhasil disalin.`);
    } catch {
      setMessage(`Salin kode ini: ${code}`);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <div style={styles.kicker}>OXYGEN GEAR / ADMIN</div>
            <h1 style={styles.title}>MEMBER</h1>
            <p style={styles.sub}>Buat dan kelola kode member peserta event.</p>
          </div>
          <nav style={styles.nav}>
            <Link href="/admin" style={styles.link}>ADMIN</Link>
            <Link href="/admin/pengiriman" style={styles.link}>PENGIRIMAN</Link>
            <Link href="/member" style={styles.link}>LIHAT MEMBER</Link>
          </nav>
        </header>

        <section style={styles.card}>
          <div style={styles.sectionTitle}>BUAT KODE MEMBER</div>
          <form onSubmit={createCode} style={styles.form}>
            <label style={styles.label}>NAMA PESERTA<input required value={form.memberName} onChange={(e) => setForm({ ...form, memberName: e.target.value })} placeholder="Contoh: Budi Santoso" style={styles.input} /></label>
            <label style={styles.label}>EVENT<input required value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} placeholder="Contoh: Pendakian Papandayan" style={styles.input} /></label>
            <label style={styles.label}>TANGGAL EVENT<input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} style={styles.input} /></label>
            <label style={styles.label}>BENEFIT <span style={styles.hint}>(pisahkan dengan koma)</span><input value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder="Harga khusus member, Akses agenda event" style={styles.input} /></label>
            <button disabled={saving} style={styles.button}>{saving ? 'MEMBUAT...' : 'BUAT KODE MEMBER'}</button>
          </form>

          {newCode && (
            <div style={styles.generated}>
              <div style={styles.generatedLabel}>KODE MEMBER BARU</div>
              <div style={styles.code}>{newCode.code}</div>
              <div style={styles.generatedInfo}>{newCode.member_name} · {newCode.event_name}</div>
              <button onClick={() => copyCode(newCode.code)} style={styles.secondary}>SALIN KODE</button>
            </div>
          )}
          {message && <div style={styles.message}>{message}</div>}
          {error && <div style={styles.error}>{error}</div>}
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHead}><div style={styles.sectionTitle}>DAFTAR KODE</div><button onClick={loadCodes} style={styles.refresh}>REFRESH</button></div>
          {loading ? <p style={styles.muted}>Memuat...</p> : codes.length === 0 ? <p style={styles.muted}>Belum ada kode member.</p> : (
            <div style={styles.list}>
              {codes.map((item) => (
                <article key={item.id} style={styles.row}>
                  <div style={styles.codeSmall}>{item.code}</div>
                  <div style={styles.details}><strong>{item.member_name}</strong><span>{item.event_name}{item.event_date ? ` · ${item.event_date}` : ''}</span>{item.benefits?.length > 0 && <span>Benefit: {item.benefits.join(' · ')}</span>}</div>
                  <div style={styles.actions}><span style={{ ...styles.status, ...(item.status === 'active' ? styles.active : item.status === 'expired' ? styles.expired : styles.inactive) }}>{statusLabels[item.status]}</span><button onClick={() => copyCode(item.code)} style={styles.smallButton}>SALIN</button>{item.status === 'active' ? <button onClick={() => changeStatus(item.id, 'inactive')} style={styles.smallButton}>NONAKTIFKAN</button> : <button onClick={() => changeStatus(item.id, 'active')} style={styles.smallButton}>AKTIFKAN</button>}</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0b0b0b', color: '#f4f4f4', padding: '42px 20px', fontFamily: 'Arial, sans-serif' },
  shell: { maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end', marginBottom: 28, borderBottom: '1px solid #292929', paddingBottom: 22 },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: '#a3a3a3', marginBottom: 8 },
  title: { margin: 0, fontSize: 42, letterSpacing: 1 },
  sub: { margin: '8px 0 0', color: '#9d9d9d' },
  nav: { display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end' },
  link: { color: '#fff', fontSize: 11, letterSpacing: 1.2, textDecoration: 'none' },
  card: { background: '#111', border: '1px solid #292929', padding: 24, marginBottom: 18 },
  sectionTitle: { fontSize: 12, letterSpacing: 2, fontWeight: 700, marginBottom: 18 },
  form: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 },
  label: { display: 'grid', gap: 7, fontSize: 10, letterSpacing: 1.4, color: '#bdbdbd' },
  hint: { letterSpacing: 0, color: '#777' },
  input: { width: '100%', boxSizing: 'border-box', background: '#0b0b0b', border: '1px solid #333', color: '#fff', padding: '13px 12px', fontSize: 14, outline: 'none' },
  button: { gridColumn: '1 / -1', border: 0, background: '#fff', color: '#000', padding: '14px 18px', fontWeight: 700, letterSpacing: 1, cursor: 'pointer' },
  generated: { marginTop: 22, padding: 20, border: '1px solid #fff', textAlign: 'center' },
  generatedLabel: { fontSize: 10, letterSpacing: 2, color: '#aaa' },
  code: { fontSize: 30, fontWeight: 800, letterSpacing: 3, margin: '10px 0' },
  generatedInfo: { color: '#aaa', marginBottom: 14 },
  secondary: { background: 'transparent', border: '1px solid #555', color: '#fff', padding: '9px 14px', cursor: 'pointer' },
  message: { marginTop: 14, color: '#b8ffb8', fontSize: 13 },
  error: { marginTop: 14, color: '#ff8e8e', fontSize: 13 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  refresh: { background: 'transparent', border: '1px solid #444', color: '#fff', padding: '7px 11px', cursor: 'pointer', fontSize: 10, letterSpacing: 1 },
  muted: { color: '#777' },
  list: { display: 'grid', gap: 10 },
  row: { borderTop: '1px solid #252525', paddingTop: 15, display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 16, alignItems: 'center' },
  codeSmall: { fontWeight: 800, letterSpacing: 1.5, fontSize: 13 },
  details: { display: 'grid', gap: 5, color: '#aaa', fontSize: 12 },
  detailsStrong: { color: '#fff' },
  actions: { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', justifyContent: 'flex-end' },
  status: { padding: '5px 7px', fontSize: 9, letterSpacing: 1, fontWeight: 700 },
  active: { background: '#18351e', color: '#9cffaa' },
  inactive: { background: '#333', color: '#aaa' },
  expired: { background: '#3b2119', color: '#ffb09a' },
  smallButton: { background: 'transparent', border: '1px solid #444', color: '#ddd', padding: '6px 8px', fontSize: 9, letterSpacing: 1, cursor: 'pointer' },
};
