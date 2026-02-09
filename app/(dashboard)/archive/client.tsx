'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { restoreItem } from '@/lib/utils/soft-delete';
import { toast } from 'sonner';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Item, Destination } from '@/types/database';

interface ArchivePageClientProps {
  initialItems: Item[];
  destinations: Destination[];
  userId: string;
}

export function ArchivePageClient({ initialItems, destinations, userId }: ArchivePageClientProps) {
  const [items, setItems] = useState<Item[]>(initialItems);

  const getDestinationName = (destinationId: string | null): string | null => {
    if (!destinationId) return null;
    const dest = destinations.find((d) => d.id === destinationId);
    return dest?.name || null;
  };

  const handleRestore = async (id: string) => {
    const result = await restoreItem(id);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Item restored to inbox');
    } else {
      toast.error('Failed to restore item');
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('items').delete().eq('id', id);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Item permanently deleted');
    } else {
      toast.error('Failed to delete item');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="px-6 py-5 sm:px-8" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Archive
            </h1>
            {items.length > 0 && (
              <span className="rounded-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="hidden text-sm text-[var(--text-muted)] sm:block">
            Archived items. Restore or permanently delete.
          </p>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-6">
        {items.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No archived items"
            description="Items you archive will appear here."
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-2">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const destName = getDestinationName(item.destination_id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15, delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] p-4">
                      <div className="flex items-center gap-4">
                        {/* Left side: item info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {item.title}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                              {item.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {destName && (
                              <span className="text-xs text-[var(--text-muted)]">
                                {destName}
                              </span>
                            )}
                            {destName && item.archived_at && (
                              <span className="text-xs text-[var(--text-disabled)]">&middot;</span>
                            )}
                            {item.archived_at && (
                              <span className="text-xs text-[var(--text-disabled)]">
                                Archived {formatDistanceToNow(new Date(item.archived_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right side: actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestore(item.id)}
                            className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            title="Restore to inbox"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-red-500"
                            title="Permanently delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
