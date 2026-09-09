'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase-browser';

export default function AdminMenu() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user || !active) return;

      const { data: admin } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (active) setIsAdmin(Boolean(admin));
    })();

    return () => { active = false; };
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="admin-menu">
      <button className="admin-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        ADMIN <span className={open ? 'chevron open' : 'chevron'}>⌄</span>
      </button>
      {open && (
        <div className="admin-dropdown">
          <div className="admin-caption">PANEL ADMIN</div>
          <a href="/admin/pengiriman" onClick={() => setOpen(false)}>Pengiriman</a>
          <a href="/status-pengiriman" onClick={() => setOpen(false)}>Lihat status pelanggan</a>
        </div>
      )}
      <style jsx>{`
        .admin-menu{position:fixed;right:22px;bottom:22px;z-index:1000;font-family:Arial,Helvetica,sans-serif}
        .admin-trigger{border:1px solid #e1261c;background:#11110f;color:#f7f6f3;padding:11px 14px;font-size:10px;font-weight:900;letter-spacing:.12em;cursor:pointer;box-shadow:0 12px 30px rgba(0,0,0,.35)}
        .admin-trigger:hover{background:#e1261c}
        .chevron{display:inline-block;margin-left:7px;transition:transform .15s}.chevron.open{transform:rotate(180deg)}
        .admin-dropdown{position:absolute;right:0;bottom:45px;width:245px;background:#11110f;border:1px solid #302e29;box-shadow:0 18px 50px rgba(0,0,0,.55);padding:7px}
        .admin-dropdown a{display:block;color:#d8d5cd;text-decoration:none;padding:12px 11px;font-size:12px}
        .admin-dropdown a:hover{background:#1b1a17;color:#fff}
        .admin-caption{padding:9px 11px 7px;color:#8b887f;font:9px monospace;letter-spacing:.1em;border-bottom:1px solid #25231f}
        @media(max-width:600px){.admin-menu{right:14px;bottom:14px}.admin-dropdown{width:220px}}
      `}</style>
    </div>
  );
}
