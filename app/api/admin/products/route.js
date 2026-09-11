import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

const ACTIVITIES = ['Trail Running', 'Camping', 'Hiking', 'Running', 'Riding', 'Field Trip', 'Traveling', 'Tactical'];

async function getAdminContext() {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) return { error: 'Silakan login terlebih dahulu.', status: 401 };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return { error: 'Konfigurasi server belum lengkap.', status: 500 };
  const admin = createSupabaseAdmin(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: adminUser, error: adminError } = await admin.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (adminError) return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  if (!adminUser) return { error: 'Akses admin ditolak.', status: 403 };
  return { admin };
}

function cleanActivities(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter((item) => ACTIVITIES.includes(item)))];
}

function cleanProduct(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const category = typeof body?.category === 'string' ? body.category.trim() : '';
  const subcategory = typeof body?.subcategory === 'string' ? body.subcategory.trim() : '';
  return { name, slug, description, imageUrl, category, subcategory, activities: cleanActivities(body?.activities), price: Number(body?.price), stock: Number(body?.stock) };
}

function validateProduct(p) {
  if (!p.name) return 'Nama produk wajib diisi.';
  if (!p.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) return 'Slug produk tidak valid.';
  if (!Number.isFinite(p.price) || p.price < 0) return 'Harga produk tidak valid.';
  if (!Number.isInteger(p.stock) || p.stock < 0) return 'Stok harus berupa bilangan bulat 0 atau lebih.';
  if (!p.category) return 'Kategori produk wajib diisi.';
  if (!p.subcategory) return 'Subkategori produk wajib diisi.';
  if (p.imageUrl && !/^https?:\/\//i.test(p.imageUrl)) return 'URL gambar harus menggunakan http atau https.';
  return null;
}

const select = 'id, name, slug, description, price, stock, image_url, is_active, category, subcategory, activities, created_at, updated_at';
const patchFields = new Set(['name', 'slug', 'description', 'price', 'stock', 'imageUrl', 'isActive', 'category', 'subcategory', 'activities']);

export async function GET() {
  const c = await getAdminContext();
  if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  const { data, error } = await c.admin.from('products').select(select).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Daftar produk gagal dimuat.' }, { status: 500 });
  return NextResponse.json({ products: data || [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  const c = await getAdminContext();
  if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  try {
    const body = await request.json();
    const p = cleanProduct(body);
    const v = validateProduct(p);
    if (v) return NextResponse.json({ error: v }, { status: 400 });
    const { data, error } = await c.admin.rpc('admin_create_product', {
      p_name: p.name, p_slug: p.slug, p_description: p.description || null, p_price: p.price, p_stock: p.stock,
      p_image_url: p.imageUrl || null, p_is_active: body?.isActive !== false, p_category: p.category, p_subcategory: p.subcategory,
    });
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Slug produk sudah digunakan.' }, { status: 409 });
      console.error('admin_create_product RPC failed:', error);
      return NextResponse.json({ error: 'Produk gagal dibuat.' }, { status: 500 });
    }
    const created = Array.isArray(data) ? data[0] : data;
    if (created?.id) {
      const { error: activityError } = await c.admin.from('products').update({ activities: p.activities }).eq('id', created.id);
      if (activityError) { console.error(activityError); return NextResponse.json({ error: 'Produk tersimpan, tetapi aktivitas gagal disimpan.' }, { status: 500 }); }
    }
    return NextResponse.json({ ok: true, product: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}

export async function PATCH(request) {
  const c = await getAdminContext();
  if (c.error) return NextResponse.json({ error: c.error }, { status: c.status });
  try {
    const body = await request.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'ID produk wajib diisi.' }, { status: 400 });
    const changes = Object.keys(body).filter((key) => key !== 'id');
    if (!changes.length) return NextResponse.json({ error: 'Tidak ada perubahan.' }, { status: 400 });
    if (changes.some((key) => !patchFields.has(key))) return NextResponse.json({ error: 'Field perubahan tidak valid.' }, { status: 400 });
    const { data: current, error: currentError } = await c.admin.from('products').select(select).eq('id', id).single();
    if (currentError || !current) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
    let merged = {
      name: current.name, slug: current.slug, description: current.description || '', imageUrl: current.image_url || '',
      price: Number(current.price), stock: Number(current.stock), isActive: current.is_active,
      category: current.category || 'Lainnya', subcategory: current.subcategory || 'Outdoor', activities: cleanActivities(current.activities),
    };
    if (body.name !== undefined || body.slug !== undefined || body.description !== undefined || body.price !== undefined || body.stock !== undefined || body.imageUrl !== undefined || body.category !== undefined || body.subcategory !== undefined || body.activities !== undefined) {
      const p = cleanProduct(body);
      merged = {
        ...merged,
        name: body.name !== undefined ? p.name : merged.name, slug: body.slug !== undefined ? p.slug : merged.slug,
        description: body.description !== undefined ? p.description : merged.description, imageUrl: body.imageUrl !== undefined ? p.imageUrl : merged.imageUrl,
        price: body.price !== undefined ? p.price : merged.price, stock: body.stock !== undefined ? p.stock : merged.stock,
        category: body.category !== undefined ? p.category : merged.category, subcategory: body.subcategory !== undefined ? p.subcategory : merged.subcategory,
        activities: body.activities !== undefined ? p.activities : merged.activities,
      };
      const v = validateProduct(merged);
      if (v) return NextResponse.json({ error: v }, { status: 400 });
    }
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') return NextResponse.json({ error: 'Status aktif tidak valid.' }, { status: 400 });
      merged.isActive = body.isActive;
    }
    const { data, error } = await c.admin.rpc('admin_update_product', {
      p_id: id, p_name: merged.name, p_slug: merged.slug, p_description: merged.description || null, p_price: merged.price,
      p_stock: merged.stock, p_image_url: merged.imageUrl || null, p_is_active: merged.isActive, p_category: merged.category, p_subcategory: merged.subcategory,
    });
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Slug produk sudah digunakan.' }, { status: 409 });
      if (error.code === 'P0002') return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
      console.error('admin_update_product RPC failed:', error);
      return NextResponse.json({ error: 'Produk gagal diperbarui.' }, { status: 500 });
    }
    const updated = Array.isArray(data) ? data[0] : data;
    const { error: activityError } = await c.admin.from('products').update({ activities: merged.activities }).eq('id', id);
    if (activityError) { console.error(activityError); return NextResponse.json({ error: 'Produk diperbarui, tetapi aktivitas gagal disimpan.' }, { status: 500 }); }
    const { data: finalProduct } = await c.admin.from('products').select(select).eq('id', id).single();
    return NextResponse.json({ ok: true, product: finalProduct || updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
