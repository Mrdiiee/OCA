import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

async function getAdminContext() {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) return { error: 'Silakan login terlebih dahulu.', status: 401 };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return { error: 'Konfigurasi server belum lengkap.', status: 500 };

  const admin = createSupabaseAdmin(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: adminUser, error: adminError } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError) {
    console.error('Admin lookup error:', adminError);
    return { error: 'Hak akses admin belum dikonfigurasi.', status: 500 };
  }
  if (!adminUser) return { error: 'Akses admin ditolak.', status: 403 };
  return { admin };
}

function cleanProduct(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const price = Number(body?.price);
  const stock = Number(body?.stock);
  return { name, slug, description, imageUrl, price, stock };
}

function validateProduct(product) {
  if (!product.name) return 'Nama produk wajib diisi.';
  if (!product.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) return 'Slug produk tidak valid.';
  if (!Number.isFinite(product.price) || product.price < 0) return 'Harga produk tidak valid.';
  if (!Number.isInteger(product.stock) || product.stock < 0) return 'Stok harus berupa bilangan bulat 0 atau lebih.';
  if (product.imageUrl && !/^https?:\/\//i.test(product.imageUrl)) return 'URL gambar harus menggunakan http atau https.';
  return null;
}

export async function GET() {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  const { data, error } = await context.admin
    .from('products')
    .select('id, name, slug, description, price, stock, image_url, is_active, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin products query error:', error);
    return NextResponse.json({ error: 'Daftar produk gagal dimuat.' }, { status: 500 });
  }

  return NextResponse.json({ products: data || [] });
}

export async function POST(request) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  try {
    const body = await request.json();
    const product = cleanProduct(body);
    const validationError = validateProduct(product);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const { data, error } = await context.admin
      .from('products')
      .insert({
        name: product.name,
        slug: product.slug,
        description: product.description || null,
        price: product.price,
        stock: product.stock,
        image_url: product.imageUrl || null,
        is_active: body?.isActive !== false,
        updated_at: new Date().toISOString(),
      })
      .select('id, name, slug, description, price, stock, image_url, is_active, created_at, updated_at')
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Slug produk sudah digunakan.' }, { status: 409 });
      console.error('Admin product insert error:', error);
      return NextResponse.json({ error: 'Produk gagal dibuat.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, product: data }, { status: 201 });
  } catch (error) {
    console.error('Admin product POST error:', error);
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}

export async function PATCH(request) {
  const context = await getAdminContext();
  if (context.error) return NextResponse.json({ error: context.error }, { status: context.status });

  try {
    const body = await request.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'ID produk wajib diisi.' }, { status: 400 });

    const update = {};
    if (body.name !== undefined || body.slug !== undefined || body.description !== undefined || body.price !== undefined || body.stock !== undefined || body.imageUrl !== undefined) {
      const product = cleanProduct(body);
      if (body.name !== undefined || body.slug !== undefined || body.price !== undefined || body.stock !== undefined) {
        const { data: current, error: currentError } = await context.admin
          .from('products')
          .select('name, slug, description, price, stock, image_url')
          .eq('id', id)
          .single();
        if (currentError || !current) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
        const merged = {
          name: body.name !== undefined ? product.name : current.name,
          slug: body.slug !== undefined ? product.slug : current.slug,
          description: body.description !== undefined ? product.description : (current.description || ''),
          imageUrl: body.imageUrl !== undefined ? product.imageUrl : (current.image_url || ''),
          price: body.price !== undefined ? product.price : Number(current.price),
          stock: body.stock !== undefined ? product.stock : Number(current.stock),
        };
        const validationError = validateProduct(merged);
        if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
        Object.assign(update, {
          name: merged.name,
          slug: merged.slug,
          description: merged.description || null,
          price: merged.price,
          stock: merged.stock,
          image_url: merged.imageUrl || null,
        });
      } else {
        if (body.description !== undefined) update.description = product.description || null;
        if (body.imageUrl !== undefined) {
          if (product.imageUrl && !/^https?:\/\//i.test(product.imageUrl)) return NextResponse.json({ error: 'URL gambar harus menggunakan http atau https.' }, { status: 400 });
          update.image_url = product.imageUrl || null;
        }
      }
    }
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') return NextResponse.json({ error: 'Status aktif tidak valid.' }, { status: 400 });
      update.is_active = body.isActive;
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: 'Tidak ada perubahan.' }, { status: 400 });
    update.updated_at = new Date().toISOString();

    const { data, error } = await context.admin
      .from('products')
      .update(update)
      .eq('id', id)
      .select('id, name, slug, description, price, stock, image_url, is_active, created_at, updated_at')
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Slug produk sudah digunakan.' }, { status: 409 });
      console.error('Admin product update error:', error);
      return NextResponse.json({ error: 'Produk gagal diperbarui.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, product: data });
  } catch (error) {
    console.error('Admin product PATCH error:', error);
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
