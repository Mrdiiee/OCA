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
              <span className="product-hover-label">KATEGORI</span>
              <a href="/produk?category=Bags">Bags</a>
              <a href="/produk?category=Pakaian">Pakaian</a>
              <a href="/produk?category=Outdoor">Outdoor</a>
              <a href="/produk?category=Aksesori">Aksesori</a>
            </div>
          </div>
        </div>
      </div>

      {user ? (
        <button type="button" onClick={handleLogout} disabled={loading} aria-label="Keluar dari akun" className="account-logout">
          {loading ? 'KELUAR...' : 'KELUAR'}
        </button>
      ) : null}

      <style jsx global>{`
        .product-hover-menu{position:fixed;top:76px;left:0;right:0;z-index:9997;background:#fff;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;box-shadow:0 18px 45px rgba(0,0,0,.12);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-8px);transition:opacity .16s ease,transform .16s ease,visibility .16s ease}
        @media(hover:hover) and (min-width:981px){body:has(.shell .nav-link:nth-child(1):hover) .product-hover-menu,body:has(.product-hover-menu:hover) .product-hover-menu,body:has(.shell .nav-link:nth-child(1):focus-visible) .product-hover-menu{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}.shell .nav-link::after{display:none!important}}
        .product-hover-inner{width:min(1180px,calc(100% - 48px));margin:0 auto;padding:28px 0 32px}.product-hover-heading{display:grid;grid-template-columns:180px 1fr auto;align-items:end;gap:24px;padding-bottom:20px;border-bottom:1px solid #e5e5e5}.product-hover-heading span,.product-hover-label{color:#e1261c;font:700 10px/1.4 monospace;letter-spacing:.1em}.product-hover-heading strong{color:#111;font-size:30px;letter-spacing:-.04em}.product-hover-heading a{color:#111;font-size:11px;font-weight:800;text-decoration:none}.product-hover-heading a:hover{color:#e1261c}.product-hover-columns{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:24px;padding-top:24px}.product-hover-group{display:grid;gap:10px;align-content:start}.product-hover-group a{color:#222;font-size:13px;font-weight:600;text-decoration:none;width:max-content}.product-hover-group a:hover{color:#e1261c;text-decoration:underline;text-underline-offset:4px}

        /* Product listing filter polish: uses the existing functional filters. */
        .page .tools{align-items:stretch;gap:24px;margin:34px 0 0;padding:18px;border:1px solid #2e2c28;background:#11100f;box-sizing:border-box}
        .page .filters{display:flex;gap:8px;flex:1;align-items:center;flex-wrap:wrap;overflow:visible;padding:0}
        .page .filters::before{content:'FILTER KATEGORI';display:block;width:100%;color:#777;font:700 10px/1 monospace;letter-spacing:.14em;margin-bottom:3px}
        .page .filter{border:1px solid #37342f;background:#151412;color:#aaa;min-height:40px;padding:0 15px;border-radius:0;font-size:10px;font-weight:700;letter-spacing:.1em;transition:background .15s ease,border-color .15s ease,color .15s ease,transform .15s ease}
        .page .filter:hover{border-color:#777;color:#fff;transform:translateY(-1px)}
        .page .filter.active{background:#f7f6f3;color:#111;border-color:#f7f6f3}
        .page .cartButton{align-self:end;min-width:170px;min-height:40px}
        .page .subfilters{display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin:0 0 42px;padding:14px 18px 17px;border:1px solid #2e2c28;border-top:0;background:#0f0e0d}
        .page .subfilters::before{content:'SUBKATEGORI';color:#666;font:700 9px/1 monospace;letter-spacing:.14em;margin-right:4px}
        .page .subfilter{color:#777;padding:4px 0;margin:0;border:0;background:transparent;font-size:11px;transition:color .15s ease}
        .page .subfilter:hover{color:#fff}.page .subfilter.active{color:#fff;text-decoration:underline;text-underline-offset:6px}
        .page .categoryHead{padding-bottom:12px;border-bottom:1px solid #24221f}.page .categoryTitle{letter-spacing:-.03em}.page .categoryMeta{font-family:monospace;letter-spacing:.08em}
        .page .empty-filter{margin-top:8px;background:#11100f}
        @media(max-width:700px){.page .tools{padding:14px;gap:14px}.page .filters::before{margin-bottom:5px}.page .filter{min-height:38px;padding:0 12px}.page .cartButton{width:100%;min-width:0}.page .subfilters{gap:14px;padding:14px}.page .subfilters::before{width:100%;margin-bottom:0}.page .categoryHead{align-items:center}}

        .account-logout{position:fixed;left:18px;bottom:18px;z-index:9998;border:1px solid #2e2c28;background:rgba(11,11,10,.94);color:#f7f6f3;padding:11px 14px;font:700 10px/1 monospace;letter-spacing:.08em;cursor:pointer;backdrop-filter:blur(8px)}.account-logout:hover:not(:disabled){border-color:#e1261c;color:#e1261c}.account-logout:disabled{opacity:.55;cursor:wait}
        @media(max-width:980px){.product-hover-menu{display:none}}
      `}</style>
    </>
  );
}
