import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/ensure-profile';
import { PagesListClient } from './client';
import type { Page, Space, Project } from '@/types/database';

export const metadata = {
  title: 'Pages',
};

export default async function PagesListPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureProfile(supabase, user);

  // Get pages
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Get spaces for filtering
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get projects for filtering
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  return (
    <PagesListClient
      initialPages={(pages || []) as Page[]}
      spaces={(spaces || []) as Space[]}
      projects={(projects || []) as Project[]}
      userId={user.id}
    />
  );
}
