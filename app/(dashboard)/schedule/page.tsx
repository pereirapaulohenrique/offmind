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

  // Get backlog destination for unscheduled items
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  const backlogDest = (destinations || []).find((d: any) => d.slug === 'backlog');

  // Get unscheduled backlog items (no scheduled_at, not completed)
  const { data: unscheduledItems } = backlogDest
    ? await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_id', backlogDest.id)
        .eq('is_completed', false)
        .is('scheduled_at', null)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(30)
    : { data: [] };

  return (
    <SchedulePageClient
      initialItems={(items || []) as Item[]}
      unscheduledItems={(unscheduledItems || []) as Item[]}
      userId={user.id}
    />
  );
}
