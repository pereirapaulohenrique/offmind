import { createClient } from '@/lib/supabase/server';
import { ProjectsPageClient } from './client';
import type { Space, Project } from '@/types/database';

export const metadata = {
  title: 'Projects',
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get projects (active only)
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('sort_order');

  // Get spaces
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  return (
    <ProjectsPageClient
      initialProjects={(projects || []) as Project[]}
      spaces={(spaces || []) as Space[]}
      userId={user.id}
    />
  );
}
