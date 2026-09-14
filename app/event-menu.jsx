"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const shouldHandleNavigation = (anchor, event) => {
  if (!anchor || event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || rawHref.startsWith("javascript:")) return false;
  let url;
  try { url = new URL(rawHref, window.location.href); } catch { return false; }
  return url.origin === window.location.origin;
};

export default function EventMenu() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!shouldHandleNavigation(anchor, event)) return;
      const url = new URL(anchor.getAttribute("href"), window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;
      event.preventDefault();
      router.push(`${url.pathname}${url.search}${url.hash}`);
    };

    const onPointerOver = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!anchor || anchor.dataset.ogPrefetched === "1") return;
      if (!shouldHandleNavigation(anchor, { button: 0, defaultPrevented: false, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false })) return;
      const url = new URL(anchor.getAttribute("href"), window.location.href);
      anchor.dataset.ogPrefetched = "1";
      router.prefetch(`${url.pathname}${url.search}`);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onPointerOver);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onPointerOver);
    };
  }, [router]);

  useEffect(() => {
    const navActions = document.querySelector(".nav-actions");
    if (!navActions || navActions.querySelector(".more-wrap")) return undefined;

    const wrap = document.createElement("div");
    wrap.className = "more-wrap";
    Object.assign(wrap.style, { position: "relative", height: "100%", display: "flex", alignItems: "center" });

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "icon-btn og-menu-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-label", "Buka menu navigasi");
    trigger.innerHTML = "<svg width=20 height=20 viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' aria-hidden='true'><path d='M4 7h16M4 12h16M4 17h16'/></svg>";

    const menu = document.createElement("div");
    menu.className = "more-menu";
    menu.setAttribute("role", "menu");
    menu.innerHTML = `
      <nav class="og-hamburger-list" aria-label="Menu utama">
        <a class="more-item account-entry" href="/informasi-user" role="menuitem">Informasi Akun</a>
        <a class="more-item og-index-item" href="/oxygen-index" role="menuitem">OXYGEN INDEX</a>
        <div class="og-primary-grid">
          <a class="more-item" href="/produk" role="menuitem">PRODUK</a>
          <a class="more-item" href="/event" role="menuitem">EVENT</a>
          <a class="more-item" href="/member" role="menuitem">MEMBER</a>
          <a class="more-item" href="/tentang" role="menuitem">TENTANG</a>
        </div>
        <a class="more-item og-order-item" href="/pesanan-saya" role="menuitem">PESANAN SAYA <span>· STATUS PENGIRIMAN</span></a>
        <a class="more-item" href="/kontak" role="menuitem">KONTAK</a>
      </nav>
    `;

    Object.assign(menu.style, {
      display: "none",
      position: "absolute",
      right: "0",
      top: "50px",
      width: "370px",
      maxWidth: "calc(100vw - 32px)",
      maxHeight: "calc(100vh - 80px)",
      overflow: "auto",
      background: "#fff",
      border: "1px solid #e5e5e5",
      borderTop: "3px solid #111",
      borderRadius: "18px",
      boxShadow: "0 20px 60px rgba(0,0,0,.14)",
      padding: "10px",
      zIndex: "400",
      boxSizing: "border-box",
    });

    const style = document.createElement("style");
    style.dataset.oxygenHamburgerMenu = "true";
    style.textContent = `
      .more-wrap{flex:0 0 auto!important}
      .og-menu-trigger{color:#111!important}
      .og-menu-trigger svg{display:block;width:20px;height:20px}
      .og-hamburger-list{display:grid;grid-template-columns:1fr;gap:3px}
      .og-hamburger-list .more-item{display:flex;align-items:center;min-width:0;min-height:48px;padding:13px 14px;border-radius:11px;box-sizing:border-box;color:#222!important;background:transparent;text-decoration:none;text-align:left;font:800 10px/1.25 Arial,sans-serif;letter-spacing:.09em;overflow-wrap:anywhere}
      .og-hamburger-list .more-item:hover{background:#f5f5f3!important;color:#e1261c!important}
      .og-hamburger-list .og-index-item{background:#111!important;color:#fff!important;min-height:52px}
      .og-hamburger-list .og-index-item:hover{background:#e1261c!important;color:#fff!important}
      .og-primary-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #ececea;border-radius:12px;background:#fafaf8;overflow:hidden}
      .og-primary-grid .more-item{border-radius:0!important}
      .og-primary-grid .more-item:nth-child(odd){border-right:1px solid #ececea}
      .og-primary-grid .more-item:nth-child(-n+2){border-bottom:1px solid #ececea}
      .og-order-item{border:1px solid #ececea!important;background:#fafaf8!important}
      .og-hamburger-list .og-order-item span{font-weight:700;letter-spacing:.05em;margin-left:4px}
      .og-hamburger-list a::before,.og-hamburger-list a::after,.og-hamburger-list svg,.og-hamburger-list .arrow{content:none!important;display:none!important}
      @media(max-width:980px){
        .shell .more-wrap{display:flex!important;flex:0 0 auto!important}
        .shell .og-menu-trigger{width:34px!important;min-width:34px!important;height:40px!important;padding:0!important}
        .shell .og-menu-trigger svg{width:20px!important;height:20px!important}
        .shell .more-menu{position:fixed!important;top:76px!important;left:8px!important;right:8px!important;width:auto!important;max-width:none!important;max-height:calc(100dvh - 88px)!important;overflow-x:hidden!important;overflow-y:auto!important}
        .shell .nav-actions{gap:1px!important;min-width:0!important}
        .shell .nav-actions>.icon-btn{width:32px!important;min-width:32px!important;flex:0 0 32px!important;padding:0!important}
      }
      @media(max-width:420px){
        .shell .og-menu-trigger{width:32px!important;min-width:32px!important}
        .shell .nav-actions>.icon-btn{width:30px!important;min-width:30px!important;flex-basis:30px!important}
        .shell .og-primary-grid{grid-template-columns:1fr}
        .shell .og-primary-grid .more-item{border-right:0!important;border-bottom:1px solid #ececea!important}
        .shell .og-primary-grid .more-item:last-child{border-bottom:0!important}
      }
      @media(max-width:980px){.shell .nav-links{display:none!important}}
    `;
    document.head.appendChild(style);

    const setOpen = (open) => {
      menu.style.display = open ? "block" : "none";
      trigger.setAttribute("aria-expanded", String(open));
      if (window.innerWidth <= 980) document.body.style.overflow = open ? "hidden" : "";
    };
    const toggle = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(menu.style.display !== "block");
    };
    const close = (event) => {
      if (!wrap.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.focus();
      }
    };
    const onResize = () => { if (window.innerWidth > 980) document.body.style.overflow = ""; };

    trigger.addEventListener("click", toggle);
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    wrap.append(trigger, menu);
    navActions.appendChild(wrap);

    return () => {
      document.body.style.overflow = "";
      trigger.removeEventListener("click", toggle);
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      style.remove();
      wrap.remove();
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/produk") return undefined;
    const existing = document.querySelector('script[data-oxygen-midtrans="true"]');
    if (existing) return undefined;

    const script = document.createElement("script");
    script.src = window.location.hostname === "www.oxygengear.store" || window.location.hostname === "oxygengear.store"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.dataset.oxygenMidtrans = "true";
    script.async = true;
    if (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [pathname]);

  useEffect(() => {
    const nav = document.querySelector(".nav-links");
    if (!nav || nav.querySelector(".event-nav-wrap")) return;

    const privateTrip = Array.from(nav.querySelectorAll("a")).find((link) => link.getAttribute("href") === "/private-trip");
    if (!privateTrip) return;
    const contact = Array.from(nav.querySelectorAll("a")).find((link) => link.getAttribute("href") === "/kontak");
    if (contact) contact.remove();

    const wrap = document.createElement("div");
    wrap.className = "event-nav-wrap";
    Object.assign(wrap.style, { position: "relative", height: "100%", display: "flex", alignItems: "center", alignSelf: "stretch" });

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "event-nav-trigger";
    trigger.textContent = "EVENT";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "menu");
    Object.assign(trigger.style, { border: "0", background: "transparent", cursor: "pointer", padding: "0 2px", color: "#111", font: "inherit", height: "100%", display: "flex", alignItems: "center" });

    const menu = document.createElement("div");
    menu.className = "event-nav-menu";
    menu.setAttribute("role", "menu");
    Object.assign(menu.style, { display: "none", position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: "330px", padding: "10px", background: "#fff", border: "1px solid #e5e5e5", borderTop: "2px solid #e1261c", boxShadow: "0 18px 50px rgba(0,0,0,.13)", zIndex: "120" });
    menu.innerHTML = `
      <a href="/event" class="event-nav-item" role="menuitem"><strong>SEMUA EVENT</strong><span>Lihat seluruh agenda Oxygen Gear</span></a>
      <a href="/event#pendakian-bersama" class="event-nav-item" role="menuitem"><strong>PENDAKIAN BERSAMA</strong><span>Agenda pendakian komunitas</span></a>
      <a href="/event#ekspedisi" class="event-nav-item" role="menuitem"><strong>EKSPEDISI</strong><span>Perjalanan dan eksplorasi khusus</span></a>
      <a href="/private-trip" class="event-nav-item" role="menuitem"><strong>PRIVATE TRIP</strong><span>Trip eksklusif sesuai tim Anda</span></a>
    `;

    menu.querySelectorAll(".event-nav-item").forEach((item, index, items) => {
      Object.assign(item.style, { display: "block", padding: "14px 13px", color: "#222", textDecoration: "none", borderBottom: index === items.length - 1 ? "0" : "1px solid #efefef" });
      item.addEventListener("mouseenter", () => { item.style.background = "#f7f7f5"; item.style.color = "#e1261c"; });
      item.addEventListener("mouseleave", () => { item.style.background = "transparent"; item.style.color = "#222"; });
      const strong = item.querySelector("strong");
      const span = item.querySelector("span");
      if (strong) Object.assign(strong.style, { display: "block", fontSize: "11px", letterSpacing: ".06em" });
      if (span) Object.assign(span.style, { display: "block", marginTop: "5px", color: "#777", fontSize: "11px", lineHeight: "1.45" });
    });

    let closeTimer;
    const setOpen = (open) => { clearTimeout(closeTimer); menu.style.display = open ? "block" : "none"; trigger.setAttribute("aria-expanded", String(open)); trigger.style.color = open ? "#e1261c" : "#111"; };
    const openOnHover = () => setOpen(true);
    const closeOnLeave = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => setOpen(false), 100); };
    trigger.addEventListener("mouseenter", openOnHover);
    trigger.addEventListener("mouseleave", closeOnLeave);
    menu.addEventListener("mouseenter", openOnHover);
    menu.addEventListener("mouseleave", closeOnLeave);
    trigger.addEventListener("click", (event) => { event.preventDefault(); setOpen(menu.style.display !== "block"); });
    const close = (event) => { if (!wrap.contains(event.target)) setOpen(false); };
    const onKeyDown = (event) => { if (event.key === "Escape") { setOpen(false); trigger.focus(); } };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKeyDown);
    wrap.append(trigger, menu);
    privateTrip.replaceWith(wrap);

    return () => {
      clearTimeout(closeTimer);
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKeyDown);
      trigger.removeEventListener("mouseenter", openOnHover);
      trigger.removeEventListener("mouseleave", closeOnLeave);
      menu.removeEventListener("mouseenter", openOnHover);
      menu.removeEventListener("mouseleave", closeOnLeave);
      wrap.remove();
      if (contact && !nav.contains(contact)) nav.append(contact);
    };
  }, []);

  return (
    <style dangerouslySetInnerHTML={{
      __html: '.context-nav-member .context-nav-item[href="/pesanan-saya"],.context-nav-member .context-nav-item[href="/status-pengiriman"]{display:none!important}.shell .topbar{display:none!important}.shell .ticker span:last-child{display:none!important}',
    }} />
  );
}
