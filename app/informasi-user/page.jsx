'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

export default function InformasiUserPage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: '', postal_code: '' });

  useEffect(() => {
    let active = true;
    async function loadUserData() {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      if (!active) return;
      if (!currentUser) {
        window.location.replace('/login?next=/informasi-user');
        return;
      }
      setUser(currentUser);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, address, city, postal_code, created_at, updated_at')
        .eq('id', currentUser.id)
        .maybeSingle();
      if (!active) return;
      if (profileError) setError('Data profil belum dapat dimuat. Silakan coba lagi.');
      else {
        setProfile(profileData);
        setForm({
          full_name: profileData?.full_name || '', phone: profileData?.phone || '', address: profileData?.address || '',
          city: profileData?.city || '', postal_code: profileData?.postal_code || '',
        });
      }
      setLoading(false);
    }
    loadUserData();
    return () => { active = false; };
  }, [supabase]);

  function startEditing() {
    setError(''); setMessage(''); setForm({
      full_name: profile?.full_name || '', phone: profile?.phone || '', address: profile?.address || '',
      city: profile?.city || '', postal_code: profile?.postal_code || '',
    });
    setEditing(true);
  }

  function cancelEditing() { setEditing(false); setError(''); setMessage(''); }

  function change(key, value) { setForm((current) => ({ ...current, [key]: value })); }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    const { data, error: saveError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...form, updated_at: new Date().toISOString() })
      .select('full_name, phone, address, city, postal_code, created_at, updated_at')
      .single();
    if (saveError) {
      setError('Profil gagal disimpan. Pastikan izin update profil di Supabase sudah aktif.');
      setSaving(false);
      return;
    }
    setProfile(data); setForm({ full_name: data.full_name || '', phone: data.phone || '', address: data.address || '', city: data.city || '', postal_code: data.postal_code || '' });
    setEditing(false); setMessage('Informasi profil berhasil diperbarui.'); setSaving(false);
  }

  async function logout() { await supabase.auth.signOut(); window.location.replace('/login'); }

  if (loading) return <main className="page"><p>Memuat informasi user...</p></main>;

  const fullName = profile?.full_name || '-';
  const phone = profile?.phone || '-';
  const address = profile?.address || '-';
  const city = profile?.city || '-';
  const postalCode = profile?.postal_code || '-';

  return (
    <main className="page">
      <header className="topbar"><a href="/" className="brand"><span className="mark" />OXYGEN GEAR</a><a href="/" className="back">Kembali ke beranda</a></header>
      <section className="content">
        <p className="eyebrow">MEMBER / USER INFORMATION</p><h1>INFORMASI<br /><em>USER.</em></h1>
        <p className="intro">Informasi akun dan data kontak yang tersimpan pada profil Oxygen Gear kamu.</p>
        {error && <p className="message error">{error}</p>}{message && <p className="message success">{message}</p>}

        {editing ? (
          <form className="edit-card card" onSubmit={saveProfile}>
            <div className="label">KELOLA INFORMASI</div>
            <label>Nama lengkap<input value={form.full_name} onChange={(e) => change('full_name', e.target.value)} required /></label>
            <label>Nomor telepon<input type="tel" value={form.phone} onChange={(e) => change('phone', e.target.value)} required /></label>
            <label>Alamat<textarea value={form.address} onChange={(e) => change('address', e.target.value)} rows={3} required /></label>
            <div className="two-col"><label>Kota / Kabupaten<input value={form.city} onChange={(e) => change('city', e.target.value)} required /></label><label>Kode pos<input inputMode="numeric" value={form.postal_code} onChange={(e) => change('postal_code', e.target.value)} required /></label></div>
            <div className="actions"><button className="btn primary" type="submit" disabled={saving}>{saving ? 'MENYIMPAN...' : 'SIMPAN INFORMASI'}</button><button className="btn" type="button" onClick={cancelEditing}>BATAL</button></div>
          </form>
        ) : (
          <>
            <div className="grid">
              <section className="card"><div className="label">AKUN</div><div className="row"><span>Email</span><strong>{user.email || '-'}</strong></div><div className="row"><span>Nama</span><strong>{fullName}</strong></div><div className="row"><span>User ID</span><strong className="mono">{user.id}</strong></div><div className="row"><span>Status email</span><strong>{user.email_confirmed_at ? 'Terverifikasi' : 'Belum terverifikasi'}</strong></div><div className="row"><span>Terdaftar</span><strong>{user.created_at ? new Date(user.created_at).toLocaleString('id-ID') : '-'}</strong></div></section>
              <section className="card"><div className="label">KONTAK & PENGIRIMAN</div><div className="row"><span>Nomor telepon</span><strong>{phone}</strong></div><div className="row"><span>Alamat</span><strong>{address}</strong></div><div className="row"><span>Kota</span><strong>{city}</strong></div><div className="row"><span>Kode pos</span><strong>{postalCode}</strong></div>{profile?.updated_at && <div className="row"><span>Profil diperbarui</span><strong>{new Date(profile.updated_at).toLocaleString('id-ID')}</strong></div>}</section>
            </div>
            <div className="actions"><a className="btn link" href="/pesanan-saya">PESANAN SAYA</a><button className="btn" type="button" onClick={startEditing}>KELOLA INFORMASI</button><button className="btn danger" type="button" onClick={logout}>KELUAR</button></div>
          </>
        )}
      </section>
      <style jsx>{`
        :global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif}.topbar{display:flex;align-items:center;justify-content:space-between;padding:20px clamp(16px,5vw,60px);border-bottom:1px solid #302e29;position:sticky;top:0;background:rgba(11,11,10,.96);backdrop-filter:blur(12px);z-index:5}.brand{color:#f7f6f3;text-decoration:none;font-weight:800;letter-spacing:.05em}.mark{display:inline-block;width:13px;height:13px;background:#e1261c;margin-right:9px}.back{color:#aaa69d;text-decoration:none;font-size:13px}.back:hover{color:#e1261c}.content{max-width:1050px;margin:0 auto;padding:80px 20px 100px}.eyebrow{font:11px monospace;color:#8b887f;letter-spacing:.08em;margin:0 0 18px}h1{font-size:clamp(54px,9vw,100px);line-height:.88;letter-spacing:-.04em;margin:0 0 25px}h1 em{font-style:normal;color:#e1261c}.intro{max-width:620px;color:#d8d5cd;line-height:1.65;margin-bottom:35px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{border:1px solid #302e29;background:#11110f;padding:24px}.label{font:10px monospace;color:#8b887f;letter-spacing:.08em;margin-bottom:18px}.row{display:flex;justify-content:space-between;gap:20px;padding:15px 0;border-bottom:1px solid #25231f}.row:last-child{border-bottom:0}.row span{color:#8b887f;font-size:13px}.row strong{text-align:right;font-size:13px;line-height:1.5;max-width:65%;overflow-wrap:anywhere}.mono{font:11px monospace;color:#aaa69d}.actions{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}.btn{border:1px solid #302e29;background:transparent;color:#f7f6f3;padding:12px 16px;cursor:pointer;font-weight:700}.btn.link{display:inline-flex;align-items:center;text-decoration:none}.btn:hover:not(:disabled){border-color:#e1261c;color:#e1261c}.btn.primary{border-color:#f7f6f3;background:#f7f6f3;color:#0b0b0a}.btn.primary:hover:not(:disabled){background:#e1261c;border-color:#e1261c;color:#fff}.danger:hover:not(:disabled){background:#e1261c;color:#fff}.message{font-size:13px;line-height:1.5;margin:0 0 20px}.message.error{color:#ff716a}.message.success{color:#b8d9b8}.edit-card{max-width:800px;display:grid;gap:10px}.edit-card label{display:grid;gap:7px;color:#8b887f;font:10px monospace;text-transform:uppercase;margin-top:7px}.edit-card input,.edit-card textarea{width:100%;border:1px solid #302e29;background:#0b0b0a;color:#f7f6f3;padding:13px;outline:none;font:13px Arial;resize:vertical}.edit-card input:focus,.edit-card textarea:focus{border-color:#e1261c}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}.btn:disabled{opacity:.5;cursor:wait}@media(max-width:700px){.grid{grid-template-columns:1fr}.two-col{grid-template-columns:1fr}.topbar{gap:15px}.content{padding-top:55px}.row{align-items:flex-start;flex-direction:column;gap:5px}.row strong{text-align:left;max-width:100%}}
      `}</style>
    </main>
  );
}