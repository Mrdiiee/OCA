"use client";

import { useEffect } from "react";

export default function EventMenu() {
  useEffect(() => {
    const nav = document.querySelector(".nav-links");
    if (!nav || nav.querySelector(".event-nav-wrap")) return;

    const privateTrip = Array.from(nav.querySelectorAll("a")).find((link) => link.getAttribute("href") === "/private-trip");
    if (!privateTrip) return;

    const wrap = document.createElement("div");
    wrap.className = "event-nav-wrap";
    wrap.style.position = "relative";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "nav-link event-nav-trigger";
    trigger.textContent = "EVENT";
    trigger.setAttribute("aria-expanded", "false");
    trigger.style.border = "0";
    trigger.style.background = "transparent";
    trigger.style.cursor = "pointer";
    trigger.style.padding = "0";

    const menu = document.createElement("div");
    menu.className = "event-nav-menu";
    menu.style.display = "none";
    menu.innerHTML = `
      <a href="/event" class="event-nav-item"><strong>SEMUA EVENT</strong><span>Lihat seluruh agenda Oxygen Gear</span></a>
      <a href="/event#pendakian-bersama" class="event-nav-item"><strong>PENDAKIAN BERSAMA</strong><span>Agenda pendakian komunitas</span></a>
      <a href="/event#ekspedisi" class="event-nav-item"><strong>EKSPEDISI</strong><span>Perjalanan dan eksplorasi khusus</span></a>
      <a href="/private-trip" class="event-nav-item"><strong>PRIVATE TRIP</strong><span>Trip eksklusif sesuai tim Anda</span></a>
    `;

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const open = menu.style.display === "block";
      menu.style.display = open ? "none" : "block";
      trigger.setAttribute("aria-expanded", String(!open));
    });

    const close = (event) => {
      if (!wrap.contains(event.target)) {
        menu.style.display = "none";
        trigger.setAttribute("aria-expanded", "false");
      }
    };
    document.addEventListener("click", close);

    wrap.append(trigger, menu);
    privateTrip.replaceWith(wrap);

    return () => {
      document.removeEventListener("click", close);
      wrap.remove();
      if (nav.isConnected && !nav.querySelector('a[href="/private-trip"]')) {
        const link = document.createElement("a");
        link.className = "nav-link";
        link.href = "/private-trip";
        link.textContent = "PRIVATE TRIP";
        nav.appendChild(link);
      }
    };
  }, []);

  return null;
}
