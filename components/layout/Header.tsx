'use client';

import { Search } from 'lucide-react';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  title?: string;
  user?: {
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
  mobileSidebar?: React.ReactNode;
}

export function Header({ title, user, mobileSidebar }: HeaderProps) {
  const { setCommandPaletteOpen, sidebarCollapsed } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {mobileSidebar}
        {title && (
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Command palette trigger */}
        <Button
          variant="outline"
          className="hidden h-8 w-64 justify-between text-sm text-muted-foreground sm:flex"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <span>Search or command...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:hidden"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
