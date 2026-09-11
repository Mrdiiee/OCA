'use client';

import { useMemo, useState } from 'react';
import { createClient } from '../../../lib/supabase-browser';

export default function AdminLoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault(); setLoading(true); setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) { setError('Email atau password admin tidak valid.'); setLoading(false); return; }
    if (!data.user?.email_confirmed_at) { await supabase.auth.signOut(); setError('Email admin belum diverifikasi. Verifikasi email terlebih dahulu.'); setLoading(false); return; }
    const { data: adminUser, error: adminError } = await supabase.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (adminError || !adminUser) { await supabase.auth.signOut(); setError('Akun ini bukan akun admin. Gunakan login pelanggan untuk akun biasa.'); setLoading(false); return; }
    window.location.replace('/admin');
  }

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <a className="brand" href="/"><span className="mark" />OXYGEN GEAR</a>
        <p className="eyebrow">RESTRICTED ACCESS / ADMIN</p>
        <h1>ADMIN.</h1>
        <p className="intro">Area khusus administrator Oxygen Gear. Hanya akun yang terdaftar sebagai admin dan sudah terverifikasi yang dapat masuk.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email admin</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" autoComplete="username" required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'MEMERIKSA...' : 'MASUK ADMIN'}</button>
        </form>
        <a className="customer" href="/login">← Login pelanggan</a>
        <p className="security">OCA ADMIN ACCESS · EMAIL VERIFICATION REQUIRED · AUTHORIZED USERS ONLY</p>
      </section>
      <style jsx>{`:global(*){box-sizing:border-box}:global(body){margin:0;background:#fff}.admin-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f5f5f3;color:#111;font-family:Arial,Helvetica,sans-serif;position:relative;overflow:hidden}.admin-shell:before,.admin-shell:after{content:'';position:absolute;border:1px solid #dededb;border-radius:50%;width:65vw;height:65vw;pointer-events:none}.admin-shell:before{transform:translate(-42%,38%)}.admin-shell:after{transform:translate(42%,-38%)}.admin-card{position:relative;z-index:2;width:min(520px,100%);border:1px solid #dededb;background:rgba(255,255,255,.98);padding:clamp(28px,6vw,52px);box-shadow:0 28px 80px rgba(0,0,0,.1)}.brand{display:flex;align-items:center;gap:10px;color:#111;text-decoration:none;font-weight:800;letter-spacing:.05em;font-size:15px}.mark{width:13px;height:13px;background:#e1261c;display:inline-block}.eyebrow{margin:48px 0 12px;color:#777;font:10px monospace;letter-spacing:.1em}h1{font-size:clamp(60px,13vw,90px);line-height:.9;margin:0;letter-spacing:-.05em}.intro{color:#555;line-height:1.65;font-size:14px;margin:20px 0 32px}form{display:grid;gap:10px}label{margin-top:8px;color:#666;font:10px monospace;text-transform:uppercase}input{width:100%;border:1px solid #d7d7d4;background:#fff;color:#111;padding:14px;font:inherit;outline:none}input:focus{border-color:#111;box-shadow:inset 3px 0 0 #e1261c}button{margin-top:12px;padding:14px 18px;border:1px solid #111;background:#111;color:#fff;font-weight:900;letter-spacing:.04em;cursor:pointer}button:hover:not(:disabled){background:#e1261c;border-color:#e1261c}button:disabled{opacity:.5;cursor:wait}.error{color:#b31d16;background:#fff7f6;border:1px solid #efc2be;padding:10px;font-size:13px;line-height:1.5}.customer{display:block;margin-top:24px;text-align:center;color:#666;font-size:13px}.customer:hover{color:#e1261c}.security{margin:30px 0 0;color:#aaa;font:9px monospace;text-align:center;line-height:1.5}`}</style>
    </main>
  );
}
