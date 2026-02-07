import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { OrganizePageClient } from './client';
import type { Item, Destination, Space, Project } from '@/types/database';

export const metadata = {
  title: 'Organize',
};

export default async function OrganizePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureProfile(supabase, user);

  // Get ALL processed items (assigned to a destination, not completed)
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .not('destination_id', 'is', null)
    .eq('is_completed', false)
    .order('sort_order');

  // Get all destinations
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get spaces for display
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get projects for display
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('sort_order');

  return (
    <OrganizePageClient
      initialItems={(items || []) as Item[]}
      destinations={(destinations || []) as Destination[]}
      spaces={(spaces || []) as Space[]}
      projects={(projects || []) as Project[]}
      userId={user.id}
    />
  );
}
