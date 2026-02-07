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
  const { setCommandPaletteOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-5 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {mobileSidebar}
        {title && (
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Command palette trigger */}
        <Button
          variant="outline"
          className="hidden h-8 w-64 justify-between border-[var(--border-default)] text-sm text-[var(--text-muted)] hover:border-[var(--border-emphasis)] hover:text-[var(--text-secondary)] sm:flex"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search or command...</span>
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border-default)] bg-[var(--bg-hover)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-disabled)]">
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
