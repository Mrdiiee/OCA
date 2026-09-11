"use client";

import { useEffect } from "react";

function styleItem(item, index, items) {
  Object.assign(item.style, {
    display: "block",
    padding: "14px 13px",
    color: "#222",
    textDecoration: "none",
    borderBottom: index === items.length - 1 ? "0" : "1px solid #efefef",
  });
  item.addEventListener("mouseenter", () => {
    item.style.background = "#f7f7f5";
    item.style.color = "#e1261c";
  });
  item.addEventListener("mouseleave", () => {
    item.style.background = "transparent";
    item.style.color = "#222";
  });
  const strong = item.querySelector("strong");
  const span = item.querySelector("span");
  if (strong) Object.assign(strong.style, { display: "block", fontSize: "11px", letterSpacing: ".06em" });
  if (span) Object.assign(span.style, { display: "block", marginTop: "5px", color: "#777", fontSize: "11px", lineHeight: "1.45" });
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
  Object.assign(trigger.style, { border: "0", background: "transparent", cursor: "pointer", padding: "0 2px", color: "#111", font: "inherit", height: "100%", display: "flex", alignItems: "center" });

  const menu = document.createElement("div");
  menu.className = "context-nav-menu";
  menu.setAttribute("role", "menu");
  Object.assign(menu.style, { display: "none", position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: "330px", padding: "10px", background: "#fff", border: "1px solid #e5e5e5", borderTop: "2px solid #e1261c", boxShadow: "0 18px 50px rgba(0,0,0,.13)", zIndex: "120" });
  menu.innerHTML = links.map((link) => `<a href="${link.href}" class="context-nav-item" role="menuitem"><strong>${link.title}</strong><span>${link.copy}</span></a>`).join("");

  const items = Array.from(menu.querySelectorAll(".context-nav-item"));
  items.forEach((item, index) => styleItem(item, index, items));

  let closeTimer;
  const setOpen = (open) => {
    clearTimeout(closeTimer);
    menu.style.display = open ? "block" : "none";
    trigger.setAttribute("aria-expanded", String(open));
    trigger.style.color = open ? "#e1261c" : "#111";
  };
  const open = () => setOpen(true);
  const close = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setOpen(false), 100);
  };
  trigger.addEventListener("mouseenter", open);
  trigger.addEventListener("mouseleave", close);
  menu.addEventListener("mouseenter", open);
  menu.addEventListener("mouseleave", close);
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    setOpen(menu.style.display !== "block");
  });

  wrap.append(trigger, menu);
  return { wrap, trigger, menu, cleanup: () => { clearTimeout(closeTimer); trigger.removeEventListener("mouseenter", open); trigger.removeEventListener("mouseleave", close); menu.removeEventListener("mouseenter", open); menu.removeEventListener("mouseleave", close); } };
}

function polishMobileMenu() {
  const menu = document.querySelector(".more-menu");
  if (!menu) return () => {};

  const style = document.createElement("style");
  style.dataset.oxygenMobileMenu = "true";
  style.textContent = `
    .og-menu-trigger{position:relative!important;width:46px!important;height:46px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #e5e5e5!important;border-radius:50%!important;background:#fff!important;color:#111!important;box-shadow:0 8px 24px rgba(0,0,0,.08)!important;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease,background .2s ease!important;}
    .og-menu-trigger:hover{border-color:#e1261c!important;color:#e1261c!important;transform:translateY(-1px)!important;box-shadow:0 10px 28px rgba(225,38,28,.14)!important;}
    .og-menu-trigger:focus-visible{outline:2px solid #e1261c!important;outline-offset:3px!important;}
    .og-menu-icon{width:18px;height:14px;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none;}
    .og-menu-icon span{display:block;width:100%;height:2px;background:currentColor;border-radius:999px;transition:transform .2s ease,opacity .2s ease,width .2s ease;}
    .og-menu-trigger[aria-expanded="true"] .og-menu-icon span:nth-child(1){transform:translateY(6px) rotate(45deg);}
    .og-menu-trigger[aria-expanded="true"] .og-menu-icon span:nth-child(2){opacity:0;width:0;}
    .og-menu-trigger[aria-expanded="true"] .og-menu-icon span:nth-child(3){transform:translateY(-6px) rotate(-45deg);}
    @media(max-width:980px){
      .shell .more-menu{position:fixed!important;top:72px!important;right:14px!important;left:auto!important;width:min(330px,calc(100vw - 28px))!important;max-height:calc(100vh - 90px)!important;overflow:auto!important;padding:10px!important;border:1px solid #e5e5e5!important;border-top:3px solid #e1261c!important;border-radius:18px!important;background:rgba(255,255,255,.98)!important;box-shadow:0 24px 70px rgba(0,0,0,.18)!important;backdrop-filter:blur(18px)!important;}
      .shell .more-menu .more-item{border-radius:11px!important;margin:3px 0!important;padding:13px 14px!important;}
      .shell .more-menu .more-item:hover{background:#f7f7f5!important;}
      .og-menu-trigger{display:inline-flex!important;}
    }
  `;
  document.head.appendChild(style);

  const parent = menu.parentElement;
  let trigger = parent?.querySelector("button");
  if (!trigger) trigger = menu.previousElementSibling?.tagName === "BUTTON" ? menu.previousElementSibling : null;
  if (!trigger) trigger = menu.parentElement?.querySelector("[role='button']");
  if (!trigger) return () => style.remove();

  trigger.classList.add("og-menu-trigger");
  trigger.setAttribute("aria-label", "Buka menu");
  trigger.innerHTML = `<span class="og-menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>`;

  const sync = () => {
    const open = menu.classList.contains("open") || menu.getAttribute("aria-hidden") === "false" || getComputedStyle(menu).display !== "none";
    trigger.setAttribute("aria-expanded", String(open));
  };
  trigger.addEventListener("click", () => setTimeout(sync, 0));

  return () => {
    trigger.classList.remove("og-menu-trigger");
    trigger.removeAttribute("aria-label");
    style.remove();
  };
}

export default function MemberMenu() {
  useEffect(() => {
    const nav = document.querySelector(".nav-links");
    if (!nav) return;

    const cleanups = [];
    const replaced = [];

    const memberLink = Array.from(nav.querySelectorAll("a")).find((link) => link.getAttribute("href") === "/member");
    if (!memberLink) {
      const link = document.createElement("a");
      link.href = "/member";
      link.className = "nav-link member-nav-link";
      link.textContent = "MEMBER";
      link.style.textDecoration = "none";
      const eventWrap = nav.querySelector(".event-nav-wrap");
      if (eventWrap) eventWrap.insertAdjacentElement("afterend", link);
      else nav.appendChild(link);
    }

    const member = Array.from(nav.querySelectorAll("a")).find((link) => link.getAttribute("href") === "/member");
    if (member && !nav.querySelector(".context-nav-member")) {
      const result = createDropdown("MEMBER", [
        { href: "/member", title: "MEMBER AREA", copy: "Dashboard dan akses akun member" },
        { href: "/pesanan-saya", title: "PESANAN SAYA", copy: "Riwayat dan detail pesanan" },
        { href: "/status-pengiriman", title: "STATUS PENGIRIMAN", copy: "Pantau perjalanan pesanan Anda" },
        { href: "/informasi-user", title: "INFORMASI AKUN", copy: "Profil dan informasi member" },
      ]);
      member.replaceWith(result.wrap);
      cleanups.push(result.cleanup);
      replaced.push(result.wrap);
    }

    const about = Array.from(nav.querySelectorAll("a")).find((link) => link.getAttribute("href") === "/tentang");
    if (about && !nav.querySelector(".context-nav-tentang")) {
      const result = createDropdown("TENTANG", [
        { href: "/tentang", title: "TENTANG OXYGEN GEAR", copy: "Siapa kami dan alasan kami membangun Oxygen Gear" },
        { href: "/tentang#approach", title: "OUR APPROACH", copy: "Equipment · Adventure · Community" },
        { href: "/event", title: "OUR EVENTS", copy: "Pendakian bersama, ekspedisi, dan private trip" },
        { href: "/kontak", title: "KONTAK", copy: "Bantuan produk, checkout, dan kebutuhan perjalanan" },
      ]);
      about.replaceWith(result.wrap);
      cleanups.push(result.cleanup);
      replaced.push(result.wrap);
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        nav.querySelectorAll(".context-nav-menu").forEach((menu) => { menu.style.display = "none"; });
        nav.querySelectorAll(".context-nav-trigger").forEach((trigger) => { trigger.setAttribute("aria-expanded", "false"); trigger.style.color = "#111"; });
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const mobileMenuCleanup = polishMobileMenu();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cleanups.forEach((cleanup) => cleanup());
      replaced.forEach((wrap) => wrap.remove());
      mobileMenuCleanup();
    };
  }, []);

  return null;
}
