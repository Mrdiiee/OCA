'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase-browser';

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.replace('/admin/login');
        return;
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!adminUser) {
        await supabase.auth.signOut();
        window.location.replace('/admin/login');
        return;
      }

      setAuthorized(true);
      setChecking(false);
    }

    checkAccess();
  }, [supabase]);

  if (checking || !authorized) {
    return <main style={styles.page}><p style={styles.muted}>Memeriksa akses admin...</p></main>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <div style={styles.kicker}>OXYGEN GEAR / RESTRICTED ACCESS</div>
            <h1 style={styles.title}>ADMIN.</h1>
            <p style={styles.sub}>Pusat pengelolaan operasional OCA.</p>
          </div>
          <button style={styles.logout} onClick={async () => { await supabase.auth.signOut(); window.location.replace('/admin/login'); }}>KELUAR</button>
        </header>

        <section style={styles.grid}>
          <Link href="/admin/member" style={styles.card}>
            <span style={styles.number}>01</span>
            <span style={styles.cardTitle}>MEMBER</span>
            <span style={styles.cardText}>Buat kode member peserta event, salin kode, dan aktifkan/nonaktifkan kode.</span>
            <span style={styles.cta}>KELOLA MEMBER →</span>
          </Link>

          <Link href="/admin/pengiriman" style={styles.card}>
            <span style={styles.number}>02</span>
            <span style={styles.cardTitle}>PENGIRIMAN</span>
            <span style={styles.cardText}>Kelola status pesanan, kurir, nomor resi, dan estimasi pengiriman.</span>
            <span style={styles.cta}>KELOLA PENGIRIMAN →</span>
          </Link>
        </section>

        <nav style={styles.bottomNav}>
          <Link href="/" style={styles.bottomLink}>BERANDA</Link>
          <Link href="/member" style={styles.bottomLink}>HALAMAN MEMBER</Link>
          <Link href="/status-pengiriman" style={styles.bottomLink}>STATUS PELANGGAN</Link>
        </nav>
      </div>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0b0b0b', color: '#f4f4f4', padding: '42px 20px', fontFamily: 'Arial, sans-serif' },
  shell: { maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, borderBottom: '1px solid #292929', paddingBottom: 24, marginBottom: 24 },
  kicker: { fontSize: 10, letterSpacing: 2.5, color: '#8f8f8f', marginBottom: 10 },
  title: { margin: 0, fontSize: 'clamp(58px, 10vw, 100px)', lineHeight: .85, letterSpacing: -4 },
  sub: { color: '#9d9d9d', margin: '16px 0 0', fontSize: 14 },
  logout: { background: 'transparent', border: '1px solid #555', color: '#fff', padding: '10px 14px', cursor: 'pointer', fontSize: 10, letterSpacing: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 },
  card: { display: 'flex', flexDirection: 'column', minHeight: 300, padding: 28, border: '1px solid #292929', background: '#111', color: '#fff', textDecoration: 'none' },
  number: { color: '#e1261c', font: '11px monospace', letterSpacing: 1, marginBottom: 65 },
  cardTitle: { fontSize: 34, fontWeight: 800, letterSpacing: 1 },
  cardText: { color: '#999', lineHeight: 1.6, fontSize: 13, maxWidth: 420, marginTop: 12 },
  cta: { marginTop: 'auto', paddingTop: 24, fontSize: 10, fontWeight: 800, letterSpacing: 1.5 },
  bottomNav: { display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 24 },
  bottomLink: { color: '#777', textDecoration: 'none', fontSize: 10, letterSpacing: 1 },
  muted: { color: '#777', padding: 40, textAlign: 'center' },
};
