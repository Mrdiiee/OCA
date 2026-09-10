import { createClient } from "@supabase/supabase-js";
import ProductDetailClient from "./client";

const SITE_URL = "https://www.oxygengear.store";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=85";

async function getProduct(slug) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !slug) return null;

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data } = await supabase
    .from("products")
    .select("id,name,slug,description,price,stock,image_url,category,subcategory")
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();

  return data || null;
}

function absoluteImage(url) {
  if (!url) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params?.slug);

  if (!product) {
    return {
      title: "Produk tidak ditemukan | Oxygen Gear",
      description: "Produk Oxygen Gear yang diminta tidak tersedia.",
      robots: { index: false, follow: true },
    };
  }

  const description = String(
    product.description ||
      `Beli ${product.name} dari Oxygen Gear. Perlengkapan outdoor untuk aktivitas luar ruang.`
  ).slice(0, 160);
  const image = absoluteImage(product.image_url);
  const canonical = `${SITE_URL}/produk/${encodeURIComponent(product.slug)}`;

  return {
    title: `${product.name} | Oxygen Gear`,
    description,
    alternates: { canonical },
    keywords: [product.name, product.category, product.subcategory, "Oxygen Gear", "perlengkapan outdoor"].filter(Boolean),
    openGraph: {
      type: "website",
      url: canonical,
      title: `${product.name} | Oxygen Gear`,
      description,
      siteName: "Oxygen Gear",
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Oxygen Gear`,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProduct(params?.slug);
  const image = absoluteImage(product?.image_url);
  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `Perlengkapan outdoor ${product.name} dari Oxygen Gear.`,
        image: [image],
        sku: product.slug,
        brand: { "@type": "Brand", name: "Oxygen Gear" },
        category: [product.category, product.subcategory].filter(Boolean).join(" > "),
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/produk/${encodeURIComponent(product.slug)}`,
          priceCurrency: "IDR",
          price: Number(product.price || 0).toFixed(2),
          availability:
            Number(product.stock || 0) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ProductDetailClient params={params} />
    </>
  );
}
