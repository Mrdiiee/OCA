import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const signal = options.signal || controller.signal;
          return fetch(url, { ...options, signal }).finally(() => clearTimeout(timer));
        },
      },
    }
  );
}
