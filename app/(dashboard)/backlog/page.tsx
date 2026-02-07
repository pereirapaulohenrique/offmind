import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { BacklogPageClient } from './client';
import type { Item, Destination, Space, Project } from '@/types/database';

export const metadata = {
  title: 'Backlog',
};

export default async function BacklogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureProfile(supabase, user);

  // Get backlog destination
  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .eq('slug', 'backlog')
    .single();

  const backlogDest = destination as Destination | null;

  // Get backlog items
  const { data: items } = backlogDest
    ? await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_id', backlogDest.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
    : { data: [] };

  // Get spaces and projects for filtering
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('sort_order');

  return (
    <BacklogPageClient
      initialItems={(items || []) as Item[]}
      spaces={(spaces || []) as Space[]}
      projects={(projects || []) as Project[]}
      userId={user.id}
    />
  );
}
