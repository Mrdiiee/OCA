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

  return null;
}
