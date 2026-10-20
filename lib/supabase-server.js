import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const SERVER_FETCH_TIMEOUT = 8000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_FETCH_TIMEOUT);
  const signal = options.signal || controller.signal;
  return fetch(url, { ...options, signal }).finally(() => clearTimeout(timer));
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { fetch: fetchWithTimeout },
    cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Cookie writes can fail in Server Components; API routes can still read the session.
          }
        },
      },
    }
  );
}
