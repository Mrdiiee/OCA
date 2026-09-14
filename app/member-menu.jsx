"use client";

import { useEffect } from "react";

export default function MemberMenu() {
  useEffect(() => {
    let active = true;

    const ensureMemberNav = () => {
      if (!active) return;
      const nav = document.querySelector(".nav-links");
      if (!nav || nav.querySelector('a[href="/member"]')) return;
      const link = document.createElement("a");
      link.className = "nav-link";
      link.href = "/member";
      link.textContent = "MEMBER";
      const tentang = nav.querySelector('a[href="/tentang"]');
      nav.insertBefore(link, tentang || null);
    };

    ensureMemberNav();
    const observer = new MutationObserver(ensureMemberNav);
    observer.observe(document.body, { childList: true, subtree: true });
    const retry = window.setInterval(ensureMemberNav, 300);

    return () => {
      active = false;
      observer.disconnect();
      window.clearInterval(retry);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* OXYGEN GEAR — PROFESSIONAL UI POLISH */
        :root{--og-black:#101010;--og-red:#e1261c;--og-gray:#6b6b6b;--og-line:#e7e7e4;--og-soft:#f6f6f3;--og-radius:18px}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden!important;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        a,button{ -webkit-tap-highlight-color:transparent }

        /* Header: clean, premium, stable */
        .shell .nav{height:76px!important;position:sticky!important;top:0!important;z-index:9990!important}
        .shell .nav-main{height:76px!important;display:grid!important;grid-template-columns:minmax(180px,1fr) auto minmax(180px,1fr)!important;align-items:center!important;gap:24px!important}
        .shell .nav .brand{height:48px!important;width:190px!important;flex-basis:190px!important;max-width:190px!important}
        .shell .nav .brand-logo-image{height:42px!important;max-width:190px!important}
        .shell .nav-links{display:flex!important;align-items:center!important;justify-content:center!important;gap:30px!important;height:76px!important;margin:0!important}
        .shell .nav-link,.shell .event-nav-trigger{font-size:10px!important;font-weight:800!important;letter-spacing:.075em!important;line-height:1!important;text-transform:uppercase!important;white-space:nowrap!important}
        .shell .nav-link{height:76px!important;padding:0!important}
        .shell .nav-link::after{display:none!important}
        .shell .nav-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:4px!important;height:76px!important}
        .shell .icon-btn{width:38px!important;height:38px!important;min-width:38px!important;border-radius:50%!important;display:grid!important;place-items:center!important;transition:background .18s ease,color .18s ease,transform .18s ease!important}
        .shell .icon-btn:hover{background:#f3f3f0!important;transform:translateY(-1px)}
        .shell .og-menu-trigger{width:42px!important;height:42px!important;margin-left:3px!important;border-radius:10px!important}
        .shell .og-menu-trigger svg{width:21px!important;height:21px!important}

        /* Desktop navigation dropdowns */
        .shell .event-nav-menu{border-radius:14px!important;overflow:hidden!important;padding:6px!important;box-shadow:0 22px 60px rgba(0,0,0,.14)!important}
        .shell .event-nav-item{border-radius:10px!important;padding:15px 14px!important}
        .shell .more-menu{border-radius:18px!important;padding:8px!important;overflow:hidden!important;box-shadow:0 24px 70px rgba(0,0,0,.16)!important}
        .shell .more-item{border-radius:10px!important;padding:13px 12px!important;font-weight:700!important;font-size:11px!important}

        /* Hero: stronger hierarchy without changing content */
        .shell .hero{min-height:min(690px,calc(100vh - 76px))!important;border:0!important;position:relative!important;overflow:hidden!important}
        .shell .hero-content{max-width:720px!important;padding-top:clamp(72px,9vw,130px)!important;padding-bottom:clamp(72px,9vw,130px)!important}
        .shell .hero h1{font-size:clamp(56px,7.2vw,108px)!important;line-height:.88!important;letter-spacing:-.065em!important;max-width:850px!important;margin:0!important}
        .shell .hero p{max-width:600px!important;font-size:15px!important;line-height:1.75!important;margin-top:28px!important}
        .shell .hero .eyebrow{font-size:9px!important;letter-spacing:.16em!important;font-weight:800!important;margin-bottom:20px!important}
        .shell .hero .btn{min-height:48px!important;padding:0 22px!important;font-size:10px!important;letter-spacing:.09em!important;border-radius:2px!important}

        /* Sections: consistent rhythm and editorial hierarchy */
        .shell .section{padding-top:clamp(64px,8vw,110px)!important;padding-bottom:clamp(64px,8vw,110px)!important}
        .shell .section-title{font-size:clamp(34px,4.2vw,64px)!important;line-height:.98!important;letter-spacing:-.05em!important}
        .shell .section-copy{font-size:14px!important;line-height:1.75!important;max-width:620px!important}
        .shell .section-kicker{font-size:9px!important;letter-spacing:.16em!important;font-weight:800!important}
        .shell .view-all{font-size:10px!important;font-weight:800!important;letter-spacing:.09em!important}
        .shell .category{border-radius:var(--og-radius)!important;overflow:hidden!important;transition:transform .22s ease,box-shadow .22s ease!important}
        .shell .category:hover{transform:translateY(-4px)!important;box-shadow:0 18px 50px rgba(0,0,0,.12)!important}
        .shell .product-card{border-radius:var(--og-radius)!important;overflow:hidden!important;transition:transform .22s ease,box-shadow .22s ease!important}
        .shell .product-card:hover{transform:translateY(-4px)!important;box-shadow:0 18px 50px rgba(0,0,0,.1)!important}
        .shell .quick-add{border-radius:10px!important}

        /* Ticker / trust strip */
        .shell .ticker{min-height:48px!important;display:flex!important;align-items:center!important}
        .shell .ticker span{font-size:9px!important;letter-spacing:.1em!important;font-weight:700!important}

        /* Menu styling — one hamburger only, professional panel */
        .shell .more-wrap{position:relative!important;display:flex!important;align-items:center!important;height:100%!important}
        .shell .more-menu{width:360px!important;max-width:calc(100vw - 28px)!important;background:rgba(255,255,255,.985)!important;border:1px solid #dededb!important;border-top:3px solid #111!important;color:#111!important}
        .shell .more-menu .more-item{color:#111!important;background:transparent!important}
        .shell .more-menu .more-item:hover{background:#f5f5f2!important;color:var(--og-red)!important}
        .shell .more-menu .more-section{border-radius:12px!important;background:#f7f7f5!important;margin-top:4px!important;padding:14px!important}

        /* Generic page containers */
        .page{max-width:1440px!important;margin:0 auto!important;padding-left:clamp(18px,3vw,48px)!important;padding-right:clamp(18px,3vw,48px)!important;box-sizing:border-box!important}
        .page .title{font-size:clamp(42px,6vw,82px)!important;line-height:.92!important;letter-spacing:-.055em!important}
        .page .eyebrow{font-size:9px!important;letter-spacing:.15em!important;font-weight:800!important}
        .page .card{border-radius:16px!important;overflow:hidden!important}
        .page .btn,.page .cartButton,.page .checkout{border-radius:8px!important;font-weight:800!important}
        .page .drawer,.page .modal{border-radius:20px!important}

        /* Mobile */
        @media(max-width:980px){
          .shell .nav{height:68px!important}
          .shell .nav-main{height:68px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:0 14px!important;box-sizing:border-box!important;width:100%!important;min-width:0!important}
          .shell .nav .brand{height:44px!important;width:auto!important;max-width:145px!important;flex:0 1 auto!important;min-width:0!important;margin-right:auto!important}
          .shell .nav .brand-logo-image{height:38px!important;max-width:145px!important}
          .shell .nav-links{display:none!important}
          .shell .nav-actions{height:68px!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:2px!important;flex:0 0 auto!important;width:auto!important;min-width:max-content!important;margin-left:auto!important}
          .shell .icon-btn{width:34px!important;height:34px!important;min-width:34px!important}
          .shell .og-menu-trigger{width:38px!important;height:38px!important;margin-left:2px!important}
          .shell .og-main-menu,.shell .more-menu{max-width:calc(100vw - 20px)!important}
          .shell .hero{min-height:calc(100svh - 68px)!important}
          .shell .hero-content{padding-top:72px!important;padding-bottom:72px!important}
          .shell .hero h1{font-size:clamp(48px,13vw,78px)!important;line-height:.9!important}
          .shell .hero p{font-size:14px!important;line-height:1.65!important;margin-top:22px!important}
          .shell .section{padding-top:64px!important;padding-bottom:64px!important}
          .shell .section-title{font-size:clamp(34px,10vw,54px)!important}
        }
        @media(max-width:600px){
          .shell .nav-main{padding:0 10px!important}
          .shell .nav .brand{max-width:125px!important}
          .shell .nav .brand-logo-image{max-width:125px!important;height:34px!important}
          .shell .icon-btn{width:31px!important;height:31px!important;min-width:31px!important}
          .shell .og-menu-trigger{width:35px!important;height:35px!important}
          .shell .og-menu-trigger svg{width:19px!important;height:19px!important}
          .shell .hero{min-height:calc(100svh - 68px)!important}
          .shell .hero-content{padding-top:54px!important;padding-bottom:54px!important}
          .shell .hero h1{font-size:clamp(43px,14.5vw,68px)!important}
          .shell .hero .btn{width:100%!important;justify-content:center!important}
          .page{padding-left:16px!important;padding-right:16px!important}
          .page .title{font-size:clamp(40px,12vw,62px)!important}
        }
        @media(max-width:380px){
          .shell .nav .brand{max-width:108px!important}
          .shell .nav .brand-logo-image{max-width:108px!important}
          .shell .icon-btn{width:29px!important;height:29px!important;min-width:29px!important}
          .shell .og-menu-trigger{width:33px!important}
        }

        /* SSR NAV FALLBACK: the correct navigation exists in the initial HTML, so it never depends on refresh/hydration timing. */
        .og-ssr-nav-fallback{position:fixed;inset:0 0 auto 0;height:76px;background:rgba(255,255,255,.98);border-bottom:1px solid #e5e5e5;z-index:10050;display:flex;align-items:center;justify-content:center;pointer-events:none;box-sizing:border-box;backdrop-filter:blur(16px)}
        .og-ssr-nav-fallback .og-ssr-links{display:flex;align-items:center;justify-content:center;gap:30px;height:100%;pointer-events:auto}
        .og-ssr-nav-fallback .og-ssr-link{display:flex;align-items:center;height:100%;padding:0 2px;color:#111;text-decoration:none;font:800 10px/1 Arial,sans-serif;letter-spacing:.075em;text-transform:uppercase;white-space:nowrap}
        .og-ssr-nav-fallback .og-ssr-link:hover{color:var(--og-red)}
        .og-ssr-nav-fallback .og-ssr-actions{position:absolute;right:20px;top:0;height:100%;display:flex;align-items:center;gap:4px;padding-left:12px;background:rgba(255,255,255,.98);pointer-events:auto}
        .og-ssr-nav-fallback .og-ssr-action{width:38px;height:38px;display:grid;place-items:center;color:#111;text-decoration:none;border:0;background:transparent;border-radius:50%;cursor:pointer}
        .og-ssr-nav-fallback .og-ssr-action:hover{color:var(--og-red);background:#f3f3f0}
        .og-ssr-nav-fallback .og-ssr-menu{position:relative;height:100%;display:flex;align-items:center}
        .og-ssr-nav-fallback .og-ssr-menu summary{list-style:none}
        .og-ssr-nav-fallback .og-ssr-menu summary::-webkit-details-marker{display:none}
        .og-ssr-nav-fallback .og-ssr-panel{position:absolute;right:0;top:58px;width:370px;max-width:calc(100vw - 28px);max-height:calc(100vh - 80px);overflow:auto;background:#fff;border:1px solid #dededb;border-top:3px solid #111;border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.16);padding:8px;box-sizing:border-box}
        .og-ssr-nav-fallback .og-ssr-panel a{display:flex;align-items:center;min-height:48px;padding:13px 12px;border-radius:10px;color:#111;text-decoration:none;font:700 11px/1.25 Arial,sans-serif;letter-spacing:.04em;box-sizing:border-box}
        .og-ssr-nav-fallback .og-ssr-panel a:hover{background:#f5f5f2;color:var(--og-red)}
        .og-ssr-nav-fallback .og-ssr-panel .index{background:#111;color:#fff}
        .og-ssr-nav-fallback .og-ssr-panel .index:hover{background:var(--og-red);color:#fff}
        .og-ssr-nav-fallback .grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #ececea;border-radius:12px;background:#fafaf8;overflow:hidden;margin:3px 0}
        .og-ssr-nav-fallback .grid a{border-radius:0}
        .og-ssr-nav-fallback .grid a:nth-child(odd){border-right:1px solid #ececea}
        .og-ssr-nav-fallback .grid a:nth-child(-n+2){border-bottom:1px solid #ececea}
        .og-ssr-nav-fallback .order{border:1px solid #ececea;background:#fafaf8}
        .og-ssr-nav-fallback .order span{margin-left:4px;font-weight:700;letter-spacing:.03em}
        .og-ssr-nav-fallback .mobile-hide{display:block}
        @media(max-width:980px){
          .og-ssr-nav-fallback{height:68px}
          .og-ssr-nav-fallback .og-ssr-links{display:none}
          .og-ssr-nav-fallback .og-ssr-actions{right:8px;height:68px;padding-left:8px}
          .og-ssr-nav-fallback .og-ssr-panel{position:fixed;top:76px;left:8px;right:8px;width:auto;max-width:none;max-height:calc(100dvh - 84px)}
        }
        @media(max-width:600px){.og-ssr-nav-fallback .og-ssr-actions{right:5px}.og-ssr-nav-fallback .og-ssr-action{width:31px;height:31px}.og-ssr-nav-fallback .og-ssr-panel{top:72px}}
        @media(max-width:420px){.og-ssr-nav-fallback .grid{grid-template-columns:1fr}.og-ssr-nav-fallback .grid a{border-right:0!important;border-bottom:1px solid #ececea!important}.og-ssr-nav-fallback .grid a:last-child{border-bottom:0!important}}
      `,
      }} />

      <nav className="og-ssr-nav-fallback" aria-label="Navigasi Oxygen Gear">
        <div className="og-ssr-links">
          <a className="og-ssr-link" href="/produk">PRODUK</a>
          <a className="og-ssr-link" href="/event">EVENT</a>
          <a className="og-ssr-link" href="/member">MEMBER</a>
          <a className="og-ssr-link" href="/tentang">TENTANG</a>
        </div>
        <div className="og-ssr-actions">
          <a className="og-ssr-action" href="/informasi-user" aria-label="Akun"><span aria-hidden="true" style={{fontSize:20}}>♙</span></a>
          <details className="og-ssr-menu">
            <summary className="og-ssr-action" aria-label="Buka menu navigasi"><span aria-hidden="true" style={{fontSize:21,lineHeight:1}}>☰</span></summary>
            <div className="og-ssr-panel">
              <a href="/informasi-user">Informasi Akun</a>
              <a className="index" href="/oxygen-index">OXYGEN INDEX</a>
              <div className="grid">
                <a href="/produk">PRODUK</a>
                <a href="/event">EVENT</a>
                <a href="/member">MEMBER</a>
                <a href="/tentang">TENTANG</a>
              </div>
              <a className="order" href="/pesanan-saya">PESANAN SAYA <span>· STATUS PENGIRIMAN</span></a>
              <a href="/kontak">KONTAK</a>
            </div>
          </details>
        </div>
      </nav>
    </>
  );
}
