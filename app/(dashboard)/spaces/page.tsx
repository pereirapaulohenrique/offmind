import { createClient } from '@/lib/supabase/server';
import { SpacesPageClient } from './client';
import type { Space, Project } from '@/types/database';

export const metadata = {
  title: 'Spaces',
};

export default async function SpacesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get spaces
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get projects grouped by space
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('sort_order');

  // Group projects by space_id
  const projectsBySpace = (projects || []).reduce(
    (acc, project) => {
      if (project.space_id) {
        if (!acc[project.space_id]) acc[project.space_id] = [];
        acc[project.space_id].push(project);
      }
      return acc;
    },
    {} as Record<string, Project[]>
  );

  return (
    <SpacesPageClient
      initialSpaces={(spaces || []) as Space[]}
      projectsBySpace={projectsBySpace}
      userId={user.id}
    />
  );
}
