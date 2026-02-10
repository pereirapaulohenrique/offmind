'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Item, Destination, Space, Project } from '@/types/database';

interface GridViewProps {
  items: Item[];
  destinations: Destination[];
  spaces: Space[];
  projects: Project[];
}

export function GridView({ items, destinations, spaces, projects }: GridViewProps) {
  const router = useRouter();

  const groups = destinations
    .filter((dest) => dest.slug !== 'trash')
    .map((dest) => ({
      destination: dest,
      items: items.filter((item) => item.destination_id === dest.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const Icon = ICON_MAP[group.destination.icon] || ICON_MAP['folder'];
        const colorOption = COLOR_PALETTE.find((c) => c.value === group.destination.color);

        return (
          <div key={group.destination.id}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg',
                  colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
                )}
              >
                <Icon
                  className={cn('h-4 w-4', colorOption?.text || 'text-[var(--text-muted)]')}
                />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {group.destination.name}
              </h3>
              <span className="text-sm text-[var(--text-muted)]">
                ({group.items.length})
              </span>
            </div>

            {/* Card grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item, index) => {
                const space = spaces.find((s) => s.id === item.space_id);
                const project = projects.find((p) => p.id === item.project_id);

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => router.push(`/items/${item.id}`)}
                    className="text-left rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)] leading-snug line-clamp-2">
                      {item.title}
                    </p>

                    {item.notes && (
                      <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {(space || project) && (
                        <span className="inline-flex items-center rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                          {space?.name}
                          {space && project && ' · '}
                          {project?.name}
                        </span>
                      )}
                      {item.scheduled_at && (
                        <span className="inline-flex items-center rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                          📅 {formatDistanceToNow(new Date(item.scheduled_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      {groups.length === 0 && (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">
          No organized items yet. Process items from your Inbox to see them here.
        </div>
      )}
    </div>
  );
}
