'use client';

import { createBrowserClient } from '@supabase/ssr';

// Singleton — one Supabase client per browser tab for stable real-time connections
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  client = createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
