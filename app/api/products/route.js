import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return NextResponse.json({ error: "Konfigurasi database belum lengkap." }, { status: 500 });

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    let query = supabase
      .from("products")
      .select("id,name,slug,description,price,stock,image_url,is_active,category,subcategory,created_at")
      .eq("is_active", true);

    if (slug) query = query.eq("slug", slug).limit(1);
    else query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Gagal mengambil produk:", error);
      return NextResponse.json({ error: "Produk gagal dimuat." }, { status: 500 });
    }

    const mapProduct = (row) => {
      const image = typeof row.image_url === "string" && row.image_url.trim() ? row.image_url.trim() : null;
      return {
        id: row.id,
        code: String(row.slug || row.id).slice(0, 10).toUpperCase(),
        name: row.name,
        slug: row.slug,
        category: row.category || "Lainnya",
        subcategory: row.subcategory || "Outdoor",
        kind: row.subcategory || "Outdoor",
        price: Number(row.price || 0),
        oldPrice: null,
        badge: Number(row.stock || 0) <= 0 ? "OUT OF STOCK" : "AVAILABLE",
        image,
        imageUrl: image,
        blurb: row.description || "Perlengkapan outdoor pilihan Oxygen Gear.",
        description: row.description || "Perlengkapan outdoor pilihan Oxygen Gear.",
        stock: Number(row.stock || 0),
      };
    };

    if (slug) {
      if (!data?.length) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
      return NextResponse.json({ product: mapProduct(data[0]) });
    }

    return NextResponse.json({ products: (data || []).map(mapProduct) });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memuat produk." }, { status: 500 });
  }
}
