"use client";

import { useEffect } from "react";

const navTextStyle = {
  border: "0",
  background: "transparent",
  cursor: "pointer",
  padding: "0 2px",
  color: "#111",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "normal",
  lineHeight: "1",
  height: "100%",
  display: "flex",
  alignItems: "center",
};

function styleItem(item, index, items) {
  Object.assign(item.style, {
    display: "block",
    padding: "15px 16px",
    color: "#151515",
    textDecoration: "none",
    borderBottom: index === items.length - 1 ? "0" : "1px solid #ececea",
    borderRadius: "10px",
    transition: "background .18s ease,color .18s ease,transform .18s ease",
    boxSizing: "border-box",
    width: "100%",
    margin: "0",
    transform: "none",
  });
  item.addEventListener("mouseenter", () => {
    item.style.background = "#f5f5f2";
    item.style.color = "#e1261c";
    item.style.transform = "none";
  });
  item.addEventListener("mouseleave", () => {
    item.style.background = "transparent";
    item.style.color = "#151515";
    item.style.transform = "none";
  });
  const strong = item.querySelector("strong");
  const span = item.querySelector("span");
  if (strong) Object.assign(strong.style, { display: "block", fontSize: "11px", letterSpacing: ".13em", fontWeight: "800", lineHeight: "1.3" });
  if (span) Object.assign(span.style, { display: "block", marginTop: "6px", color: "#777", fontSize: "11px", lineHeight: "1.5" });
}

function createDropdown(triggerText, links) {
  const wrap = document.createElement("div");
  wrap.className = `context-nav-wrap context-nav-${triggerText.toLowerCase()}`;
  Object.assign(wrap.style, { position: "relative", height: "100%", display: "flex", alignItems: "center", alignSelf: "stretch" });
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "context-nav-trigger";
  trigger.textContent = triggerText;
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-haspopup", "menu");
  Object.assign(trigger.style, navTextStyle);
  const menu = document.createElement("div");
  menu.className = "context-nav-menu";
  menu.setAttribute("role", "menu");
  Object.assign(menu.style, { display: "none", position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: "330px", padding: "10px", background: "#fff", border: "1px solid #e5e5e5", borderTop: "2px solid #e1261c", borderRadius: "0 0 14px 14px", boxShadow: "0 18px 50px rgba(0,0,0,.13)", zIndex: "120" });
  menu.innerHTML = links.map((link) => `<a href="${link.href}" class="context-nav-item" role="menuitem"><strong>${link.title}</strong><span>${link.copy}</span></a>`).join("");
  const items = Array.from(menu.querySelectorAll(".context-nav-item"));
  items.forEach((item, index) => styleItem(item, index, items));
  let closeTimer;
  const setOpen = (open) => { clearTimeout(closeTimer); menu.style.display = open ? "block" : "none"; trigger.setAttribute("aria-expanded", String(open)); trigger.style.color = open ? "#e1261c" : "#111"; };
  const open = () => setOpen(true);
  const close = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => setOpen(false), 120); };
  trigger.addEventListener("mouseenter", open);
  trigger.addEventListener("mouseleave", close);
  menu.addEventListener("mouseenter", open);
  menu.addEventListener("mouseleave", close);
  trigger.addEventListener("click", (event) => { event.preventDefault(); setOpen(menu.style.display !== "block"); });
  wrap.appendChild(trigger);
  wrap.appendChild(menu);
  return { wrap, cleanup: () => { clearTimeout(closeTimer); } };
}

function addMobilePrimaryNav(menu) {
  if (menu.querySelector(".mobile-primary-nav")) return;
  const nav = document.createElement("nav");
  nav.className = "mobile-primary-nav";
  nav.setAttribute("aria-label", "Navigasi utama");
  const links = [
    ["PRODUK", "/"],
    ["EVENT", "/event"],
    ["MEMBER", "/member"],
    ["TENTANG", "/tentang"],
  ];
  links.forEach(([label, href]) => {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    nav.appendChild(a);
  });
  menu.prepend(nav);
}

function polishMobileMenu() {
  const menu = document.querySelector(".more-menu");
  if (!menu) return () => {};
  const trigger = menu.parentElement?.querySelector("button");
  if (!trigger) return () => {};

  trigger.classList.add("og-menu-trigger");
  trigger.setAttribute("aria-label", "Buka menu navigasi");
  trigger.setAttribute("aria-controls", "oxygen-mobile-menu");
  menu.id = "oxygen-mobile-menu";
  trigger.textContent = "MENU";
  Object.assign(trigger.style, navTextStyle, { minWidth: "auto", height: "40px", padding: "0 2px" });
  addMobilePrimaryNav(menu);

  const style = document.createElement("style");
  style.dataset.oxygenMobileMenu = "true";
  style.textContent = `
    html,body{overflow-x:hidden!important}
    .og-menu-trigger:hover{color:#e1261c!important}
    .og-menu-trigger:focus-visible{outline:2px solid #e1261c!important;outline-offset:4px!important}
    @media(max-width:980px){
      .shell .nav-links{display:none!important}
      .shell .more-menu{position:fixed!important;top:72px!important;right:14px!important;left:auto!important;width:min(360px,calc(100vw - 28px))!important;max-width:calc(100vw - 28px)!important;max-height:calc(100vh - 90px)!important;overflow-x:hidden!important;overflow-y:auto!important;padding:12px!important;border:1px solid #e2e2df!important;border-top:3px solid #e1261c!important;border-radius:18px!important;background:rgba(255,255,255,.985)!important;box-shadow:0 24px 70px rgba(0,0,0,.18)!important;backdrop-filter:blur(18px)!important;box-sizing:border-box!important}
      .shell .more-menu .mobile-primary-nav{display:grid!important;grid-template-columns:1fr 1fr!important;gap:0!important;margin:0 0 10px!important;padding:4px!important;border:1px solid #ececea!important;border-radius:12px!important;background:#fafaf8!important;box-sizing:border-box!important}
      .shell .more-menu .mobile-primary-nav a{display:flex!important;align-items:center!important;justify-content:flex-start!important;min-width:0!important;min-height:46px!important;padding:12px 10px!important;box-sizing:border-box!important;color:#111!important;text-decoration:none!important;font:800 11px/1.2 Arial,Helvetica,sans-serif!important;letter-spacing:.08em!important;border-bottom:1px solid #ececea!important}
      .shell .more-menu .mobile-primary-nav a:nth-child(odd){border-right:1px solid #ececea!important}
      .shell .more-menu .mobile-primary-nav a:nth-child(3),.shell .more-menu .mobile-primary-nav a:nth-child(4){border-bottom:0!important}
      .shell .more-menu .mobile-primary-nav a:hover{color:#e1261c!important;background:#f4f4f1!important}
      .shell .more-menu .more-item{border-radius:12px!important;margin:3px 0!important;padding:14px!important;box-sizing:border-box!important;width:100%!important;transform:none!important;text-align:left!important}
      .shell .more-menu .more-item a,.shell .more-menu .more-item button{margin:0!important;padding:0!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;text-align:left!important;transform:none!important}
      .shell .more-menu .more-item:hover{background:#f6f6f4!important;color:#e1261c!important}
      .shell .more-menu .more-section{margin:2px 0 8px!important;padding:14px!important;border:0!important;background:#f7f7f5!important;border-radius:12px!important;box-sizing:border-box!important;width:100%!important;text-align:left!important}
      .shell .more-menu .more-label{color:#e1261c!important;font-weight:800!important;letter-spacing:.14em!important}
      .shell .more-menu a{overflow-wrap:anywhere!important;word-break:normal!important}
      .shell .more-menu svg{flex:0 0 auto!important}
      .shell .more-menu .more-item span,.shell .more-menu .more-item strong{max-width:100%!important;box-sizing:border-box!important}
      .shell .more-menu .more-item .arrow,.shell .more-menu .more-item [aria-hidden="true"]{display:inline-flex!important;flex:0 0 auto!important;margin-left:6px!important}
      .shell .ticker{width:100%!important;max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;display:flex!important;flex-wrap:nowrap!important;white-space:nowrap!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;box-sizing:border-box!important}
      .shell .ticker::-webkit-scrollbar{display:none!important}
      .shell .ticker>*{flex:0 0 auto!important;white-space:nowrap!important}
      .shell .hero,.shell .section,.shell .container{max-width:100%!important;box-sizing:border-box!important}
      .shell img{max-width:100%!important}
    }
    @media(max-width:380px){
      .shell .more-menu{right:10px!important;width:calc(100vw - 20px)!important;max-width:calc(100vw - 20px)!important}
      .shell .more-menu .mobile-primary-nav{grid-template-columns:1fr!important}
      .shell .more-menu .mobile-primary-nav a{border-right:0!important;border-bottom:1px solid #ececea!important}
      .shell .more-menu .mobile-primary-nav a:last-child{border-bottom:0!important}
    }
  `;
  document.head.appendChild(style);

  const sync = () => {
    const open = menu.classList.contains("open") || menu.getAttribute("aria-hidden") === "false" || getComputedStyle(menu).display !== "none";
    trigger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open && window.innerWidth <= 980 ? "hidden" : "";
  };
  const onDocumentClick = (event) => {
    if (!menu.contains(event.target) && !trigger.contains(event.target) && getComputedStyle(menu).display !== "none") trigger.click();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape" && getComputedStyle(menu).display !== "none") { trigger.click(); setTimeout(sync, 0); trigger.focus(); }
  };
  trigger.addEventListener("click", () => setTimeout(sync, 0));
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeyDown);

  return () => {
    document.body.style.overflow = "";
    trigger.classList.remove("og-menu-trigger");
    trigger.removeAttribute("aria-label");
    trigger.removeAttribute("aria-controls");
    style.remove();
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onKeyDown);
  };
}

function installNavigation(nav) {
  if (!nav) return null;
  const cleanups = [];
  const replaced = [];

  if (!nav.querySelector(".context-nav-member")) {
    const member = Array.from(nav.querySelectorAll("a")).find((link) => link.getAttribute("href") === "/member");
    const source = member || (() => { const link = document.createElement("a"); link.href = "/member"; link.className = "nav-link member-nav-link"; link.textContent = "MEMBER"; link.style.textDecoration = "none"; return link; })();
    if (!member) { const eventWrap = nav.querySelector(".event-nav-wrap"); if (eventWrap) eventWrap.insertAdjacentElement("afterend", source); else nav.appendChild(source); }
    const link = Array.from(nav.querySelectorAll("a")).find((item) => item.getAttribute("href") === "/member");
    if (link && !nav.querySelector(".context-nav-member")) {
      const result = createDropdown("MEMBER", [
        { href: "/member", title: "MEMBER AREA", copy: "Dashboard dan akses akun member" },
        { href: "/pesanan-saya", title: "PESANAN SAYA", copy: "Riwayat dan detail pesanan" },
        { href: "/status-pengiriman", title: "STATUS PENGIRIMAN", copy: "Pantau perjalanan pesanan Anda" },
        { href: "/informasi-user", title: "INFORMASI AKUN", copy: "Profil dan informasi member" },
      ]);
      link.replaceWith(result.wrap); cleanups.push(result.cleanup); replaced.push(result.wrap);
    }
  }

  if (!nav.querySelector(".context-nav-tentang")) {
    const about = Array.from(nav.querySelectorAll("a")).find((link) => link.getAttribute("href") === "/tentang");
    if (about) {
      const result = createDropdown("TENTANG", [
        { href: "/tentang", title: "TENTANG OXYGEN GEAR", copy: "Siapa kami dan alasan kami membangun Oxygen Gear" },
        { href: "/tentang#approach", title: "OUR APPROACH", copy: "Equipment · Adventure · Community" },
        { href: "/event", title: "OUR EVENTS", copy: "Pendakian bersama, ekspedisi, dan private trip" },
        { href: "/kontak", title: "KONTAK", copy: "Bantuan produk, checkout, dan kebutuhan perjalanan" },
      ]);
      about.replaceWith(result.wrap); cleanups.push(result.cleanup); replaced.push(result.wrap);
    }
  }
  return () => { cleanups.forEach((cleanup) => cleanup()); replaced.forEach((wrap) => wrap.remove()); };
}

export default function MemberMenu() {
  useEffect(() => {
    let active = true;
    let navigationCleanup = null;
    let mobileMenuCleanup = () => {};
    const attempt = () => {
      if (!active) return;
      const nav = document.querySelector(".nav-links");
      if (nav && !navigationCleanup) navigationCleanup = installNavigation(nav);
      if (document.querySelector(".more-menu") && !document.querySelector(".og-menu-trigger")) mobileMenuCleanup = polishMobileMenu();
    };
    attempt();
    const observer = new MutationObserver(attempt);
    observer.observe(document.body, { childList: true, subtree: true });
    const retry = setInterval(attempt, 250);
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll(".context-nav-menu").forEach((menu) => { menu.style.display = "none"; });
        document.querySelectorAll(".context-nav-trigger").forEach((trigger) => { trigger.setAttribute("aria-expanded", "false"); trigger.style.color = "#111"; });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { active = false; observer.disconnect(); clearInterval(retry); document.removeEventListener("keydown", onKeyDown); if (navigationCleanup) navigationCleanup(); mobileMenuCleanup(); };
  }, []);
  return null;
}
