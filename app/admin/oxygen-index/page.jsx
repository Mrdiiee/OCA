'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const FIELDS = [
  ['experience_score', 'PENGALAMAN OUTDOOR', 25],
  ['safety_score', 'KESIAPAN & SAFETY', 25],
  ['field_skill_score', 'SKILL LAPANGAN', 20],
  ['discipline_score', 'DISIPLIN & TANGGUNG JAWAB', 15],
  ['contribution_score', 'KONTRIBUSI KE TIM / KOMUNITAS', 15],
];

function emptyScores() {
  return Object.fromEntries(FIELDS.map(([key]) => [key, 0]));
}

export default function AdminOxygenIndexPage() {
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [scores, setScores] = useState(emptyScores());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selected = useMemo(() => members.find((member) => member.id === selectedId) || null, [members, selectedId]);
  const total = Object.values(scores).reduce((sum, value) => sum + Number(value || 0), 0);
  const level = total >= 90 ? 'OXYGEN CORE' : total >= 75 ? 'ADVANCED' : total >= 50 ? 'FIELD READY' : total >= 25 ? 'TRAIL READY' : 'FOUNDATION';

  async function load() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/oxygen-index', { cache: 'no-store' });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) { window.location.href = '/admin/login'; return; }
      if (!response.ok) throw new Error(data.error || 'Data Oxygen Index gagal dimuat.');
      setMembers(data.members || []);
    } catch (err) { setError(err.message || 'Data Oxygen Index gagal dimuat.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function selectMember(id) {
    setSelectedId(id); setMessage(''); setError('');
    const member = members.find((item) => item.id === id);
    const assessment = member?.assessment;
    setScores(assessment ? Object.fromEntries(FIELDS.map(([key]) => [key, assessment[key] ?? 0])) : emptyScores());
    setNotes(assessment?.notes || '');
  }

  function changeScore(key, value) {
    const max = FIELDS.find(([field]) => field === key)?.[2] || 0;
    const number = Math.max(0, Math.min(max, Number(value) || 0));
    setScores((current) => ({ ...current, [key]: number }));
  }

  async function save(event) {
    event.preventDefault();
    if (!selectedId) { setError('Pilih member terlebih dahulu.'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/oxygen-index', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedId, ...scores, notes }),
      });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) { window.location.href = '/admin/login'; return; }
      if (!response.ok) throw new Error(data.error || 'Penilaian gagal disimpan.');
      setMessage(`Oxygen Index ${data.assessment.total_score}/100 berhasil disimpan untuk ${selected?.full_name || 'member'}.`);
      await load();
    } catch (err) { setError(err.message || 'Penilaian gagal disimpan.'); }
    finally { setSaving(false); }
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div><div style={styles.kicker}>OXYGEN GEAR / ADMIN</div><h1 style={styles.title}>OXYGEN INDEX</h1><p style={styles.sub}>Tetapkan kualifikasi member berdasarkan penilaian tim Oxygen.</p></div>
          <nav style={styles.nav}><Link href="/admin" style={styles.link}>ADMIN</Link><Link href="/admin/member" style={styles.link}>MEMBER</Link><Link href="/" style={styles.link}>BERANDA</Link></nav>
        </header>

        <section style={styles.card}>
          <div style={styles.sectionTitle}>PILIH MEMBER</div>
          {loading ? <p style={styles.muted}>Memuat member...</p> : <select value={selectedId} onChange={(e) => selectMember(e.target.value)} style={styles.select}><option value="">Pilih member...</option>{members.map((member) => <option key={member.id} value={member.id}>{member.full_name || 'Tanpa nama'}{member.city ? ` — ${member.city}` : ''}</option>)}</select>}
          {selected && <div style={styles.memberMeta}><strong>{selected.full_name || 'Tanpa nama'}</strong><span>{selected.phone || 'Nomor belum diisi'}{selected.assessment ? ` · Index terakhir ${selected.assessment.total_score}/100` : ' · Belum pernah dinilai'}</span></div>}
        </section>

        <form onSubmit={save}>
          <section style={styles.card}>
            <div style={styles.sectionHead}><div><div style={styles.sectionTitle}>PENILAIAN</div><p style={styles.hint}>Masukkan skor sesuai bukti pengalaman dan evaluasi tim. Total maksimal 100.</p></div><div style={styles.total}><b>{total}</b><span>/100</span><small>{level}</small></div></div>
            <div style={styles.fields}>
              {FIELDS.map(([key, label, max]) => <label key={key} style={styles.field}><span>{label}<small>MAX {max}</small></span><div style={styles.inputWrap}><input type="number" min="0" max={max} step="1" value={scores[key]} onChange={(e) => changeScore(key, e.target.value)} style={styles.input} /><em>/{max}</em></div></label>)}
            </div>
            <label style={styles.notesLabel}>CATATAN EVALUATOR<textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} rows={5} placeholder="Contoh: konsisten dalam safety briefing, berpengalaman di beberapa jalur teknis..." style={styles.textarea} /></label>
            <button disabled={saving || !selectedId} style={styles.button}>{saving ? 'MENYIMPAN...' : 'SIMPAN PENILAIAN BARU'}</button>
            {message && <p style={styles.message}>{message}</p>}{error && <p style={styles.error}>{error}</p>}
          </section>
        </form>

        <section style={styles.card}><div style={styles.sectionTitle}>STANDAR OXYGEN INDEX</div><div style={styles.levels}>{[['0–24','FOUNDATION'],['25–49','TRAIL READY'],['50–74','FIELD READY'],['75–89','ADVANCED'],['90–100','OXYGEN CORE']].map(([range, name]) => <div key={name} style={styles.levelRow}><strong>{range}</strong><span>{name}</span></div>)}</div></section>
      </div>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0b0b0b', color: '#f4f4f4', padding: '42px 20px', fontFamily: 'Arial, sans-serif' }, shell: { maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end', marginBottom: 28, borderBottom: '1px solid #292929', paddingBottom: 22 }, kicker: { fontSize: 11, letterSpacing: 2.5, color: '#a3a3a3', marginBottom: 8 }, title: { margin: 0, fontSize: 42, letterSpacing: 1 }, sub: { margin: '8px 0 0', color: '#9d9d9d' }, nav: { display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }, link: { color: '#fff', fontSize: 11, letterSpacing: 1.2, textDecoration: 'none' },
  card: { background: '#111', border: '1px solid #292929', padding: 24, marginBottom: 18 }, sectionTitle: { fontSize: 12, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }, hint: { margin: 0, color: '#777', fontSize: 12, lineHeight: 1.5 }, select: { width: '100%', background: '#0b0b0b', border: '1px solid #444', color: '#fff', padding: '14px 12px', fontSize: 14 }, memberMeta: { display: 'flex', justifyContent: 'space-between', gap: 15, marginTop: 15, paddingTop: 15, borderTop: '1px solid #252525', fontSize: 13 }, muted: { color: '#777' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start', marginBottom: 24 }, total: { minWidth: 130, textAlign: 'right' }, total: { minWidth: 150, textAlign: 'right' }, total: { minWidth: 150, textAlign: 'right' },
  total: { minWidth: 150, textAlign: 'right' }, total: { minWidth: 150, textAlign: 'right' },
  fields: { display: 'grid', gap: 12 }, field: { display: 'grid', gridTemplateColumns: '1fr 130px', gap: 20, alignItems: 'center', padding: '15px 0', borderTop: '1px solid #252525' }, field: { display: 'grid', gridTemplateColumns: '1fr 130px', gap: 20, alignItems: 'center', padding: '15px 0', borderTop: '1px solid #252525' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: 6 }, input: { width: '100%', background: '#0b0b0b', border: '1px solid #444', color: '#fff', padding: '11px', fontSize: 15, textAlign: 'right' }, fieldLabel: { color: '#ddd' },
  notesLabel: { display: 'grid', gap: 8, marginTop: 22, fontSize: 10, letterSpacing: 1.4, color: '#aaa' }, textarea: { width: '100%', boxSizing: 'border-box', background: '#0b0b0b', border: '1px solid #333', color: '#fff', padding: 12, font: '13px Arial', resize: 'vertical' }, button: { marginTop: 20, width: '100%', border: 0, background: '#fff', color: '#000', padding: 15, fontWeight: 800, letterSpacing: 1, cursor: 'pointer' }, message: { color: '#b8ffb8', fontSize: 13 }, error: { color: '#ff8e8e', fontSize: 13 }, levels: { display: 'grid', gap: 0 }, levelRow: { display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid #252525', fontSize: 12 },
};

styles.field = { ...styles.field, }; 
// Keep the score labels compact without introducing a separate stylesheet.
