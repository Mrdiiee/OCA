import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminLoginPage = pathname === '/admin/login';
  const isLoginPage = pathname === '/login';
  const isMidtransWebhook = pathname === '/api/midtrans/notification';
  const isPublicProductsApi = pathname === '/api/products';
  const isEventRoute = pathname === '/event' || pathname.startsWith('/event/');
  const isPublicStorefront =
    pathname === '/' ||
    pathname === '/produk' ||
    pathname.startsWith('/produk/') ||
    pathname === '/private-trip' ||
    pathname.startsWith('/private-trip/') ||
    pathname === '/tentang' ||
    pathname.startsWith('/tentang/') ||
    pathname === '/kontak' ||
    pathname.startsWith('/kontak/') ||
    pathname === '/status-pengiriman' ||
    pathname.startsWith('/status-pengiriman/') ||
    pathname === '/event' ||
    pathname.startsWith('/event/');
  const isPublicAuthPage = isLoginPage || isAdminLoginPage;

  if (isLoginPage && request.nextUrl.searchParams.has('next')) {
    const next = request.nextUrl.searchParams.get('next') || '';
    if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
      const url = request.nextUrl.clone();
      url.searchParams.set('next', '/');
      return NextResponse.redirect(url);
    }
  }

  if (isMidtransWebhook || isPublicProductsApi || isPublicStorefront) return response;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (!isPublicAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = isAdminRoute ? '/admin/login' : '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminLoginPage) return response;

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminRoute ? '/admin/login' : '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get('next') || '/';
    if (next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')) {
      url.pathname = next.split('?')[0] || '/';
      url.search = next.includes('?') ? `?${next.split('?').slice(1).join('?')}` : '';
    } else {
      url.pathname = '/';
      url.search = '';
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};