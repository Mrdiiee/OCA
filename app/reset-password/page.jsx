'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError || !data.session) {
        setError('Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru.');
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [supabase]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage('Password berhasil diubah. Anda akan diarahkan ke halaman login.');
    setPassword('');
    setConfirmPassword('');
    await supabase.auth.signOut();
    setTimeout(() => window.location.replace('/login'), 900);
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <a className="brand" href="/" aria-label="Oxygen Gear Equipment">
          <span className="brand-mark" />
          OXYGEN GEAR
        </a>

        <p className="eyebrow">ACCOUNT SECURITY / 02</p>
        <h1>UBAH<br />PASSWORD.</h1>
        <p className="intro">
          {loading ? 'Memeriksa sesi reset password...' : 'Buat password baru untuk akun Oxygen Gear Equipment.'}
        </p>

        {!loading && !error && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="password">Password baru</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" autoComplete="new-password" minLength={6} required />

            <label htmlFor="confirmPassword">Konfirmasi password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" autoComplete="new-password" minLength={6} required />

            {message && <p className="feedback success">{message}</p>}

            <button className="submit" type="submit" disabled={saving}>
              {saving ? 'MENYIMPAN...' : 'UBAH PASSWORD'}
            </button>
          </form>
        )}

        {error && <p className="feedback error">{error}</p>}

        <div className="links">
          <a href="/login">Kembali ke login</a>
          <a href="/">Kembali ke website</a>
        </div>

        <p className="security">AUTHENTICATED BY SUPABASE · SECURE SESSION</p>
      </section>

      <style jsx>{`
        :global(*) { box-sizing: border-box; }
        :global(body) { margin: 0; background: #0b0b0a; }
        .auth-shell { min-height: 100vh; position: relative; overflow: hidden; display: grid; place-items: center; padding: 24px; background: #0b0b0a; color: #f7f6f3; font-family: Arial, sans-serif; }
        .auth-shell::before, .auth-shell::after { content: ''; position: absolute; width: 75vw; height: 75vw; border: 1px solid #2e2c28; border-radius: 50%; opacity: .65; pointer-events: none; }
        .auth-shell::before { transform: translate(-30%, 35%); }
        .auth-shell::after { transform: translate(35%, -35%); }
        .auth-card { position: relative; z-index: 2; width: min(520px, 100%); border: 1px solid #2e2c28; background: rgba(14, 14, 13, .96); padding: clamp(26px, 6vw, 48px); box-shadow: 0 30px 90px rgba(0, 0, 0, .45); }
        .brand { display: inline-flex; align-items: center; gap: 10px; color: #f7f6f3; text-decoration: none; font-weight: 800; letter-spacing: .05em; font-size: 15px; }
        .brand-mark { width: 13px; height: 13px; background: #e1261c; display: inline-block; }
        .eyebrow { margin: 48px 0 12px; color: #8c897f; font: 11px monospace; letter-spacing: .08em; }
        h1 { margin: 0; font-size: clamp(44px, 11vw, 72px); line-height: .9; letter-spacing: -.04em; }
        .intro { color: #d9d7d0; line-height: 1.6; margin: 20px 0 30px; font-size: 14px; }
        form { display: grid; gap: 10px; }
        label { color: #8c897f; font: 11px monospace; text-transform: uppercase; margin-top: 8px; }
        input { width: 100%; border: 1px solid #2e2c28; background: #0b0b0a; color: #f7f6f3; padding: 14px; outline: none; border-radius: 0; font: inherit; }
        input:focus { border-color: #e1261c; }
        .submit { margin-top: 12px; border: 1px solid #f7f6f3; background: #f7f6f3; color: #0b0b0a; padding: 14px 18px; font-weight: 800; letter-spacing: .05em; cursor: pointer; }
        .submit:hover:not(:disabled) { background: #e1261c; border-color: #e1261c; color: #fff; }
        .submit:disabled { opacity: .55; cursor: wait; }
        .feedback { margin: 14px 0 0; font-size: 13px; line-height: 1.5; }
        .error { color: #ff716a; }
        .success { color: #b8d9b8; }
        .links { display: flex; justify-content: space-between; gap: 16px; margin-top: 24px; }
        .links a { color: #f7f6f3; font-size: 13px; text-decoration: underline; }
        .security { margin: 34px 0 0; color: #55534e; font: 9px monospace; letter-spacing: .04em; text-align: center; }
        @media (max-width: 520px) { .auth-shell { padding: 12px; } .links { flex-direction: column; } }
      `}</style>
    </main>
  );
}
