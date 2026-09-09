'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'reset') return undefined;
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      if (data.user.email_confirmed_at) {
        const next = new URLSearchParams(window.location.search).get('next');
        if (next === '/informasi-user') {
          window.location.replace('/informasi-user');
        } else {
          window.location.replace('/');
        }
        return;
      }
      await supabase.auth.signOut();
    });
    return () => { active = false; };
  }, [mode, supabase]);

  const getNextPath = () => {
    if (typeof window === 'undefined') return '/';
    const next = new URLSearchParams(window.location.search).get('next');
    return next && next.startsWith('/') ? next : '/';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); setError(''); setMessage('');
    if (mode === 'reset') {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetError) { setError(resetError.message); setLoading(false); return; }
      setMessage('Link reset password sudah dikirim. Cek email Anda dan ikuti link tersebut.');
      setLoading(false); return;
    }
    if (mode === 'register') {
      if (password !== confirmPassword) { setError('Konfirmasi password tidak sama.'); setLoading(false); return; }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, phone, address, city, postal_code: postalCode } },
      });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
      if (data.session) {
        if (data.user?.email_confirmed_at) { window.location.replace(getNextPath()); return; }
        await supabase.auth.signOut();
      }
      setMessage('Akun berhasil dibuat. Cek email untuk konfirmasi sebelum login.');
      setLoading(false); return;
    }
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError(signInError.message); setLoading(false); return; }
    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      setError('Email belum diverifikasi. Silakan cek email Anda dan lakukan konfirmasi terlebih dahulu.');
      setLoading(false); return;
    }
    window.location.replace(getNextPath());
  };

  const switchMode = (nextMode) => {
    setMode(nextMode); setError(''); setMessage(''); setPassword(''); setConfirmPassword('');
  };
  const isReset = mode === 'reset';

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand" aria-label="Oxygen Gear Equipment"><span className="brand-mark" />OXYGEN GEAR</div>
        <p className="eyebrow">MEMBER ACCESS / 01</p>
        <h1>{isReset ? 'RESET.' : mode === 'login' ? 'MASUK.' : 'BUAT AKUN.'}</h1>
        <p className="intro">{isReset ? 'Masukkan email akun Anda. Kami akan mengirim link untuk membuat password baru.' : mode === 'login' ? 'Masuk untuk mengakses Oxygen Gear Equipment.' : 'Lengkapi data diri untuk membuat akun Oxygen Gear Equipment.'}</p>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && <>
            <label htmlFor="fullName">Nama lengkap</label><input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap" autoComplete="name" required />
            <label htmlFor="phone">Nomor HP</label><input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" required />
            <label htmlFor="address">Alamat lengkap</label><textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jalan, nomor rumah, kecamatan" autoComplete="street-address" rows={3} required />
            <div className="two-col"><div><label htmlFor="city">Kota / Kabupaten</label><input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kota" autoComplete="address-level2" required /></div><div><label htmlFor="postalCode">Kode pos</label><input id="postalCode" type="text" inputMode="numeric" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="12345" autoComplete="postal-code" required /></div></div>
          </>}
          <label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required />
          {!isReset && <><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required /></>}
          {mode === 'register' && <><label htmlFor="confirmPassword">Konfirmasi password</label><input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" autoComplete="new-password" minLength={6} required /></>}
          {error && <p className="feedback error">{error}</p>}{message && <p className="feedback success">{message}</p>}
          <button className="submit" type="submit" disabled={loading}>{loading ? 'MEMPROSES...' : isReset ? 'KIRIM LINK RESET' : mode === 'login' ? 'MASUK' : 'DAFTAR'}</button>
        </form>
        <div className="switch">
          {isReset ? <button type="button" onClick={() => switchMode('login')}>Kembali ke login</button> : mode === 'login' ? <><span>Belum punya akun? </span><button type="button" onClick={() => switchMode('register')}>Daftar sekarang</button><br /><button className="forgot" type="button" onClick={() => switchMode('reset')}>Lupa password?</button></> : <>Sudah punya akun? <button type="button" onClick={() => switchMode('login')}>Masuk</button></>}
        </div>
        <a className="admin-entry" href="/admin/login">LOGIN KHUSUS ADMIN OCA →</a>
        <p className="security">AUTHENTICATED BY SUPABASE · EMAIL VERIFICATION REQUIRED</p>
      </section>
      <style jsx>{`:global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.auth-shell{min-height:100vh;position:relative;overflow:hidden;display:grid;place-items:center;padding:24px;background:#0b0b0a;color:#f7f6f3;font-family:Arial,sans-serif}.auth-shell::before,.auth-shell::after{content:'';position:absolute;width:75vw;height:75vw;border:1px solid #2e2c28;border-radius:50%;opacity:.65;pointer-events:none}.auth-shell::before{transform:translate(-30%,35%)}.auth-shell::after{transform:translate(35%,-35%)}.auth-card{position:relative;z-index:2;width:min(520px,100%);max-height:calc(100vh - 48px);overflow-y:auto;border:1px solid #2e2c28;background:rgba(14,14,13,.96);padding:clamp(26px,6vw,48px);box-shadow:0 30px 90px rgba(0,0,0,.45)}.brand{display:inline-flex;align-items:center;gap:10px;color:#f7f6f3;font-weight:800;letter-spacing:.05em;font-size:15px}.brand-mark{width:13px;height:13px;background:#e1261c;display:inline-block}.eyebrow{margin:48px 0 12px;color:#8c897f;font:11px monospace;letter-spacing:.08em}h1{margin:0;font-size:clamp(52px,12vw,76px);line-height:.9;letter-spacing:-.04em}.intro{color:#d9d7d0;line-height:1.6;margin:20px 0 30px;font-size:14px}form{display:grid;gap:10px}label{color:#8c897f;font:11px monospace;text-transform:uppercase;margin-top:8px}input,textarea{width:100%;border:1px solid #2e2c28;background:#0b0b0a;color:#f7f6f3;padding:14px;outline:none;border-radius:0;font:inherit;resize:vertical}input:focus,textarea:focus{border-color:#e1261c}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}.two-col>div{min-width:0;display:grid;gap:10px}.submit{margin-top:12px;border:1px solid #f7f6f3;background:#f7f6f3;color:#0b0b0a;padding:14px 18px;font-weight:800;letter-spacing:.05em;cursor:pointer}.submit:hover:not(:disabled){background:#e1261c;border-color:#e1261c;color:#fff}.submit:disabled{opacity:.55;cursor:wait}.feedback{margin:8px 0 0;font-size:13px;line-height:1.5}.error{color:#ff716a}.success{color:#b8d9b8}.switch{margin-top:24px;color:#8c897f;text-align:center;font-size:13px;line-height:2}.switch button{border:0;padding:0;background:none;color:#f7f6f3;text-decoration:underline;cursor:pointer}.switch .forgot{color:#e1261c}.admin-entry{display:block;margin-top:24px;padding:12px;border:1px solid #5b2b28;color:#ff8178;text-align:center;text-decoration:none;font:11px monospace;letter-spacing:.05em}.admin-entry:hover{border-color:#e1261c;background:#1a0d0c;color:#fff}.security{margin:26px 0 0;color:#55534e;font:9px monospace;letter-spacing:.04em;text-align:center}@media(max-width:520px){.two-col{grid-template-columns:1fr}.auth-shell{padding:12px}.auth-card{max-height:calc(100vh - 24px)}}`}</style>
    </main>
  );
}
