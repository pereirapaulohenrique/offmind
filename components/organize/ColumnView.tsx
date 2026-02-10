'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Item, Destination, Space, Project } from '@/types/database';

interface ColumnViewProps {
  items: Item[];
  destinations: Destination[];
  spaces: Space[];
  projects: Project[];
}

export function ColumnView({ items, destinations, spaces, projects }: ColumnViewProps) {
  const router = useRouter();

  // Group items by destination
  const columns = destinations.filter((dest) => dest.slug !== 'trash').map((dest) => ({
    destination: dest,
    items: items.filter((item) => item.destination_id === dest.id),
  }));

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 pb-4">
      {columns.map((column) => {
        const Icon = ICON_MAP[column.destination.icon] || ICON_MAP['folder'];
        const colorOption = COLOR_PALETTE.find((c) => c.value === column.destination.color);

        return (
          <div
            key={column.destination.id}
            className="flex flex-col rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] max-h-[45vh]"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
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
              <span className="text-sm font-medium text-[var(--text-primary)] flex-1 truncate">
                {column.destination.name}
              </span>
              <span className="text-xs text-[var(--text-muted)] tabular-nums">
                {column.items.length}
              </span>
            </div>

            {/* Column items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {column.items.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-[var(--text-disabled)]">
                  No items
                </div>
              ) : (
                column.items.map((item, index) => {
                  const space = spaces.find((s) => s.id === item.space_id);
                  const project = projects.find((p) => p.id === item.project_id);

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => router.push(`/items/${item.id}`)}
                      className="w-full text-left rounded-xl p-3 hover:bg-[var(--bg-hover)] transition-colors duration-150 group"
                    >
                      <p className="text-sm text-[var(--text-primary)] leading-snug">
                        {item.title}
                      </p>
                      {(space || project) && (
                        <p className="mt-1 text-xs text-[var(--text-disabled)] truncate">
                          {space?.name}
                          {space && project && ' · '}
                          {project?.name}
                        </p>
                      )}
                      {item.scheduled_at && (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          📅 {formatDistanceToNow(new Date(item.scheduled_at), { addSuffix: true })}
                        </p>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
