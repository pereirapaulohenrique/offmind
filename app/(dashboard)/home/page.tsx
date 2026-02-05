import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HomePageClient } from './client';

export default async function HomePage() {
  const supabase = await createClient();

  // Get current user
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

  // Get inbox count (items in capture layer)
  const { count: inboxCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('layer', 'capture');

  // Get processing count (items in process layer)
  const { count: processingCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('layer', 'process');

  // Get today's commitments (items scheduled for today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todayItems, count: todayCount } = await supabase
    .from('items')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('layer', 'commit')
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .eq('is_completed', false)
    .order('scheduled_at', { ascending: true })
    .limit(5);

  // Get completed today
  const { count: completedTodayCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('completed_at', today.toISOString())
    .lt('completed_at', tomorrow.toISOString());

  // Get total items
  const { count: totalItems } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get total completed
  const { count: totalCompleted } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_completed', true);

  // Get recent items (last 5 captured)
  const { data: recentItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get spaces count
  const { count: spacesCount } = await supabase
    .from('spaces')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get projects count
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  return (
    <HomePageClient
      profile={profile}
      stats={{
        inboxCount: inboxCount || 0,
        processingCount: processingCount || 0,
        todayCount: todayCount || 0,
        completedTodayCount: completedTodayCount || 0,
        totalItems: totalItems || 0,
        totalCompleted: totalCompleted || 0,
        spacesCount: spacesCount || 0,
        projectsCount: projectsCount || 0,
      }}
      todayItems={todayItems || []}
      recentItems={recentItems || []}
    />
  );
}
