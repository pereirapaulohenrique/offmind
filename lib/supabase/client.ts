'use client';

import { createBrowserClient } from '@supabase/ssr';

// Note: We're not using strict Database typing here due to compatibility issues
// with @supabase/ssr. Type safety is maintained through explicit casting in components.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
