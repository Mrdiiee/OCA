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
    Object.assign(wrap.style, { position: "relative" });

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "nav-link event-nav-trigger";
    trigger.textContent = "EVENT";
    trigger.setAttribute("aria-expanded", "false");
    Object.assign(trigger.style, { border: "0", background: "transparent", cursor: "pointer", padding: "0", color: "inherit", font: "inherit" });

    const menu = document.createElement("div");
    menu.className = "event-nav-menu";
    Object.assign(menu.style, { display: "none", position: "absolute", top: "30px", left: "-12px", width: "290px", padding: "8px", background: "#11110f", border: "1px solid #302e29", boxShadow: "0 20px 60px rgba(0,0,0,.55)", zIndex: "100" });
    menu.innerHTML = `
      <a href="/event" class="event-nav-item"><strong>SEMUA EVENT</strong><span>Lihat seluruh agenda Oxygen Gear</span></a>
      <a href="/event#pendakian-bersama" class="event-nav-item"><strong>PENDAKIAN BERSAMA</strong><span>Agenda pendakian komunitas</span></a>
      <a href="/event#ekspedisi" class="event-nav-item"><strong>EKSPEDISI</strong><span>Perjalanan dan eksplorasi khusus</span></a>
      <a href="/private-trip" class="event-nav-item"><strong>PRIVATE TRIP</strong><span>Trip eksklusif sesuai tim Anda</span></a>
    `;
    menu.querySelectorAll(".event-nav-item").forEach((item) => {
      Object.assign(item.style, { display: "block", padding: "13px 12px", color: "#d8d5cd", textDecoration: "none", borderRadius: "2px" });
      item.addEventListener("mouseenter", () => { item.style.background = "#1b1a17"; item.style.color = "#f7f6f3"; });
      item.addEventListener("mouseleave", () => { item.style.background = "transparent"; item.style.color = "#d8d5cd"; });
      const strong = item.querySelector("strong");
      const span = item.querySelector("span");
      if (strong) Object.assign(strong.style, { display: "block", fontSize: "12px" });
      if (span) Object.assign(span.style, { display: "block", marginTop: "4px", color: "#8b887f", fontSize: "11px", lineHeight: "1.4" });
    });

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
    };
  }, []);

  return null;
}
