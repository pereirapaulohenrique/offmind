import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { SchedulePageClient } from './client';
import type { Item } from '@/types/database';

export const metadata = {
  title: 'Schedule',
};

export default async function SchedulePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureProfile(supabase, user);

  // Get items with scheduled_at (not completed)
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .not('scheduled_at', 'is', null)
    .eq('is_completed', false)
    .is('archived_at', null)
    .order('scheduled_at');

  return (
    <SchedulePageClient
      initialItems={(items || []) as Item[]}
      userId={user.id}
    />
  );
}
