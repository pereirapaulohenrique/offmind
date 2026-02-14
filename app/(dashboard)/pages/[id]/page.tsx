import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PageEditorClient } from './client';
import type { Page, Space, Project, Item } from '@/types/database';

interface PageEditorProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageEditorProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from('pages')
    .select('title')
    .eq('id', id)
    .single();

  return {
    title: page?.title || 'Page',
  };
}

export default async function PageEditorPage({ params }: PageEditorProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get page
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!page) {
    notFound();
  }

  // Get spaces for assignment
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get projects for assignment
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get linked item if any
  let linkedItem: Item | null = null;
  if (page.item_id) {
    const { data: item } = await supabase
      .from('items')
      .select('*')
      .eq('id', page.item_id)
      .single();
    linkedItem = item as Item | null;
  }

  // Get items captured directly to this page
  const { data: capturedItems } = await supabase
    .from('items')
    .select('*')
    .eq('page_id', id)
    .eq('user_id', user.id)
    .eq('layer', 'capture')
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  return (
    <PageEditorClient
      page={page as Page}
      spaces={(spaces || []) as Space[]}
      projects={(projects || []) as Project[]}
      linkedItem={linkedItem}
      capturedItems={(capturedItems || []) as Item[]}
    />
  );
}
