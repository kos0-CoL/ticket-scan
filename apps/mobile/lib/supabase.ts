import { createBrowserClient } from '@supabase/ssr';

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // During static export build, env vars might not be available
  // Return a mock client that won't crash at build time
  if (!url || !key) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        eq: function() { return this; },
        single: function() { return this; },
        range: function() { return this; },
        order: function() { return this; },
        gte: function() { return this; },
        lte: function() { return this; },
      }),
    } as any;
  }

  return createBrowserClient(url, key);
}

// Alias para compatibilidad
export const createClient = createBrowserSupabaseClient;