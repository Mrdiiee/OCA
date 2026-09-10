import Script from "next/script";
import AccountMenu from "./account-menu";
import EventMenu from "./event-menu";
import MemberMenu from "./member-menu";

export const metadata = {
  metadataBase: new URL("https://www.oxygengear.store"),
  title: {
    default: "Oxygen Gear Equipment",
    template: "%s | Oxygen Gear Equipment",
  },
  description:
    "Peralatan teknis dan jasa private trip untuk mereka yang pergi lebih jauh.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Oxygen Gear Equipment",
    description:
      "Peralatan teknis dan jasa private trip untuk mereka yang pergi lebih jauh.",
    url: "https://www.oxygengear.store/",
    siteName: "Oxygen Gear Equipment",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oxygen Gear Equipment",
    description:
      "Peralatan teknis dan jasa private trip untuk mereka yang pergi lebih jauh.",
  },
};

const midtransSnapUrl =
  process.env.VERCEL_ENV === "production"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

const themeCss = `
:root{--og-bg:#fff;--og-surface:#f7f7f5;--og-surface-2:#f2f2f0;--og-text:#111;--og-muted:#6b6b6b;--og-line:#e5e5e5;--og-accent:#e1261c;--og-max:1440px}
html{background:#fff!important;color-scheme:light}
body{margin:0!important;background:#fff!important;color:#111!important;font-family:Arial,Helvetica,sans-serif!important}`