"use client";

import { useEffect } from "react";

export default function MemberMenu() {
  useEffect(() => {
    const nav = document.querySelector(".nav-links");
    if (!nav || nav.querySelector('a[href="/member"]')) return;

    const link = document.createElement("a");
    link.href = "/member";
    link.className = "nav-link member-nav-link";
    link.textContent = "MEMBER";
    link.style.textDecoration = "none";

    const eventWrap = nav.querySelector(".event-nav-wrap");
    if (eventWrap) eventWrap.insertAdjacentElement("afterend", link);
    else nav.appendChild(link);
  }, []);

  return null;
}
