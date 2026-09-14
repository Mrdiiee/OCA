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
    trigger.innerHTML = "<svg width=20 height=20 viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'><path d='M4 7h16M4 12h16M4 17h16'/></svg>";

    const menu = document.createElement("div");
    menu.className = "more-menu";
    menu.setAttribute("role", "menu");
    menu.innerHTML = `
      <a class="more-item" href="/informasi-user">Informasi Akun</a>
      <a class="more-item" href="/status-pengiriman">Status Pengiriman</a>
      <a class="more-item" href="/kontak">Kontak Person</a>
      <div class="more-section">
        <div class="more-label">SOCIAL</div>
        <div class="more-title">Instagram</div>
        <div class="more-copy">Ikuti update Oxygen Gear di Instagram.</div>
        <a class="more-item" href="https://www.instagram.com/oxygenmontain/" target="_blank" rel="noopener noreferrer">@oxygenmontain</a>
      </div>
    `;

    Object.assign(menu.style, {
      display: "none",
      position: "absolute",
      right: "0",
      top: "50px",
      width: "320px",
      background: "#11110f",
      border: "1px solid #302e29",
      boxShadow: "0 20px 60px rgba(0,0,0,.55)",
      padding: "8px",
      zIndex: "400",
    });

    const items = Array.from(menu.querySelectorAll(".more-item"));
    items.forEach((item) => Object.assign(item.style, {
      display: "block",
      padding: "13px 12px",
      color: "#d8d5cd",
      borderRadius: "2px",
      fontSize: "13px",
      textDecoration: "none",
    }));

    const setOpen = (open) => {
      menu.style.display = open ? "block" : "none";
      trigger.setAttribute("aria-expanded", String(open));
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
      if (event.key === "Escape") setOpen(false);
    };

    trigger.addEventListener("click", toggle);
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKeyDown);
    wrap.append(trigger, menu);
    navActions.appendChild(wrap);

    return () => {
      trigger.removeEventListener("click", toggle);
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKeyDown);
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
    if (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
      script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
    }
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
