import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ItemDetailClient } from './client';
import type { Item, Subtask, Page, Destination, Space, Project, Contact } from '@/types/database';

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from('items').select('title').eq('id', id).single();
  return { title: item?.title || 'Item' };
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch item
  const { data: item } = await supabase.from('items').select('*').eq('id', id).eq('user_id', user.id).single();
  if (!item) notFound();

  // Fetch subtasks
  const { data: subtasks } = await supabase.from('subtasks').select('*').eq('item_id', id).order('sort_order');

  // Fetch linked page (if any)
  const { data: linkedPage } = await supabase.from('pages').select('*').eq('item_id', id).maybeSingle();

  // Fetch destinations, spaces, projects, contacts
  const { data: destinations } = await supabase.from('destinations').select('*').eq('user_id', user.id).order('sort_order');
  const { data: spaces } = await supabase.from('spaces').select('*').eq('user_id', user.id).order('sort_order');
  const { data: projects } = await supabase.from('projects').select('*').eq('user_id', user.id).eq('status', 'active').order('sort_order');
  const { data: contacts } = await supabase.from('contacts').select('*').eq('user_id', user.id).order('name');

  return (
    <ItemDetailClient
      item={item as Item}
      initialSubtasks={(subtasks || []) as Subtask[]}
      linkedPage={linkedPage as Page | null}
      destinations={(destinations || []) as Destination[]}
      spaces={(spaces || []) as Space[]}
      projects={(projects || []) as Project[]}
      contacts={(contacts || []) as Contact[]}
      userId={user.id}
    />
  );
}
