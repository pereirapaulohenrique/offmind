import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ProjectDetailClient } from './client';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, spaces(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Fetch items in this project
  const { data: items } = await supabase
    .from('items')
    .select('*, destinations(*)')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch pages in this project
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Fetch all destinations for item movement
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  // Fetch all spaces for editing
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  return (
    <ProjectDetailClient
      project={project}
      items={items || []}
      pages={pages || []}
      destinations={destinations || []}
      spaces={spaces || []}
      userId={user.id}
    />
  );
}
