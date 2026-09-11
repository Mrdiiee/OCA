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
      if (data.user.email_confirmed_at) { window.location.replace('/informasi-user'); return; }
      await supabase.auth.signOut();
    });
    return () => { active = false; };
  }, [mode, supabase]);

  const getNextPath = () => {
    if (typeof window === 'undefined') return '/';
    const next = new URLSearchParams(window.location.search).get('next');
    return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); setError(''); setMessage('');
    if (mode === 'reset') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (resetError) { setError(resetError.message); setLoading(false); return; }
      setMessage('Link reset password sudah dikirim. Cek email Anda.'); setLoading(false); return;
    }
    if (mode === 'register') {
      if (password.length < 6) { setError('Password minimal 6 karakter.'); setLoading(false); return; }
      if (password !== confirmPassword) { setError('Konfirmasi password tidak sama.'); setLoading(false); return; }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: `${window.location.origin}/login`, data: { full_name: fullName.trim(), phone: phone.trim(), address: address.trim(), city: city.trim(), postal_code: postalCode.trim() } },
      });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
      if (data.session && data.user?.email_confirmed_at) { window.location.replace(getNextPath()); return; }
      if (data.session) await supabase.auth.signOut();
      setMessage('Akun berhasil dibuat. Cek email untuk konfirmasi sebelum login.'); setLoading(false); return;
    }
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) { setError('Email atau password tidak benar.'); setLoading(false); return; }
    if (!data.user?.email_confirmed_at) { await supabase.auth.signOut(); setError('Email belum diverifikasi. Silakan cek email Anda.'); setLoading(false); return; }
    window.location.replace(getNextPath());
  };

  const switchMode = (nextMode) => { setMode(nextMode); setError(''); setMessage(''); setPassword(''); setConfirmPassword(''); };
  const isReset = mode === 'reset';

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <a className="brand" href="/" aria-label="Oxygen Gear Equipment"><span className="brand-mark" />OXYGEN GEAR</a>
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
        <div className="switch">{isReset ? <button type="button" onClick={() => switchMode('login')}>Kembali ke login</button> : mode === 'login' ? <><span>Belum punya akun? </span><button type="button" onClick={() => switchMode('register')}>Daftar sekarang</button><br /><button className="forgot" type="button" onClick={() => switchMode('reset')}>Lupa password?</button></> : <>Sudah punya akun? <button type="button" onClick={() => switchMode('login')}>Masuk</button></>}</div>
        <a className="admin-entry" href="/admin/login">LOGIN KHUSUS ADMIN OCA →</a>
        <p className="security">AUTHENTICATED BY SUPABASE · EMAIL VERIFICATION REQUIRED</p>
      </section>
      <style jsx>{`:global(*){box-sizing:border-box}:global(body){margin:0;background:#fff}.auth-shell{min-height:100vh;position:relative;overflow:hidden;display:grid;place-items:center;padding:24px;background:#f5f5f3;color:#111;font-family:Arial,Helvetica,sans-serif}.auth-shell::before,.auth-shell::after{content:'';position:absolute;width:65vw;height:65vw;border:1px solid #dededb;border-radius:50%;pointer-events:none}.auth-shell::before{transform:translate(-42%,38%)}.auth-shell::after{transform:translate(42%,-38%)}.auth-card{position:relative;z-index:2;width:min(540px,100%);max-height:calc(100vh - 48px);overflow-y:auto;border:1px solid #dededb;background:rgba(255,255,255,.97);padding:clamp(26px,6vw,50px);box-shadow:0 28px 80px rgba(0,0,0,.1)}.brand{display:inline-flex;align-items:center;gap:10px;color:#111;text-decoration:none;font-weight:800;letter-spacing:.05em;font-size:15px}.brand-mark{width:13px;height:13px;background:#e1261c;display:inline-block}.eyebrow{margin:48px 0 12px;color:#777;font:10px monospace;letter-spacing:.1em}h1{margin:0;font-size:clamp(54px,12vw,82px);line-height:.9;letter-spacing:-.05em}.intro{color:#555;line-height:1.65;margin:20px 0 30px;font-size:14px}form{display:grid;gap:10px}label{color:#666;font:10px monospace;text-transform:uppercase;margin-top:8px}input,textarea{width:100%;border:1px solid #d7d7d4;background:#fff;color:#111;padding:14px;outline:none;border-radius:0;font:inherit;resize:vertical}input:focus,textarea:focus{border-color:#111;box-shadow:inset 3px 0 0 #e1261c}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}.two-col>div{min-width:0;display:grid;gap:10px}.submit{margin-top:12px;border:1px solid #111;background:#111;color:#fff;padding:14px 18px;font-weight:800;letter-spacing:.05em;cursor:pointer}.submit:hover:not(:disabled){background:#e1261c;border-color:#e1261c}.submit:disabled{opacity:.55;cursor:wait}.feedback{margin:8px 0 0;font-size:13px;line-height:1.5}.error{color:#b31d16;background:#fff7f6;border:1px solid #efc2be;padding:10px}.success{color:#38643b;background:#f5faf5;border:1px solid #c9dec9;padding:10px}.switch{margin-top:24px;color:#777;text-align:center;font-size:13px;line-height:2}.switch button{border:0;padding:0;background:none;color:#111;text-decoration:underline;cursor:pointer}.switch .forgot{color:#e1261c}.admin-entry{display:block;margin-top:24px;padding:12px;border:1px solid #d7d7d4;color:#555;text-align:center;text-decoration:none;font:10px monospace;letter-spacing:.05em}.admin-entry:hover{border-color:#111;color:#111}.security{margin:26px 0 0;color:#aaa;font:9px monospace;letter-spacing:.04em;text-align:center}@media(max-width:520px){.two-col{grid-template-columns:1fr}.auth-shell{padding:12px}.auth-card{max-height:calc(100vh - 24px);padding:26px 20px}}`}</style>
    </main>
  );
}
