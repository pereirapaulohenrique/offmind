'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

const navigationItems = [
  { label: 'Go to Capture', href: '/capture', icon: '📥', shortcut: '⌘1' },
  { label: 'Go to Process', href: '/process', icon: '🔄', shortcut: '⌘2' },
  { label: 'Go to Commit', href: '/commit', icon: '📅', shortcut: '⌘3' },
];

const actionItems = [
  { label: 'New Item', action: 'new-item', icon: '➕', shortcut: '⌘N' },
  { label: 'New Page', action: 'new-page', icon: '📄', shortcut: '⌘⇧N' },
  { label: 'Settings', href: '/settings', icon: '⚙️', shortcut: '⌘,' },
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
    (item: { href?: string; action?: string }) => {
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
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-xs text-muted-foreground">{item.shortcut}</span>
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
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-xs text-muted-foreground">{item.shortcut}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
