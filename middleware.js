import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminLoginPage = pathname === '/admin/login';
  const isLoginPage = pathname.startsWith('/login');
  const isMidtransWebhook = pathname === '/api/midtrans/notification';
  const isPublicStorefront =
    pathname === '/' ||
    pathname === '/produk' ||
    pathname.startsWith('/produk/');
  const isPublicAuthPage = isLoginPage || isAdminLoginPage;

  // Prevent the login page from accepting protocol-relative or external
  // redirect targets through the `next` query parameter.
  if (isLoginPage && request.nextUrl.searchParams.has('next')) {
    const next = request.nextUrl.searchParams.get('next') || '';
    if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
      const url = request.nextUrl.clone();
      url.searchParams.set('next', '/');
      return NextResponse.redirect(url);
    }
  }

  // Midtrans server notifications are machine-to-machine requests and do not
  // carry a Supabase browser session. They must reach the webhook directly.
  if (isMidtransWebhook) return response;

  // The storefront is public. Customer account/order pages and admin pages
  // remain protected below.
  if (isPublicStorefront) return response;

  // Support both the legacy Supabase anon-key names and the newer
  // Vercel/Supabase integration variable names.
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Never let missing Supabase configuration turn every request into a 500.
  // Both login entry points stay reachable so the deployment can be diagnosed.
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

  // Admin login is intentionally public. The login page itself checks the
  // authenticated user against admin_users before allowing dashboard access.
  if (isAdminLoginPage) return response;

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminRoute ? '/admin/login' : '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
