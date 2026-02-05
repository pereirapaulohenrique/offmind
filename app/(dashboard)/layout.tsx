import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { AIAssistant } from '@/components/ai/AIAssistant';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get inbox count (items in capture layer)
  const { count: inboxCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('layer', 'capture');

  // Get spaces
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, name, icon, color')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, icon, color')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('sort_order');

  // Get recent pages
  const { data: pages } = await supabase
    .from('pages')
    .select('id, title, icon')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        inboxCount={inboxCount || 0}
        spaces={spaces || []}
        projects={projects || []}
        pages={pages || []}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col pl-[240px] transition-all duration-200 data-[collapsed=true]:pl-16">
        {/* Header */}
        <Header
          user={
            profile
              ? {
                  email: profile.email,
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                }
              : { email: user.email || '' }
          }
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Command Palette (global) */}
      <CommandPalette />

      {/* AI Assistant (global) */}
      <AIAssistant />
    </div>
  );
}
