import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { ArchivePageClient } from './client';
import type { Item, Destination } from '@/types/database';

export const metadata = { title: 'Archive' };

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  await ensureProfile(supabase, user);

  // Get archived items (archived_at IS NOT NULL)
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });

  // Get destinations for display
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  return (
    <ArchivePageClient
      initialItems={(items || []) as Item[]}
      destinations={(destinations || []) as Destination[]}
      userId={user.id}
    />
  );
}
