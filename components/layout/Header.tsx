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
  const { setCommandPaletteOpen, pageTitle } = useUIStore();
  const displayTitle = title || pageTitle;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-6 bg-[var(--bg-base)]" style={{ borderBottom: '1px solid var(--border-default)' }}>
      <div className="flex items-center gap-4">
        {mobileSidebar}
        <h1
          className="text-base font-bold tracking-tight text-[var(--text-primary)] transition-opacity duration-200"
          style={{ opacity: displayTitle ? 1 : 0 }}
        >
          {displayTitle || '\u00A0'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Command palette trigger */}
        <Button
          variant="outline"
          className="hidden h-8 w-80 justify-between border-[var(--border-subtle)] text-sm text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)] shadow-[var(--shadow-xs)] sm:flex"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search or command...</span>
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-inset)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-disabled)]">
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
