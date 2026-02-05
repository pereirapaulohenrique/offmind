import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { SpaceDetailClient } from './client';

interface SpaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch the space
  const { data: space, error: spaceError } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (spaceError || !space) {
    notFound();
  }

  // Fetch items in this space
  const { data: items } = await supabase
    .from('items')
    .select('*, destinations(*)')
    .eq('space_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch projects in this space
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('space_id', id)
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  // Fetch pages in this space
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('space_id', id)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Fetch all destinations for item movement
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  return (
    <SpaceDetailClient
      space={space}
      items={items || []}
      projects={projects || []}
      pages={pages || []}
      destinations={destinations || []}
      userId={user.id}
    />
  );
}
