import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { CapturePageClient } from './client';
import type { Item, Destination, Space, Project } from '@/types/database';

export const metadata = {
  title: 'Capture',
};

export default async function CapturePage() {
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

  // Get items in capture layer
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('layer', 'capture')
    .order('created_at', { ascending: false });

  // Get destinations (excluding trash)
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .neq('slug', 'trash')
    .order('sort_order');

  // Get spaces
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get active projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('sort_order');

  return (
    <CapturePageClient
      initialItems={(items || []) as Item[]}
      destinations={(destinations || []) as Destination[]}
      spaces={(spaces || []) as Space[]}
      projects={(projects || []) as Project[]}
      userId={user.id}
    />
  );
}
