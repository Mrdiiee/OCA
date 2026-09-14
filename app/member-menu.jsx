"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase-browser";

export default function MemberMenu() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    let active = true;
    let cleanup = () => {};

    const install = () => {
      if (!active) return;
      const nav = document.querySelector(".nav-links");
      if (nav && !nav.querySelector('a[href="/member"]')) {
        const link = document.createElement("a");
        link.className = "nav-link";
        link.href = "/member";
        link.textContent = "MEMBER";
        const tentang = nav.querySelector('a[href="/tentang"]');
        nav.insertBefore(link, tentang || null);
      }

      const actions = document.querySelector(".nav-actions");
      if (!actions || actions.querySelector(".og-menu-wrap")) return;

      const wrap = document.createElement("div");
      wrap.className = "og-menu-wrap";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "og-menu-button";
      button.setAttribute("aria-label", "Buka menu");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", "og-main-menu");
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';

      const menu = document.createElement("div");
      menu.className = "og-main-menu";
      menu.id = "og-main-menu";
      menu.setAttribute("aria-hidden", "true");
      menu.innerHTML = `
        <nav class="og-menu-list" aria-label="Menu utama">
          <a href="${user ? "/informasi-user" : "/login"}" class="og-menu-account">${user ? "INFORMASI AKUN" : "DAFTAR / LOGIN"}</a>
          <a href="/oxygen-index" class="og-menu-feature">OXYGEN INDEX</a>
          <div class="og-menu-grid" aria-label="Navigasi utama">
            <a href="/produk">PRODUK</a>
            <a href="/event">EVENT</a>
            <a href="/member">MEMBER</a>
            <a href="/tentang">TENTANG</a>
          </div>
          <a href="/pesanan-saya">PESANAN SAYA <span>· STATUS PENGIRIMAN</span></a>
          <a href="/kontak">KONTAK</a>
        </nav>
      `;

      wrap.append(button, menu);
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
        .og-menu-button{width:40px;height:40px;padding:0;border:0;background:transparent;color:#111;cursor:pointer;display:grid;place-items:center}
        .og-menu-button svg{width:21px;height:21px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}
        .og-menu-button:hover{color:#e1261c}.og-menu-button:focus-visible{outline:2px solid #e1261c;outline-offset:3px}
        .og-main-menu{position:absolute;top:50px;right:0;width:370px;max-width:calc(100vw - 32px);max-height:calc(100vh - 80px);overflow:auto;padding:10px;background:rgba(255,255,255,.985);border:1px solid #dededb;border-top:3px solid #111;border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.18);box-sizing:border-box;display:none;z-index:500;color:#111}
        .og-main-menu.is-open{display:block}
        .og-menu-list{display:grid;grid-template-columns:1fr;gap:8px}
        .og-menu-list a{display:flex;align-items:center;min-width:0;min-height:48px;padding:13px 14px;border-radius:12px;box-sizing:border-box;color:#111;text-decoration:none;text-align:left;font:800 10px/1.3 Arial,sans-serif;letter-spacing:.09em;overflow-wrap:anywhere}
        .og-menu-list a:hover{background:#f5f5f2;color:#e1261c}
        .og-menu-list .og-menu-account{background:#111;color:#fff;min-height:40px;padding:11px 14px;border-radius:11px}
        .og-menu-list .og-menu-account:hover{background:#e1261c;color:#fff}
        .og-menu-list .og-menu-feature{background:transparent;min-height:42px;padding:11px 14px;border:0}
        .og-menu-list .og-menu-feature:hover{background:#f5f5f2;color:#e1261c}
        .og-menu-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #ececea;border-radius:12px;overflow:hidden;background:#fafaf8}
        .og-menu-grid a{min-height:50px;border-radius:0;padding:14px 12px}
        .og-menu-grid a:nth-child(odd){border-right:1px solid #ececea}
        .og-menu-grid a:nth-child(-n+2){border-bottom:1px solid #ececea}
        .og-menu-list span{font-weight:700;letter-spacing:.06em}
        .og-main-menu a::before,.og-main-menu a::after,.og-main-menu .arrow{content:none!important;display:none!important}
        @media(max-width:980px){
          .shell .nav-main{min-width:0!important;width:100%!important;box-sizing:border-box!important;padding-left:10px!important;padding-right:10px!important;gap:5px!important;overflow:hidden!important}
          .shell .nav .brand{width:auto!important;max-width:132px!important;flex:1 1 auto!important;min-width:0!important}
          .shell .nav-actions{flex:0 0 auto!important;min-width:0!important;gap:1px!important}
          .shell .nav-actions>.icon-btn{width:32px!important;min-width:32px!important;flex:0 0 32px!important;padding:0!important}
          .shell .og-menu-button{width:34px!important;height:40px!important}
          .shell .og-menu-button svg{width:20px!important;height:20px!important}
          .shell .og-main-menu{position:fixed;top:76px;left:8px;right:8px;width:auto;max-width:none;max-height:calc(100dvh - 88px);overflow-x:hidden;overflow-y:auto}
        }
        @media(max-width:420px){
          .shell .nav-main{padding-left:8px!important;padding-right:8px!important;gap:3px!important}
          .shell .nav .brand{max-width:112px!important}
          .shell .nav-actions>.icon-btn{width:30px!important;min-width:30px!important;flex-basis:30px!important}
          .shell .og-menu-button{width:32px!important}
          .shell .og-menu-grid{grid-template-columns:1fr}
          .shell .og-menu-grid a{border-right:0!important;border-bottom:1px solid #ececea!important}
          .shell .og-menu-grid a:last-child{border-bottom:0!important}
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
  }, [user]);

  return null;
}
