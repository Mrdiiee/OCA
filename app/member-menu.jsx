"use client";

import { useEffect } from "react";

export default function MemberMenu() {
  useEffect(() => {
    let active = true;

    const normalizeNavbar = () => {
      if (!active) return;
      const nav = document.querySelector(".nav-links");
      const main = document.querySelector(".nav-main");
      if (!nav || !main) return;

      // Make the desktop navbar layout deterministic with inline styles so no
      // legacy flex/grid rule can push EVENT onto a second line.
      if (window.innerWidth >= 981) {
        Object.assign(main.style, {
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0",
        });
        const brand = main.querySelector(".brand");
        if (brand) {
          Object.assign(brand.style, {
            position: "absolute",
            left: "0",
            top: "50%",
            transform: "translateY(-50%)",
          });
        }
        Object.assign(nav.style, {
          position: "static",
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "center",
          width: "auto",
          minWidth: "0",
          maxWidth: "none",
          flex: "0 0 auto",
          whiteSpace: "nowrap",
          gap: "30px",
          height: "76px",
          margin: "0",
          overflow: "visible",
        });
        nav.querySelectorAll(".nav-link, .event-nav-wrap, .event-nav-trigger").forEach((item) => {
          Object.assign(item.style, {
            flex: "0 0 auto",
            whiteSpace: "nowrap",
            display: item.classList.contains("event-nav-wrap") ? "flex" : "inline-flex",
            alignItems: "center",
            float: "none",
          });
        });
        const actions = main.querySelector(".nav-actions");
        if (actions) {
          Object.assign(actions.style, {
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
            margin: "0",
            display: "flex",
            alignItems: "center",
            flex: "0 0 auto",
          });
        }
      } else {
        main.style.removeProperty("position");
        main.style.removeProperty("display");
        main.style.removeProperty("align-items");
        main.style.removeProperty("justify-content");
        const brand = main.querySelector(".brand");
        if (brand) {
          brand.style.removeProperty("position");
          brand.style.removeProperty("left");
          brand.style.removeProperty("top");
          brand.style.removeProperty("transform");
        }
        const actions = main.querySelector(".nav-actions");
        if (actions) {
          actions.style.removeProperty("position");
          actions.style.removeProperty("right");
          actions.style.removeProperty("top");
          actions.style.removeProperty("transform");
          actions.style.removeProperty("margin");
          actions.style.removeProperty("flex");
        }
      }

      // MEMBER is inserted before TENTANG once, regardless of hydration order.
      if (!nav.querySelector('a[href="/member"]')) {
        const link = document.createElement("a");
        link.className = "nav-link";
        link.href = "/member";
        link.textContent = "MEMBER";
        const tentang = nav.querySelector('a[href="/tentang"]');
        nav.insertBefore(link, tentang || null);
      }
    };

    normalizeNavbar();
    const observer = new MutationObserver(normalizeNavbar);
    observer.observe(document.body, { childList: true, subtree: true });
    const retry = window.setInterval(normalizeNavbar, 200);
    window.addEventListener("resize", normalizeNavbar);

    return () => {
      active = false;
      observer.disconnect();
      window.clearInterval(retry);
      window.removeEventListener("resize", normalizeNavbar);
    };
  }, []);

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root{--og-red:#e1261c}
        .shell .nav{height:76px!important;position:sticky!important;top:0!important;z-index:9990!important}
        .shell .nav-link::after{display:none!important;content:none!important}
        .shell .nav-link,.shell .event-nav-trigger{font-size:10px!important;font-weight:800!important;letter-spacing:.075em!important;line-height:1!important;text-transform:uppercase!important;white-space:nowrap!important}
        .shell .nav-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:4px!important;height:76px!important}
        .shell .icon-btn{width:38px!important;height:38px!important;min-width:38px!important;border-radius:50%!important;display:grid!important;place-items:center!important}
        .shell .og-menu-trigger{width:42px!important;height:42px!important;margin-left:3px!important;border-radius:10px!important}
        .shell .event-nav-wrap{height:76px!important;align-items:center!important;align-self:stretch!important;position:relative!important}
        .shell .event-nav-trigger{height:76px!important;padding:0 2px!important;display:flex!important;align-items:center!important;border:0!important;background:transparent!important;cursor:pointer!important;color:#111!important}
        .shell .event-nav-menu{border-radius:14px!important;overflow:hidden!important;padding:6px!important;box-shadow:0 22px 60px rgba(0,0,0,.14)!important}
        .shell .event-nav-item{border-radius:10px!important;padding:15px 14px!important}
        .shell .more-menu{border-radius:18px!important;padding:8px!important;overflow:hidden!important;box-shadow:0 24px 70px rgba(0,0,0,.16)!important}

        @media(min-width:981px){
          .shell .nav-main{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:0!important}
          .shell .nav .brand{position:absolute!important;left:0!important;top:50%!important;transform:translateY(-50%)!important}
          .shell .nav-links{position:static!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;flex-wrap:nowrap!important;gap:30px!important;width:auto!important;min-width:0!important;max-width:none!important;flex:0 0 auto!important;height:76px!important;margin:0!important;white-space:nowrap!important;overflow:visible!important}
          .shell .nav-links>*{flex:0 0 auto!important;white-space:nowrap!important;float:none!important}
          .shell .nav-actions{position:absolute!important;right:0!important;top:50%!important;transform:translateY(-50%)!important;margin:0!important;flex:0 0 auto!important}
        }

        @media(max-width:980px){
          .shell .nav{height:68px!important}
          .shell .nav-links{display:none!important}
          .shell .nav-main{height:68px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:0 14px!important;box-sizing:border-box!important;width:100%!important;min-width:0!important}
          .shell .nav .brand{height:44px!important;width:auto!important;max-width:145px!important;flex:0 1 auto!important;min-width:0!important;margin-right:auto!important}
          .shell .nav-actions{height:68px!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:2px!important;flex:0 0 auto!important;width:auto!important;min-width:max-content!important;margin-left:auto!important}
          .shell .icon-btn{width:34px!important;height:34px!important;min-width:34px!important}
          .shell .og-menu-trigger{width:38px!important;height:38px!important;margin-left:2px!important}
        }
        @media(max-width:600px){
          .shell .nav-main{padding:0 10px!important}
          .shell .nav .brand{max-width:125px!important}
          .shell .icon-btn{width:31px!important;height:31px!important;min-width:31px!important}
          .shell .og-menu-trigger{width:35px!important;height:35px!important}
        }
      `,
    }} />
  );
}
