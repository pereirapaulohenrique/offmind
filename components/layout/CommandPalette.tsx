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
  { label: 'Go to Today', href: '/today', Icon: Home, shortcut: '⌘0' },
  { label: 'Go to Inbox', href: '/inbox', Icon: Inbox, shortcut: '⌘1' },
  { label: 'Go to Organize', href: '/organize', Icon: ArrowRightLeft, shortcut: '⌘2' },
  { label: 'Go to Schedule', href: '/schedule', Icon: CalendarCheck, shortcut: '⌘3' },
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
            router.push('/today');
            setCommandPaletteOpen(false);
            break;
          case '1':
            e.preventDefault();
            router.push('/inbox');
            setCommandPaletteOpen(false);
            break;
          case '2':
            e.preventDefault();
            router.push('/organize');
            setCommandPaletteOpen(false);
            break;
          case '3':
            e.preventDefault();
            router.push('/schedule');
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
              router.push('/inbox');
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
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--bg-hover)]">
                  <item.Icon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <kbd className="text-[10px] font-mono text-[var(--text-disabled)] bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">{item.shortcut}</kbd>
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
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--bg-hover)]">
                  <item.Icon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <kbd className="text-[10px] font-mono text-[var(--text-disabled)] bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">{item.shortcut}</kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
