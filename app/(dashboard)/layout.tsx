import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { ContentArea } from '@/components/layout/ContentArea';
import { CaptureBar } from '@/components/layout/CaptureBar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { ProcessingPanel } from '@/components/processing/ProcessingPanel';
import { CelebrationProvider } from '@/components/shared/Celebrations';

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

  // Get spaces with nested projects
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, name, icon, color')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get projects with space_id
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, icon, color, space_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('sort_order');

  // Get pages with project_id and space_id
  const { data: pages } = await supabase
    .from('pages')
    .select('id, title, icon, project_id, space_id')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Get destinations for ProcessingPanel
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');

  // Get contacts for ProcessingPanel autocomplete
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  // Build tree: spaces → projects → pages
  const spacesTree = (spaces || []).map((space) => ({
    ...space,
    projects: (projects || [])
      .filter((p) => p.space_id === space.id)
      .map((project) => ({
        ...project,
        pages: (pages || []).filter((pg) => pg.project_id === project.id),
      })),
  }));

  const sidebarProps = {
    inboxCount: inboxCount || 0,
    spaces: spacesTree,
  };

  return (
    <CelebrationProvider>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar {...sidebarProps} />
        </div>

        {/* Main content area - sidebar-aware margins + capture bar padding */}
        <ContentArea>
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
            mobileSidebar={
              <MobileSidebar>
                <Sidebar {...sidebarProps} />
              </MobileSidebar>
            }
          />

          {/* Page content */}
          <main className="flex-1 overflow-hidden">{children}</main>
        </ContentArea>

        {/* Processing Panel (global) */}
        <ProcessingPanel
          destinations={(destinations || []) as any}
          spaces={(spaces || []) as any}
          projects={(projects || []) as any}
          contacts={(contacts || []) as any}
          userId={user.id}
        />

        {/* Persistent capture bar */}
        <CaptureBar userId={user.id} />

        {/* Command Palette (global) */}
        <CommandPalette />

        {/* AI Assistant (global) */}
        <AIAssistant />
      </div>
    </CelebrationProvider>
  );
}
