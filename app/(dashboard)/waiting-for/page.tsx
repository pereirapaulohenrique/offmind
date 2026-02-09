import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { WaitingForPageClient } from './client';
import type { Item, Destination } from '@/types/database';

export const metadata = {
  title: 'Waiting For',
};

export default async function WaitingForPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureProfile(supabase, user);

  // Get waiting destination
  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .eq('slug', 'waiting')
    .single();

  const waitingDest = destination as Destination | null;

  // Get waiting-for items
  const { data: items } = waitingDest
    ? await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_id', waitingDest.id)
        .eq('is_completed', false)
        .is('archived_at', null)
        .order('waiting_since', { ascending: true })
    : { data: [] };

  return (
    <WaitingForPageClient
      initialItems={(items || []) as Item[]}
      userId={user.id}
    />
  );
}
