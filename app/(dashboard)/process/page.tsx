import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { ProcessPageClient } from './client';
import type { Item, Destination } from '@/types/database';

export const metadata = {
  title: 'Process',
};

export default async function ProcessPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Ensure profile exists (for users who signed up before triggers were in place)
  await ensureProfile(supabase, user);

  // Get items in process layer
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('layer', 'process')
    .order('sort_order');

  // Get destinations (excluding trash for now)
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .neq('slug', 'trash')
    .order('sort_order');

  return (
    <ProcessPageClient
      initialItems={(items || []) as Item[]}
      destinations={(destinations || []) as Destination[]}
      userId={user.id}
    />
  );
}
