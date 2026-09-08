'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase-browser';

export default function LoginPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) window.location.replace('/');
    });
    return () => { active = false; };
  }, [supabase]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'register') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        window.location.replace(searchParams.get('next') || '/');
        return;
      } else {
        setMessage('Akun berhasil dibuat. Cek email untuk konfirmasi sebelum login.');
      }
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    window.location.replace(searchParams.get('next') || '/');
  };

  return (
    <main className="auth-shell">
      <div className="auth-contours" aria-hidden="true" />
      <section className="auth-card">
        <a className="brand" href="/" aria-label="Oxygen Gear Equipment">
          <span className="brand-mark" /> OXYGEN GEAR
        </a>
        <p className="eyebrow">MEMBER ACCESS / 01</p>
        <h1>{mode === 'login' ? 'MASUK.' : 'BUAT AKUN.'}</h1>
        <p className="intro">
          {mode === 'login'
            ? 'Masuk untuk mengakses Oxygen Gear Equipment.'
            : 'Buat akun untuk mulai menggunakan Oxygen Gear Equipment.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            autoComplete="email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />

          {error && <p className="feedback error">{error}</p>}
          {message && <p className="feedback success">{message}</p>}

          <button className="submit" type="submit" disabled={loading}>
            {loading ? 'MEMPROSES...' : mode === 'login' ? 'MASUK' : 'DAFTAR'}
          </button>
        </form>

        <div className="switch">
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage(''); }}>
            {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
          </button>
        </div>

        <p className="security">AUTHENTICATED BY SUPABASE · SECURE SESSION</p>
      </section>

      <style jsx>{`
        :global(*) { box-sizing: border-box; }
        :global(body) { margin: 0; background: #0b0b0a; }
        .auth-shell { min-height: 100vh; position: relative; overflow: hidden; display: grid; place-items: center; padding: 24px; background: #0b0b0a; color: #f7f6f3; font-family: Arial, sans-serif; }
        .auth-shell::before, .auth-shell::after { content: ''; position: absolute; width: 75vw; height: 75vw; border: 1px solid #2e2c28; border-radius: 50%; opacity: .65; }
        .auth-shell::before { transform: translate(-30%, 35%); }
        .auth-shell::after { transform: translate(35%, -35%); }
        .auth-card { position: relative; z-index: 2; width: min(460px, 100%); border: 1px solid #2e2c28; background: rgba(14,14,13,.96); padding: clamp(26px,6vw,48px); box-shadow: 0 30px 90px rgba(0,0,0,.45); }
        .brand { display: inline-flex; align-items: center; gap: 10px; color: #f7f6f3; text-decoration: none; font-weight: 800; letter-spacing: .05em; font-size: 15px; }
        .brand-mark { width: 13px; height: 13px; background: #e1261c; display: inline-block; }
        .eyebrow { margin: 48px 0 12px; color: #8c897f; font: 11px monospace; letter-spacing: .08em; }
        h1 { margin: 0; font-size: clamp(52px, 12vw, 76px); line-height: .9; letter-spacing: -.04em; }
        .intro { color: #d9d7d0; line-height: 1.6; margin: 20px 0 30px; font-size: 14px; }
        form { display: grid; gap: 10px; }
        label { color: #8c897f; font: 11px monospace; text-transform: uppercase; margin-top: 8px; }
        input { width: 100%; border: 1px solid #2e2c28; background: #0b0b0a; color: #f7f6f3; padding: 14px; outline: none; border-radius: 0; }
        input:focus { border-color: #e1261c; }
        .submit { margin-top: 12px; border: 1px solid #f7f6f3; background: #f7f6f3; color: #0b0b0a; padding: 14px 18px; font-weight: 800; letter-spacing: .05em; }
        .submit:hover:not(:disabled) { background: #e1261c; border-color: #e1261c; color: #fff; }
        .submit:disabled { opacity: .55; cursor: wait; }
        .feedback { margin: 8px 0 0; font-size: 13px; line-height: 1.5; }
        .error { color: #ff716a; }
        .success { color: #b8d9b8; }
        .switch { margin-top: 24px; color: #8c897f; text-align: center; font-size: 13px; }
        .switch button { border: 0; padding: 0; background: none; color: #f7f6f3; text-decoration: underline; cursor: pointer; }
        .security { margin: 34px 0 0; color: #55534e; font: 9px monospace; letter-spacing: .04em; text-align: center; }
      `}</style>
    </main>
  );
}
