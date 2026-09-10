import Script from "next/script";
import AccountMenu from "./account-menu";
import EventMenu from "./event-menu";
import MemberMenu from "./member-menu";

export const metadata = {
  title: "Oxygen Gear Equipment",
  description:
    "Peralatan teknis dan jasa private trip untuk mereka yang pergi lebih jauh.",
};

const midtransSnapUrl =
  process.env.VERCEL_ENV === "production"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

const themeCss = `
:root{--og-bg:#fff;--og-surface:#f7f7f5;--og-surface-2:#f2f2f0;--og-text:#111;--og-muted:#6b6b6b;--og-line:#e5e5e5;--og-accent:#e1261c;--og-max:1440px}
html{background:#fff!important;color-scheme:light}
body{margin:0!important;background:#fff!important;color:#111!important;font-family:Arial,Helvetica,sans-serif!important}
button,input,textarea,select{font-family:Arial,Helvetica,sans-serif}
/* Oxygen Gear storefront: clean, bright, editorial ecommerce treatment inspired by modern sports retail */
.shell,.page{background:#fff!important;color:#111!important}
.container{max-width:var(--og-max)!important}
.shell .topbar{background:#111!important;color:#fff!important}
.shell .nav{background:rgba(255,255,255,.97)!important;border-bottom:1px solid #e5e5e5!important;backdrop-filter:blur(16px)}
.shell .brand{color:#111!important;font-size:0!important;width:185px;height:42px;display:block;background:url('/oxygen-logo.svg') left center/contain no-repeat!important;flex:0 0 185px}
.shell .brand-mark{display:none!important}
.shell .nav-link{color:#111!important}.shell .nav-link:hover{color:#e1261c!important}
.shell .icon-btn{color:#111!important}.shell .icon-btn:hover{color:#e1261c!important}
.shell .more-menu{background:#fff!important;border-color:#e5e5e5!important;box-shadow:0 18px 50px rgba(0,0,0,.12)!important}
.shell .more-item{color:#222!important}.shell .more-item:hover{background:#f5f5f5!important;color:#111!important}
.shell .more-section{border-color:#e5e5e5!important}.shell .more-label,.shell .more-copy{color:#6b6b6b!important}
.shell .search-panel{border-color:#e5e5e5!important}.shell .search-inner input{color:#111!important}.shell .search-inner input::placeholder{color:#888!important}
.shell .hero{background:#f3f3f1!important}.shell .hero img{filter:saturate(.9) contrast(1.02)!important;opacity:.82!important}.shell .hero:after{background:linear-gradient(90deg,rgba(255,255,255,.96),rgba(255,255,255,.72) 48%,rgba(255,255,255,.08)),linear-gradient(0deg,rgba(255,255,255,.85),transparent 50%)!important}
.shell .hero-content{color:#111!important}.shell .eyebrow{color:#e1261c!important}.shell .hero h1{color:#111!important}.shell .hero h1 em{color:#e1261c!important}.shell .hero p{color:#444!important}
.shell .btn{background:#111!important;color:#fff!important;border-color:#111!important}.shell .btn:hover{background:#e1261c!important;border-color:#e1261c!important;color:#fff!important}.shell .btn.ghost{background:#fff!important;color:#111!important;border-color:#111!important}
.shell .ticker{background:#fff!important;border-color:#e5e5e5!important;color:#111!important}.shell .ticker span{border-color:#e5e5e5!important}.shell .ticker b{color:#e1261c!important}
.shell .section{border-color:#e5e5e5!important}.shell .section-kicker{color:#e1261c!important}.shell .section-title{color:#111!important}.shell .section-copy{color:#6b6b6b!important}.shell .view-all{color:#111!important}.shell .view-all:hover{color:#e1261c!important}
.shell .category{background:#f7f7f5!important;border-color:#e5e5e5!important}.shell .category img{filter:saturate(.82)!important;opacity:.8!important}.shell .category:after{background:linear-gradient(0deg,rgba(0,0,0,.65),transparent 70%)!important}
.shell .product-card{background:#fff!important;border-color:#e5e5e5!important}.shell .product-image{background:#f5f5f3!important}.shell .product-image img{filter:saturate(.9)!important}.shell .product-info h3{color:#111!important}.shell .product-info p,.shell .product-code,.shell .stock-note{color:#6b6b6b!important}.shell .price-row strong{color:#111!important}.shell .price-row del{color:#888!important}
.shell .quick-add{background:#fff!important;color:#111!important;border-color:#d8d8d8!important}.shell .quick-add:hover{background:#111!important;color:#fff!important;border-color:#111!important}.shell .badge{background:#e1261c!important}.shell .image-meta{color:#fff!important}
.page{padding-top:28px!important}.page .back{color:#111!important}.page .eyebrow{color:#e1261c!important}.page .title{color:#111!important}.page .filters{scrollbar-width:none}.page .filter{background:#fff!important;color:#555!important;border-color:#d9d9d9!important}.page .filter.active{background:#111!important;color:#fff!important;border-color:#111!important}.page .subfilters{border-color:#e5e5e5!important}.page .subfilter{color:#777!important}.page .subfilter.active{color:#111!important}.page .categoryBlock{border:0}.page .categoryTitle{color:#111!important}.page .categoryMeta,.page .kind{color:#6b6b6b!important}.page .card{background:#fff!important;border-color:#e5e5e5!important}.page .visual{background:#f5f5f3!important;border-color:#e5e5e5!important}.page .name{color:#111!important}.page .description{color:#6b6b6b!important}.page .price{color:#111!important}.page .btn,.page .cartButton,.page .checkout{background:#111!important;color:#fff!important;border-color:#111!important}.page .btn.secondary{background:#fff!important;color:#111!important;border-color:#111!important}.page .btn:hover:not(:disabled),.page .cartButton:hover,.page .checkout:hover{background:#e1261c!important;border-color:#e1261c!important;color:#fff!important}.page .detail{border-color:#e5e5e5!important;color:#111!important}.page .drawer,.page .modal{background:#fff!important;border-color:#e5e5e5!important;color:#111!important;box-shadow:0 20px 70px rgba(0,0,0,.14)!important}.page .overlay{background:rgba(0,0,0,.38)!important}.page .row{border-color:#e5e5e5!important}.page .qty button{border-color:#d9d9d9!important;color:#111!important}.page .close{color:#555!important}.page .field{color:#555!important}.page .field input,.page .field textarea{background:#fff!important;border-color:#d9d9d9!important;color:#111!important}.page .summary{border-color:#e5e5e5!important}.page .error{border-color:#efb7b3!important;color:#a51d16!important;background:#fff8f7!important}
.account-logout{background:rgba(255,255,255,.96)!important;color:#111!important;border-color:#d9d9d9!important;box-shadow:0 6px 24px rgba(0,0,0,.08)!important}.account-logout:hover:not(:disabled){border-color:#e1261c!important;color:#e1261c!important}
@media(max-width:980px){.shell .brand{width:160px;height:38px;flex-basis:160px}.shell .nav-main{gap:16px}}
@media(max-width:650px){.shell .brand{width:132px;height:34px;flex-basis:132px}.shell .hero{min-height:620px!important}.shell .hero h1{font-size:clamp(48px,15vw,78px)!important}.shell .section{padding:60px 0!important}.shell .category-grid{grid-template-columns:repeat(2,1fr)!important}.shell .product-grid{grid-template-columns:1fr!important}.shell .product-image{height:360px!important}.page{padding:24px!important}}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <AccountMenu />
        <EventMenu />
        <MemberMenu />
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <Script
          src={midtransSnapUrl}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
