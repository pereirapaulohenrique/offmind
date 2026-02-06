import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { CaptureBar } from '@/components/layout/CaptureBar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { AIAssistant } from '@/components/ai/AIAssistant';
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

  // Get spaces
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, name, icon, color')
    .eq('user_id', user.id)
    .order('sort_order');

  const sidebarProps = {
    inboxCount: inboxCount || 0,
    spaces: spaces || [],
    user: profile
      ? {
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        }
      : { email: user.email || '' },
  };

  return (
    <CelebrationProvider>
      <div className="flex min-h-screen bg-background">
        {/* Icon-only sidebar */}
        <div className="hidden md:block">
          <Sidebar {...sidebarProps} />
        </div>

        {/* Main content area — offset by sidebar width */}
        <div className="flex flex-1 flex-col md:pl-14">
          {/* Page content — bottom padding for capture bar */}
          <main className="flex-1 overflow-auto pb-20">{children}</main>
        </div>

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
