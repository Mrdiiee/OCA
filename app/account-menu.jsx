'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../lib/supabase-browser';

export default function AccountMenu() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!user) return null;

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.replace('/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Keluar dari akun"
      className="account-logout"
    >
      {loading ? 'KELUAR...' : 'KELUAR'}
      <style jsx>{`
        .account-logout {
          position: fixed;
          left: 18px;
          bottom: 18px;
          z-index: 9998;
          border: 1px solid #2e2c28;
          background: rgba(11, 11, 10, .94);
          color: #f7f6f3;
          padding: 11px 14px;
          font: 700 10px/1 monospace;
          letter-spacing: .08em;
          cursor: pointer;
          backdrop-filter: blur(8px);
        }
        .account-logout:hover:not(:disabled) {
          border-color: #e1261c;
          color: #e1261c;
        }
        .account-logout:disabled {
          opacity: .55;
          cursor: wait;
        }
      `}</style>
    </button>
  );
}
