import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WeeklyReviewClient } from './client';
import type { Item, Destination } from '@/types/database';

export const metadata = {
  title: 'Weekly Review',
};

export default async function ReviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile (for streak data in settings)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get all destinations
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  const allDestinations = (destinations || []) as Destination[];
  const backlogDest = allDestinations.find((d) => d.slug === 'backlog');
  const waitingDest = allDestinations.find((d) => d.slug === 'waiting');
  const somedayDest = allDestinations.find((d) => d.slug === 'someday');
  const incubatingDest = allDestinations.find((d) => d.slug === 'incubating');

  // 1. Inbox items (capture layer, unprocessed)
  const { data: inboxItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('layer', 'capture')
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  // 2. Backlog items (not completed)
  const { data: backlogItems } = backlogDest
    ? await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_id', backlogDest.id)
        .eq('is_completed', false)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
    : { data: [] };

  // 3. Someday / Incubating items
  const somedayIds = [somedayDest?.id, incubatingDest?.id].filter(Boolean) as string[];
  let somedayItems: Item[] = [];
  if (somedayIds.length > 0) {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .in('destination_id', somedayIds)
      .eq('is_completed', false)
      .is('archived_at', null)
      .order('created_at', { ascending: false });
    somedayItems = (data || []) as Item[];
  }

  // 4. Waiting For items
  const { data: waitingItems } = waitingDest
    ? await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_id', waitingDest.id)
        .eq('is_completed', false)
        .is('archived_at', null)
        .order('waiting_since', { ascending: true })
    : { data: [] };

  // 5. Scheduled items (next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: scheduledItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .not('scheduled_at', 'is', null)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', nextWeek.toISOString())
    .is('archived_at', null)
    .order('scheduled_at', { ascending: true });

  // 6. Overdue items
  const { data: overdueItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .not('scheduled_at', 'is', null)
    .lt('scheduled_at', now.toISOString())
    .is('archived_at', null)
    .order('scheduled_at', { ascending: true });

  // 7. Completed this week (for celebration stats)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const { count: completedThisWeek } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('completed_at', weekStart.toISOString());

  // 8. Unscheduled backlog items (for "schedule next week" step)
  const { data: unscheduledBacklog } = backlogDest
    ? await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_id', backlogDest.id)
        .eq('is_completed', false)
        .is('scheduled_at', null)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] };

  // Extract review streak from profile settings
  const settings = (profile?.settings || {}) as Record<string, any>;
  const reviewStreak = settings.review_streak || { count: 0, last_review: null };

  return (
    <WeeklyReviewClient
      userId={user.id}
      inboxItems={(inboxItems || []) as Item[]}
      backlogItems={(backlogItems || []) as Item[]}
      somedayItems={somedayItems}
      waitingItems={(waitingItems || []) as Item[]}
      scheduledItems={(scheduledItems || []) as Item[]}
      overdueItems={(overdueItems || []) as Item[]}
      unscheduledBacklog={(unscheduledBacklog || []) as Item[]}
      completedThisWeek={completedThisWeek || 0}
      reviewStreak={reviewStreak}
      destinations={allDestinations}
    />
  );
}
