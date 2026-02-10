'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Item, Destination, Space, Project } from '@/types/database';

interface ListViewProps {
  items: Item[];
  destinations: Destination[];
  spaces: Space[];
  projects: Project[];
}

export function ListView({ items, destinations, spaces, projects }: ListViewProps) {
  const router = useRouter();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (destId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(destId)) {
        next.delete(destId);
      } else {
        next.add(destId);
      }
      return next;
    });
  };

  const groups = destinations.filter((dest) => dest.slug !== 'trash').map((dest) => ({
    destination: dest,
    items: items.filter((item) => item.destination_id === dest.id),
  }));

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const Icon = ICON_MAP[group.destination.icon] || ICON_MAP['folder'];
        const colorOption = COLOR_PALETTE.find((c) => c.value === group.destination.color);
        const isCollapsed = collapsedGroups.has(group.destination.id);

        return (
          <div
            key={group.destination.id}
            className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] overflow-hidden"
          >
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.destination.id)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg-hover)] transition-colors duration-150"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              )}
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-lg',
                  colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
                )}
              >
                <Icon
                  className={cn('h-3.5 w-3.5', colorOption?.text || 'text-[var(--text-muted)]')}
                />
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)] flex-1 text-left">
                {group.destination.name}
              </span>
              <span className="text-xs text-[var(--text-muted)] tabular-nums">
                {group.items.length}
              </span>
            </button>

            {/* Group items */}
            <AnimatePresence>
              {!isCollapsed && group.items.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[var(--border-subtle)]">
                    {group.items.map((item) => {
                      const space = spaces.find((s) => s.id === item.space_id);
                      const project = projects.find((p) => p.id === item.project_id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => router.push(`/items/${item.id}`)}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors duration-150 text-left border-b border-[var(--border-subtle)] last:border-b-0"
                        >
                          <div className="h-2 w-2 rounded-full bg-[var(--text-disabled)] flex-shrink-0" />
                          <span className="text-sm text-[var(--text-primary)] flex-1 truncate">
                            {item.title}
                          </span>
                          {(space || project) && (
                            <span className="text-xs text-[var(--text-disabled)] truncate max-w-[120px]">
                              {space?.name}
                              {space && project && ' · '}
                              {project?.name}
                            </span>
                          )}
                          {item.scheduled_at && (
                            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                              {formatDistanceToNow(new Date(item.scheduled_at), { addSuffix: true })}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isCollapsed && group.items.length === 0 && (
              <div className="border-t border-[var(--border-subtle)] px-5 py-4 text-xs text-[var(--text-disabled)] text-center">
                No items
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
