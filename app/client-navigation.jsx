"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const shouldHandle = (anchor, event) => {
  if (!anchor || event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || rawHref.startsWith("javascript:")) return false;
  let url;
  try { url = new URL(rawHref, window.location.href); } catch { return false; }
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
    return false;
  }
  return true;
};

export default function ClientNavigation() {
  const router = useRouter();

  useEffect(() => {
    const onClick = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!shouldHandle(anchor, event)) return;
      const url = new URL(anchor.getAttribute("href"), window.location.href);
      event.preventDefault();
      router.push(`${url.pathname}${url.search}${url.hash}`);
    };

    const onPointerOver = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!shouldHandle(anchor, { ...event, defaultPrevented: false, button: 0 })) return;
      const url = new URL(anchor.getAttribute("href"), window.location.href);
      router.prefetch(`${url.pathname}${url.search}`);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onPointerOver);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onPointerOver);
    };
  }, [router]);

  return null;
}
