import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { CommitPageClient } from './client';
import type { Item } from '@/types/database';

export const metadata = {
  title: 'Commit',
};

export default async function CommitPage() {
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

  // Get items in commit layer with scheduled_at
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('layer', 'commit')
    .not('scheduled_at', 'is', null)
    .order('scheduled_at');

  return (
    <CommitPageClient
      initialItems={(items || []) as Item[]}
      userId={user.id}
    />
  );
}
