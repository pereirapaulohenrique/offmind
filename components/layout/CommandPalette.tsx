'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui';
import {
  Home,
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  Plus,
  FileText,
  Settings,
  LucideIcon,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

interface NavItem {
  label: string;
  href?: string;
  action?: string;
  Icon: LucideIcon;
  shortcut: string;
}

const navigationItems: NavItem[] = [
  { label: 'Go to Home', href: '/home', Icon: Home, shortcut: '⌘0' },
  { label: 'Go to Capture', href: '/capture', Icon: Inbox, shortcut: '⌘1' },
  { label: 'Go to Process', href: '/process', Icon: ArrowRightLeft, shortcut: '⌘2' },
  { label: 'Go to Commit', href: '/commit', Icon: CalendarCheck, shortcut: '⌘3' },
];

const actionItems: NavItem[] = [
  { label: 'New Item', action: 'new-item', Icon: Plus, shortcut: '⌘N' },
  { label: 'New Page', action: 'new-page', Icon: FileText, shortcut: '⌘⇧N' },
  { label: 'Settings', href: '/settings', Icon: Settings, shortcut: '⌘,' },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, setEditingItemId } = useUIStore();

  // Handle keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Handle navigation shortcuts
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            router.push('/home');
            setCommandPaletteOpen(false);
            break;
          case '1':
            e.preventDefault();
            router.push('/capture');
            setCommandPaletteOpen(false);
            break;
          case '2':
            e.preventDefault();
            router.push('/process');
            setCommandPaletteOpen(false);
            break;
          case '3':
            e.preventDefault();
            router.push('/commit');
            setCommandPaletteOpen(false);
            break;
          case ',':
            e.preventDefault();
            router.push('/settings');
            setCommandPaletteOpen(false);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [router, setCommandPaletteOpen]);

  const handleSelect = useCallback(
    (item: NavItem) => {
      if (item.href) {
        router.push(item.href);
      }
      if (item.action) {
        switch (item.action) {
          case 'new-item':
            // Focus the quick capture input
            const captureInput = document.querySelector('[data-quick-capture]') as HTMLTextAreaElement;
            if (captureInput) {
              captureInput.focus();
            } else {
              router.push('/capture');
            }
            break;
          case 'new-page':
            router.push('/pages/new');
            break;
        }
      }
      setCommandPaletteOpen(false);
    },
    [router, setCommandPaletteOpen]
  );

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Search or type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          {actionItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => handleSelect(item)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <item.Icon className="h-4 w-4 text-[var(--text-muted)]" />
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-xs text-[var(--text-muted)]">{item.shortcut}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => handleSelect(item)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <item.Icon className="h-4 w-4 text-[var(--text-muted)]" />
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-xs text-[var(--text-muted)]">{item.shortcut}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
