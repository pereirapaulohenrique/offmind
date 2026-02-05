import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Ensures a profile exists for the given user.
 * For users who signed up before the auth trigger was in place,
 * this will create their profile and trigger the default destinations/subscription.
 */
export async function ensureProfile(supabase: SupabaseClient, user: User) {
  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Create profile for existing user
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    } as any);

    // The database triggers will automatically create destinations and subscription
  }
}
