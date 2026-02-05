import { createClient } from '@/lib/supabase/server';
import { SettingsPageClient } from './client';

export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get destinations
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  return (
    <SettingsPageClient
      user={user}
      profile={profile}
      destinations={destinations || []}
    />
  );
}
