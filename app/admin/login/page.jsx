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
    event.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Email atau password admin tidak valid.');
      setLoading(false);
      return;
    }

    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      setError('Email admin belum diverifikasi. Verifikasi email terlebih dahulu.');
      setLoading(false);
      return;
    }

    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (adminError || !adminUser) {
      await supabase.auth.signOut();
      setError('Akun ini bukan akun admin. Gunakan login pelanggan untuk akun biasa.');
      setLoading(false);
      return;
    }

    window.location.replace('/admin/pengiriman');
  }

  return (
    <main className="shell">
      <section className="card">
        <div className="brand"><span className="mark" />OXYGEN GEAR</div>
        <p className="eyebrow">RESTRICTED ACCESS / ADMIN</p>
        <h1>ADMIN.</h1>
        <p className="intro">Halaman khusus administrator. Akun harus terdaftar di daftar admin OCA dan email harus sudah diverifikasi.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email admin</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" autoComplete="username" required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>{loading ? 'MEMERIKSA...' : 'MASUK ADMIN'}</button>
        </form>

        <a className="customer" href="/login">Login pelanggan</a>
        <p className="security">OCA ADMIN ACCESS · EMAIL VERIFICATION REQUIRED · AUTHORIZED USERS ONLY</p>
      </section>

      <style jsx>{`
        :global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif}.card{width:min(500px,100%);border:1px solid #302e29;background:#11110f;padding:clamp(28px,6vw,52px);box-shadow:0 30px 90px rgba(0,0,0,.5)}.brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.05em;font-size:15px}.mark{width:13px;height:13px;background:#e1261c;display:inline-block}.eyebrow{margin:48px 0 12px;color:#8b887f;font:10px monospace;letter-spacing:.08em}h1{font-size:clamp(60px,13vw,90px);line-height:.9;margin:0;letter-spacing:-.05em}.intro{color:#c9c6bf;line-height:1.6;font-size:14px;margin:20px 0 32px}form{display:grid;gap:10px}label{margin-top:8px;color:#8b887f;font:10px monospace;text-transform:uppercase}input{width:100%;border:1px solid #39362f;background:#0b0b0a;color:#f7f6f3;padding:14px;font:inherit;outline:none}input:focus{border-color:#e1261c}button{margin-top:12px;padding:14px 18px;border:1px solid #f7f6f3;background:#f7f6f3;color:#0b0b0a;font-weight:900;letter-spacing:.04em;cursor:pointer}button:hover:not(:disabled){background:#e1261c;border-color:#e1261c;color:#fff}button:disabled{opacity:.5;cursor:wait}.error{color:#ff716a;font-size:13px;line-height:1.5}.customer{display:block;margin-top:24px;text-align:center;color:#aaa69d;font-size:13px}.customer:hover{color:#f7f6f3}.security{margin:32px 0 0;color:#55534e;font:9px monospace;text-align:center;line-height:1.5}
      `}</style>
    </main>
  );
}
