"use client";

import { useEffect } from "react";

export default function MemberMenu() {
  useEffect(() => {
    let active = true;
    let cleanup = () => {};

    const install = () => {
      if (!active) return;
      const actions = document.querySelector(".nav-actions");
      if (!actions || actions.querySelector(".og-menu-wrap")) return;

      const wrap = document.createElement("div");
      wrap.className = "og-menu-wrap";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "og-menu-button";
      button.textContent = "MENU";
      button.setAttribute("aria-label", "Buka menu navigasi");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", "og-main-menu");

      const menu = document.createElement("div");
      menu.className = "og-main-menu";
      menu.id = "og-main-menu";
      menu.setAttribute("aria-hidden", "true");
      menu.innerHTML = `
        <nav class="og-mobile-primary" aria-label="Navigasi utama">
          <a href="/produk">PRODUK</a>
          <a href="/event">EVENT</a>
          <a href="/member">MEMBER</a>
          <a href="/tentang">TENTANG</a>
        </nav>
        <div class="og-menu-links">
          <a href="/oxygen-index" class="og-menu-feature">OXYGEN INDEX</a>
          <a href="/informasi-user">INFORMASI AKUN</a>
          <a href="/pesanan-saya">PESANAN SAYA</a>
          <a href="/status-pengiriman">STATUS PENGIRIMAN</a>
          <a href="/kontak">KONTAK</a>
        </div>
      `;

      wrap.appendChild(button);
      wrap.appendChild(menu);
      actions.appendChild(wrap);

      const setOpen = (open) => {
        menu.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
        menu.setAttribute("aria-hidden", String(!open));
        if (window.innerWidth <= 980) document.body.style.overflow = open ? "hidden" : "";
      };
      const onButton = (event) => {
        event.preventDefault();
        setOpen(!menu.classList.contains("is-open"));
      };
      const onDoc = (event) => {
        if (!wrap.contains(event.target)) setOpen(false);
      };
      const onKey = (event) => {
        if (event.key === "Escape") {
          setOpen(false);
          button.focus();
        }
      };
      const onResize = () => {
        if (window.innerWidth > 980) document.body.style.overflow = "";
      };
      button.addEventListener("click", onButton);
      document.addEventListener("click", onDoc);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);

      const style = document.createElement("style");
      style.dataset.oxygenMenuFix = "true";
      style.textContent = `
        .og-menu-wrap{position:relative;display:flex;align-items:center;height:100%;flex:0 0 auto}
        .og-menu-button{border:0;background:transparent;color:#111;cursor:pointer;height:40px;min-width:42px;padding:0 4px;display:flex;align-items:center;justify-content:center;font:800 10px/1 Arial,sans-serif;letter-spacing:.08em;white-space:nowrap}
        .og-menu-button:hover{color:#e1261c}.og-menu-button:focus-visible{outline:2px solid #e1261c;outline-offset:3px}
        .og-main-menu{position:absolute;top:50px;right:0;width:360px;max-width:calc(100vw - 32px);max-height:calc(100vh - 80px);overflow:auto;padding:10px;background:rgba(255,255,255,.985);border:1px solid #dededb;border-top:3px solid #111;border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.18);box-sizing:border-box;display:none;z-index:500;color:#111}
        .og-main-menu.is-open{display:block}
        .og-mobile-primary{display:grid;grid-template-columns:1fr 1fr;margin:0 0 10px;padding:4px;border:1px solid #ececea;border-radius:12px;background:#fafaf8}
        .og-mobile-primary a,.og-menu-links a{display:flex;align-items:center;min-width:0;min-height:48px;padding:12px 10px;box-sizing:border-box;color:#111;text-decoration:none;text-align:left;font:800 10px/1.2 Arial,sans-serif;letter-spacing:.09em;overflow-wrap:anywhere;transform:none;margin:0}
        .og-mobile-primary a:nth-child(odd){border-right:1px solid #ececea}.og-mobile-primary a:nth-child(-n+2){border-bottom:1px solid #ececea}
        .og-mobile-primary a:hover,.og-menu-links a:hover{background:#f5f5f2;color:#e1261c}
        .og-menu-links{display:grid;grid-template-columns:1fr;gap:3px}
        .og-menu-links a{border-radius:12px;min-height:46px;padding:14px}
        .og-menu-links .og-menu-feature{background:#111;color:#fff;min-height:50px}
        .og-menu-links .og-menu-feature:hover{background:#e1261c;color:#fff}
        .og-main-menu a::before,.og-main-menu a::after,.og-main-menu svg,.og-main-menu .arrow{content:none!important;display:none!important}
        @media(max-width:980px){
          .shell .nav-main{min-width:0!important;width:100%!important;box-sizing:border-box!important;padding-left:10px!important;padding-right:10px!important;gap:5px!important;overflow:hidden!important}
          .shell .nav .brand{width:auto!important;max-width:132px!important;flex:1 1 auto!important;min-width:0!important}
          .shell .nav-actions{flex:0 0 auto!important;min-width:0!important;gap:1px!important}
          .shell .nav-actions>.icon-btn{width:32px!important;min-width:32px!important;flex:0 0 32px!important;padding:0!important}
          .shell .og-menu-button{min-width:34px!important;max-width:46px!important;padding:0 3px!important;font-size:9px!important}
          .shell .og-main-menu{position:fixed;top:76px;left:8px;right:8px;width:auto;max-width:none;max-height:calc(100dvh - 88px);overflow-x:hidden;overflow-y:auto}
          .shell .og-mobile-primary{grid-template-columns:1fr 1fr}
        }
        @media(max-width:420px){
          .shell .nav-main{padding-left:8px!important;padding-right:8px!important;gap:3px!important}
          .shell .nav .brand{max-width:112px!important}
          .shell .nav-actions>.icon-btn{width:30px!important;min-width:30px!important;flex-basis:30px!important}
          .shell .og-menu-button{min-width:32px!important;max-width:43px!important;font-size:8.5px!important}
          .shell .og-mobile-primary{grid-template-columns:1fr}
          .shell .og-mobile-primary a{border-right:0!important;border-bottom:1px solid #ececea!important}
          .shell .og-mobile-primary a:last-child{border-bottom:0!important}
        }
        @media(max-width:980px){.shell .nav-links{display:none!important}}
      `;
      document.head.appendChild(style);

      cleanup = () => {
        document.body.style.overflow = "";
        button.removeEventListener("click", onButton);
        document.removeEventListener("click", onDoc);
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        style.remove();
        wrap.remove();
      };
    };

    install();
    const observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true });
    const retry = setInterval(install, 300);

    return () => {
      active = false;
      observer.disconnect();
      clearInterval(retry);
      cleanup();
    };
  }, []);

  return null;
}
