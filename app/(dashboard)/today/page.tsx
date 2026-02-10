import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TodayPageClient } from './client';
import type { Item, Destination } from '@/types/database';

export const metadata = {
  title: 'Today',
};

export default async function TodayPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Date boundaries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get inbox count (unprocessed items)
  const { count: inboxCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('layer', 'capture')
    .is('archived_at', null);

  // Get destinations to find backlog and waiting slugs
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  const backlogDest = (destinations || []).find((d: Destination) => d.slug === 'backlog');
  const waitingDest = (destinations || []).find((d: Destination) => d.slug === 'waiting');

  // Get backlog count
  const { count: backlogCount } = backlogDest
    ? await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('destination_id', backlogDest.id)
        .eq('is_completed', false)
        .is('archived_at', null)
    : { count: 0 };

  // Get waiting-for count
  const { count: waitingCount } = waitingDest
    ? await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('destination_id', waitingDest.id)
        .eq('is_completed', false)
        .is('archived_at', null)
    : { count: 0 };

  // Get overdue items (scheduled before today, not completed)
  const { data: overdueItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .not('scheduled_at', 'is', null)
    .lt('scheduled_at', today.toISOString())
    .is('archived_at', null)
    .order('scheduled_at', { ascending: true });

  // Get today's scheduled items
  const { data: todayItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .is('archived_at', null)
    .order('scheduled_at', { ascending: true });

  // Get starred/favorite items (items with is_favorite or flagged — using is_completed=false for active)
  // Note: items don't have is_favorite, but pages do. We'll use recent captures as "starred" for now.
  // TODO: Add is_starred to items schema if needed

  // Get completed today
  const { data: completedToday } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', today.toISOString())
    .lt('completed_at', tomorrow.toISOString())
    .order('completed_at', { ascending: false });

  // Fetch someday/incubating items for AI insights
  const somedayDest = (destinations || []).find((d: Destination) => d.slug === 'someday');
  const incubatingDest = (destinations || []).find((d: Destination) => d.slug === 'incubating');
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
      .order('created_at', { ascending: true })
      .limit(10);
    somedayItems = (data || []) as Item[];
  }

  // Fetch all active items for clustering insight
  const { data: allActiveItems } = await supabase
    .from('items')
    .select('*, destinations!inner(slug, name)')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  // Stale backlog items (older than 14 days, not scheduled)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const { data: staleItems } = backlogDest
    ? await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_id', backlogDest.id)
        .eq('is_completed', false)
        .is('scheduled_at', null)
        .is('archived_at', null)
        .lt('created_at', fourteenDaysAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(10)
    : { data: [] };

  const showOnboarding = profile?.onboarding_completed === false;

  return (
    <TodayPageClient
      profile={profile}
      showOnboarding={showOnboarding}
      counts={{
        inbox: inboxCount || 0,
        backlog: backlogCount || 0,
        waiting: waitingCount || 0,
      }}
      overdueItems={(overdueItems || []) as Item[]}
      todayItems={(todayItems || []) as Item[]}
      completedToday={(completedToday || []) as Item[]}
      somedayItems={(somedayItems || []) as Item[]}
      allActiveItems={(allActiveItems || []) as Item[]}
      staleItems={(staleItems || []) as Item[]}
    />
  );
}
