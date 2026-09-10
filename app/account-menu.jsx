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

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.replace('/login');
  };

  return (
    <>
      <div className="product-hover-menu" aria-label="Kategori produk">
        <div className="product-hover-inner">
          <div className="product-hover-heading">
            <span>01 / EQUIPMENT</span>
            <strong>PRODUK</strong>
            <a href="/produk">Lihat semua produk →</a>
          </div>
          <div className="product-hover-columns">
            <div className="product-hover-group">
              <span className="product-hover-label">BAGS &amp; CARRIER</span>
              <a href="/produk?category=Bags&amp;subcategory=Carrier">Carrier</a>
              <a href="/produk?category=Bags&amp;subcategory=Carrier">Keygen V1</a>
              <a href="/produk?category=Bags&amp;subcategory=Carrier">Keygen V2</a>
            </div>
            <div className="product-hover-group">
              <span className="product-hover-label">PAKAIAN</span>
              <a href="/produk?category=Pakaian&amp;subcategory=Vest">Running Vest</a>
              <a href="/produk?category=Pakaian&amp;subcategory=Vest">Semua pakaian</a>
            </div>
            <div className="product-hover-group">
              <span className="product-hover-label">OUTDOOR</span>
              <a href="/produk">Semua equipment</a>
              <a href="/produk">Produk terbaru</a>
              <a href="/produk">Best seller</a>
            </div>
          </div>
        </div>
      </div>

      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          aria-label="Keluar dari akun"
          className="account-logout"
        >
          {loading ? 'KELUAR...' : 'KELUAR'}
        </button>
      ) : null}

      <style jsx global>{`
        .product-hover-menu {
          position:fixed;
          top:76px;
          left:0;
          right:0;
          z-index:9997;
          background:#fff;
          border-top:1px solid #e5e5e5;
          border-bottom:1px solid #e5e5e5;
          box-shadow:0 18px 45px rgba(0,0,0,.12);
          opacity:0;
          visibility:hidden;
          pointer-events:none;
          transform:translateY(-8px);
          transition:opacity .16s ease,transform .16s ease,visibility .16s ease;
        }
        @media (hover:hover) and (min-width:981px) {
          body:has(.shell .nav-link:nth-child(1):hover) .product-hover-menu,
          body:has(.product-hover-menu:hover) .product-hover-menu,
          body:has(.shell .nav-link:nth-child(1):focus-visible) .product-hover-menu {
            opacity:1;
            visibility:visible;
            pointer-events:auto;
            transform:translateY(0);
          }
          .shell .nav-link::after {
            display:none!important;
          }
        }
        .product-hover-inner {
          width:min(1180px,calc(100% - 48px));
          margin:0 auto;
          padding:28px 0 32px;
        }
        .product-hover-heading {
          display:grid;
          grid-template-columns:180px 1fr auto;
          align-items:end;
          gap:24px;
          padding-bottom:20px;
          border-bottom:1px solid #e5e5e5;
        }
        .product-hover-heading span,.product-hover-label {
          color:#e1261c;
          font:700 10px/1.4 monospace;
          letter-spacing:.1em;
        }
        .product-hover-heading strong {
          color:#111;
          font-size:30px;
          letter-spacing:-.04em;
        }
        .product-hover-heading a {
          color:#111;
          font-size:11px;
          font-weight:800;
          text-decoration:none;
        }
        .product-hover-heading a:hover { color:#e1261c; }
        .product-hover-columns {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:24px;
          padding-top:24px;
        }
        .product-hover-group { display:grid; gap:10px; align-content:start; }
        .product-hover-group a {
          color:#222;
          font-size:13px;
          font-weight:600;
          text-decoration:none;
          width:max-content;
        }
        .product-hover-group a:hover {
          color:#e1261c;
          text-decoration:underline;
          text-underline-offset:4px;
        }
        .account-logout {
          position:fixed;
          left:18px;
          bottom:18px;
          z-index:9998;
          border:1px solid #2e2c28;
          background:rgba(11,11,10,.94);
          color:#f7f6f3;
          padding:11px 14px;
          font:700 10px/1 monospace;
          letter-spacing:.08em;
          cursor:pointer;
          backdrop-filter:blur(8px);
        }
        .account-logout:hover:not(:disabled) { border-color:#e1261c; color:#e1261c; }
        .account-logout:disabled { opacity:.55; cursor:wait; }
        @media(max-width:980px) { .product-hover-menu { display:none; } }
      `}</style>
    </>
  );
}
