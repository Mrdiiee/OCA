'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

export default function InformasiUserPage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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

      if (profileError) {
        console.error('Gagal memuat profil:', profileError);
        setMessage('Data profil belum dapat dimuat. Silakan coba lagi.');
      } else {
        setProfile(profileData);
      }

      setLoading(false);
    }

    loadUserData();
    return () => { active = false; };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace('/login');
  }

  if (loading) {
    return <main className="page"><p>Memuat informasi user...</p></main>;
  }

  const fullName = profile?.full_name || '-';
  const phone = profile?.phone || '-';
  const address = profile?.address || '-';
  const city = profile?.city || '-';
  const postalCode = profile?.postal_code || '-';

  return (
    <main className="page">
      <header className="topbar">
        <a href="/" className="brand"><span className="mark" />OXYGEN GEAR</a>
        <a href="/" className="back">Kembali ke beranda</a>
      </header>

      <section className="content">
        <p className="eyebrow">MEMBER / USER INFORMATION</p>
        <h1>INFORMASI<br /><em>USER.</em></h1>
        <p className="intro">Informasi akun dan data kontak yang tersimpan pada profil Oxygen Gear kamu.</p>

        <div className="grid">
          <section className="card">
            <div className="label">AKUN</div>
            <div className="row"><span>Email</span><strong>{user.email || '-'}</strong></div>
            <div className="row"><span>Nama</span><strong>{fullName}</strong></div>
            <div className="row"><span>User ID</span><strong className="mono">{user.id}</strong></div>
            <div className="row"><span>Status email</span><strong>{user.email_confirmed_at ? 'Terverifikasi' : 'Belum terverifikasi'}</strong></div>
            <div className="row"><span>Terdaftar</span><strong>{user.created_at ? new Date(user.created_at).toLocaleString('id-ID') : '-'}</strong></div>
          </section>

          <section className="card">
            <div className="label">KONTAK & PENGIRIMAN</div>
            <div className="row"><span>Nomor telepon</span><strong>{phone}</strong></div>
            <div className="row"><span>Alamat</span><strong>{address}</strong></div>
            <div className="row"><span>Kota</span><strong>{city}</strong></div>
            <div className="row"><span>Kode pos</span><strong>{postalCode}</strong></div>
            {profile?.updated_at && (
              <div className="row"><span>Profil diperbarui</span><strong>{new Date(profile.updated_at).toLocaleString('id-ID')}</strong></div>
            )}
          </section>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="actions">
          <button className="btn" onClick={() => setMessage('Fitur edit profil akan menggunakan tabel profiles yang sama.')}>Kelola informasi</button>
          <button className="btn danger" onClick={logout}>Keluar</button>
        </div>
      </section>

      <style jsx>{`
        :global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}
        .page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:20px clamp(16px,5vw,60px);border-bottom:1px solid #302e29;position:sticky;top:0;background:rgba(11,11,10,.96);backdrop-filter:blur(12px);z-index:5}
        .brand{color:#f7f6f3;text-decoration:none;font-weight:800;letter-spacing:.05em}.mark{display:inline-block;width:13px;height:13px;background:#e1261c;margin-right:9px}
        .back{color:#aaa69d;text-decoration:none;font-size:13px}.back:hover{color:#e1261c}
        .content{max-width:1050px;margin:0 auto;padding:80px 20px 100px}.eyebrow{font:11px monospace;color:#8b887f;letter-spacing:.08em;margin:0 0 18px}
        h1{font-size:clamp(54px,9vw,100px);line-height:.88;letter-spacing:-.04em;margin:0 0 25px}h1 em{font-style:normal;color:#e1261c}.intro{max-width:620px;color:#d8d5cd;line-height:1.65;margin-bottom:50px}
        .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{border:1px solid #302e29;background:#11110f;padding:24px}.label{font:10px monospace;color:#8b887f;letter-spacing:.08em;margin-bottom:18px}.row{display:flex;justify-content:space-between;gap:20px;padding:15px 0;border-bottom:1px solid #25231f}.row:last-child{border-bottom:0}.row span{color:#8b887f;font-size:13px}.row strong{text-align:right;font-size:13px;line-height:1.5;max-width:65%;overflow-wrap:anywhere}.mono{font:11px monospace;color:#aaa69d}
        .actions{display:flex;gap:10px;margin-top:24px}.btn{border:1px solid #302e29;background:transparent;color:#f7f6f3;padding:12px 16px;cursor:pointer}.btn:hover{border-color:#e1261c;color:#e1261c}.danger:hover{background:#e1261c;color:#fff}.message{color:#aaa69d;font-size:13px;margin-top:24px}
        @media(max-width:700px){.grid{grid-template-columns:1fr}.topbar{gap:15px}.back{font-size:12px}.content{padding-top:55px}.row{align-items:flex-start;flex-direction:column;gap:5px}.row strong{text-align:left;max-width:100%}}
      `}</style>
    </main>
  );
}
