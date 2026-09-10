const SITE_URL = "https://www.oxygengear.store";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function sitemap() {
  const staticRoutes = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/produk`, changeFrequency: "daily", priority: 0.9 },
  ];

  if (!SUPABASE_URL || !SUPABASE_KEY) return staticRoutes;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=slug,updated_at&is_active=eq.true&order=updated_at.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!response.ok) return staticRoutes;
    const products = await response.json();

    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${SITE_URL}/produk/${encodeURIComponent(product.slug)}`,
        lastModified: product.updated_at || undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
