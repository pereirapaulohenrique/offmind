'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore, type AppMode } from '@/stores/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  ArrowRightLeft,
  Calendar,
  BookOpen,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { OffMindLogo } from '@/components/brand/OffMindLogo';
import { UserMenu } from './UserMenu';
import { COLOR_PALETTE } from '@/components/icons';

// 4-mode navigation
const modeNav: { mode: AppMode; href: string; label: string; icon: LucideIcon; shortcut: string }[] = [
  { mode: 'surface', href: '/home', label: 'Surface', icon: Home, shortcut: '1' },
  { mode: 'process', href: '/process', label: 'Process', icon: ArrowRightLeft, shortcut: '2' },
  { mode: 'calendar', href: '/commit', label: 'Calendar', icon: Calendar, shortcut: '3' },
  { mode: 'library', href: '/spaces', label: 'Library', icon: BookOpen, shortcut: '4' },
];

interface SidebarProps {
  inboxCount?: number;
  spaces?: { id: string; name: string; icon: string; color: string }[];
  user?: {
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function Sidebar({ inboxCount = 0, spaces = [], user }: SidebarProps) {
  const pathname = usePathname();
  const { activeMode, setActiveMode } = useUIStore();

  // Sync active mode from URL
  useEffect(() => {
    if (pathname.startsWith('/home')) setActiveMode('surface');
    else if (pathname.startsWith('/process') || pathname.startsWith('/capture')) setActiveMode('process');
    else if (pathname.startsWith('/commit')) setActiveMode('calendar');
    else if (pathname.startsWith('/spaces') || pathname.startsWith('/projects') || pathname.startsWith('/pages')) setActiveMode('library');
  }, [pathname, setActiveMode]);

  // Keyboard shortcuts for mode switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const nav = modeNav.find(n => n.shortcut === e.key);
        if (nav) {
          e.preventDefault();
          window.location.href = nav.href;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center border-r border-sidebar-border bg-sidebar py-3">
        {/* Logo */}
        <Link href="/home" className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-sidebar-accent">
          <OffMindLogo size={24} />
        </Link>

        {/* Mode navigation */}
        <nav className="flex flex-col items-center gap-1">
          {modeNav.map((item) => {
            const isActive = activeMode === item.mode;
            return (
              <Tooltip key={item.mode}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] h-5 w-[3px] rounded-r-full bg-primary" />
                    )}
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />

                    {/* Inbox badge for process mode */}
                    {item.mode === 'process' && inboxCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                        {inboxCount > 9 ? '9+' : inboxCount}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  <span>{item.label}</span>
                  <kbd className="rounded border border-border/60 bg-muted/50 px-1 text-[10px] text-muted-foreground">
                    ⌘{item.shortcut}
                  </kbd>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="my-3 h-px w-6 bg-sidebar-border" />

        {/* Space dots */}
        <div className="flex flex-col items-center gap-2">
          {spaces.slice(0, 5).map((space) => {
            const colorOption = COLOR_PALETTE.find(c => c.value === space.color);
            const isActive = pathname === `/spaces/${space.id}`;
            return (
              <Tooltip key={space.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/spaces/${space.id}`}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150',
                      isActive ? 'ring-1 ring-primary/40' : 'hover:bg-sidebar-accent'
                    )}
                  >
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        colorOption?.bg || 'bg-muted-foreground'
                      )}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {space.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Settings + User */}
        <div className="flex flex-col items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                  pathname.startsWith('/settings')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Settings</span>
              <kbd className="ml-2 rounded border border-border/60 bg-muted/50 px-1 text-[10px] text-muted-foreground">⌘,</kbd>
            </TooltipContent>
          </Tooltip>

          {/* User avatar */}
          <div className="mt-1">
            <UserMenu user={user} compact />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
