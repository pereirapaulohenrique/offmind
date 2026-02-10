'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Item } from '@/types/database';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WaitingForPageClientProps {
  initialItems: Item[];
  userId: string;
}

interface GroupedItems {
  contact: string;
  items: Item[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WaitingForPageClient({
  initialItems,
  userId,
}: WaitingForPageClientProps) {
  const getSupabase = () => createClient();
  const router = useRouter();
  const openProcessingPanel = useUIStore((s) => s.openProcessingPanel);

  // ── Local state ──────────────────────────────────────────────────────────

  const [items, setItems] = useState<Item[]>(initialItems);

  // Sync when server data changes (e.g. navigation)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // ── Real-time subscription ───────────────────────────────────────────────

  useEffect(() => {
    const supabase = getSupabase();

    const channel = supabase
      .channel('waiting-for-items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item;
            if (!newItem.is_completed && newItem.destination_id && !newItem.archived_at) {
              setItems((prev) => {
                if (prev.some((i) => i.id === newItem.id)) return prev;
                return [newItem, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Item;
            if (updated.archived_at || updated.is_completed) {
              setItems((prev) => prev.filter((i) => i.id !== updated.id));
            } else {
              setItems((prev) =>
                prev.map((i) => (i.id === updated.id ? updated : i)),
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) =>
              prev.filter((i) => i.id !== (payload.old as { id: string }).id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ── Grouped data ─────────────────────────────────────────────────────────

  const { groups, ungroupedItems, totalCount } = useMemo(() => {
    const contactMap = new Map<string, Item[]>();
    const ungrouped: Item[] = [];

    for (const item of items) {
      const contact = item.waiting_for?.trim();
      if (contact) {
        const existing = contactMap.get(contact) || [];
        existing.push(item);
        contactMap.set(contact, existing);
      } else {
        ungrouped.push(item);
      }
    }

    // Sort groups alphabetically by contact name
    const sorted: GroupedItems[] = Array.from(contactMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([contact, contactItems]) => ({
        contact,
        // Sort items within group by waiting_since (oldest first)
        items: contactItems.sort((a, b) => {
          const aDate = a.waiting_since ? new Date(a.waiting_since).getTime() : new Date(a.created_at).getTime();
          const bDate = b.waiting_since ? new Date(b.waiting_since).getTime() : new Date(b.created_at).getTime();
          return aDate - bDate;
        }),
      }));

    return {
      groups: sorted,
      ungroupedItems: ungrouped,
      totalCount: items.length,
    };
  }, [items]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleFollowUp = useCallback(async (item: Item) => {
    const contactName = item.waiting_for || 'contact';
    toast.success(`Follow-up reminder noted for "${item.title}"`, {
      description: `Remember to check in with ${contactName}.`,
    });
  }, []);

  const handleComplete = useCallback(async (itemId: string) => {
    const supabase = getSupabase();
    try {
      const { error } = await supabase
        .from('items')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        } as any)
        .eq('id', itemId);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success('Marked as received');
    } catch (error) {
      console.error('Error completing item:', error);
      toast.error('Failed to complete item');
    }
  }, []);

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderItem = (item: Item, index: number) => {
    const waitingSince = item.waiting_since || item.created_at;

    return (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
      >
        <div
          className={cn(
            'group flex items-start gap-4 border-b border-[var(--border-default)] px-5 py-4 transition-colors last:border-b-0',
            'hover:bg-[var(--bg-hover)]',
          )}
        >
          {/* Hourglass icon */}
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              {/* Title — clickable */}
              <button
                type="button"
                className="text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[#c2410c] focus-visible:outline-none focus-visible:text-[#c2410c]"
                onClick={() => router.push(`/items/${item.id}`)}
              >
                {item.title}
              </button>

              {/* Relative time */}
              <span className="shrink-0 text-xs text-[var(--text-muted)]">
                {formatDistanceToNow(new Date(waitingSince), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Notes preview */}
            {item.notes && (
              <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-1">
                {item.notes}
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.08)]"
              onClick={() => handleFollowUp(item)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Follow up</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10"
              onClick={() => handleComplete(item.id)}
              title="Mark as received"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGroup = (group: GroupedItems, groupIndex: number) => (
    <motion.div
      key={group.contact}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: Math.min(groupIndex * 0.06, 0.3),
      }}
      className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
    >
      {/* Group header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-default)] bg-[var(--bg-hover)]/50">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {group.contact}
        </h3>
        <span className="rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
          {group.items.length} item{group.items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Group items */}
      <AnimatePresence mode="popLayout">
        {group.items.map((item, index) => renderItem(item, index))}
      </AnimatePresence>
    </motion.div>
  );

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-5 sm:px-8"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-semibold text-[var(--text-primary)]"
              style={{ letterSpacing: '-0.02em' }}
            >
              Waiting For
            </h1>
          </div>

          {totalCount > 0 && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-500">
              {totalCount} item{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-6">
        {totalCount === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nothing pending!"
            description="No one owes you anything."
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            {/* Named contact groups */}
            {groups.map((group, index) => renderGroup(group, index))}

            {/* Ungrouped items */}
            {ungroupedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(groups.length * 0.06, 0.3),
                }}
                className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
              >
                {/* Group header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-default)] bg-[var(--bg-hover)]/50">
                  <h3 className="text-sm font-semibold text-[var(--text-muted)]">
                    Ungrouped
                  </h3>
                  <span className="rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                    {ungroupedItems.length} item
                    {ungroupedItems.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Ungrouped items */}
                <AnimatePresence mode="popLayout">
                  {ungroupedItems.map((item, index) =>
                    renderItem(item, index),
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
