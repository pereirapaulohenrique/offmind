'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTodo, Calendar, CheckCircle2, ArrowUpDown, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Item, Space, Project } from '@/types/database';

// ─── Types ───────────────────────────────────────────────────────────────────

type SortOption = 'newest' | 'oldest' | 'alphabetical';

interface BacklogPageClientProps {
  initialItems: Item[];
  spaces: Space[];
  projects: Project[];
  userId: string;
}

// ─── Quick-schedule presets ──────────────────────────────────────────────────

const SCHEDULE_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'Next week', days: 7 },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function BacklogPageClient({
  initialItems,
  spaces,
  projects,
  userId,
}: BacklogPageClientProps) {
  const getSupabase = () => createClient();
  const openProcessingPanel = useUIStore((s) => s.openProcessingPanel);

  // ── Local state ──────────────────────────────────────────────────────────

  const [items, setItems] = useState<Item[]>(initialItems);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterSpaceId, setFilterSpaceId] = useState<string>('all');
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  const [schedulingItemId, setSchedulingItemId] = useState<string | null>(null);

  // Sync when server data changes (e.g. navigation)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // ── Real-time subscription ───────────────────────────────────────────────

  useEffect(() => {
    const supabase = getSupabase();

    const channel = supabase
      .channel('backlog-items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item;
            // Only add if it belongs in backlog (non-completed, same destination, not archived)
            if (!newItem.is_completed && newItem.destination_id && !newItem.archived_at) {
              setItems((prev) => {
                if (prev.some((i) => i.id === newItem.id)) return prev;
                return [newItem, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Item;
            if (updated.archived_at || updated.is_completed || updated.layer === 'commit') {
              // Item archived, completed or scheduled — remove from backlog
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

  // ── Derived data ─────────────────────────────────────────────────────────

  const filteredItems = items.filter((item) => {
    if (filterSpaceId !== 'all' && item.space_id !== filterSpaceId) return false;
    if (filterProjectId !== 'all' && item.project_id !== filterProjectId) return false;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getSpaceName = (spaceId: string | null): string | null => {
    if (!spaceId) return null;
    return spaces.find((s) => s.id === spaceId)?.name ?? null;
  };

  const getProjectName = (projectId: string | null): string | null => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId)?.name ?? null;
  };

  const buildBreadcrumb = (item: Item): string | null => {
    const spaceName = getSpaceName(item.space_id);
    const projectName = getProjectName(item.project_id);
    if (spaceName && projectName) return `${spaceName} > ${projectName}`;
    if (spaceName) return spaceName;
    if (projectName) return projectName;
    return null;
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleSchedule = useCallback(
    async (itemId: string, daysFromNow: number) => {
      const supabase = getSupabase();
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + daysFromNow);
      scheduledDate.setHours(9, 0, 0, 0);

      try {
        const { error } = await supabase
          .from('items')
          .update({
            scheduled_at: scheduledDate.toISOString(),
            layer: 'commit',
          } as any)
          .eq('id', itemId);

        if (error) throw error;

        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setSchedulingItemId(null);
        toast.success('Item scheduled');
      } catch (error) {
        console.error('Error scheduling item:', error);
        toast.error('Failed to schedule item');
      }
    },
    [],
  );

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
      toast.success('Item completed');
    } catch (error) {
      console.error('Error completing item:', error);
      toast.error('Failed to complete item');
    }
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-5 sm:px-8"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Title + count */}
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-semibold text-[var(--text-primary)]"
              style={{ letterSpacing: '-0.02em' }}
            >
              Backlog
            </h1>
            {items.length > 0 && (
              <span className="rounded-full bg-[var(--bg-hover)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger
                size="sm"
                className="h-8 gap-1.5 rounded-xl border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)]"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter by space */}
            {spaces.length > 0 && (
              <Select
                value={filterSpaceId}
                onValueChange={setFilterSpaceId}
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 gap-1.5 rounded-xl border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)]"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All spaces</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Filter by project */}
            {projects.length > 0 && (
              <Select
                value={filterProjectId}
                onValueChange={setFilterProjectId}
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 gap-1.5 rounded-xl border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)]"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* ── Items list ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-6">
        {sortedItems.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="Backlog clear!"
            description="All tasks are scheduled or complete."
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item, index) => {
                const breadcrumb = buildBreadcrumb(item);
                const isScheduling = schedulingItemId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.03, 0.3),
                    }}
                  >
                    <div
                      className={cn(
                        'group relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] transition-all duration-200',
                        'hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-px hover:border-[#c2410c]/30',
                      )}
                    >
                      {/* Main row */}
                      <div className="flex items-start gap-4 p-5">
                        {/* Circle indicator */}
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-default)] transition-colors group-hover:border-[#c2410c]/50" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            {/* Title — clickable */}
                            <button
                              type="button"
                              className="text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[#c2410c] focus-visible:outline-none focus-visible:text-[#c2410c]"
                              onClick={() => openProcessingPanel(item.id)}
                            >
                              {item.title}
                            </button>

                            {/* Breadcrumb */}
                            {breadcrumb && (
                              <span className="hidden shrink-0 text-xs text-[var(--text-muted)] sm:inline-block">
                                {breadcrumb}
                              </span>
                            )}
                          </div>

                          {/* Meta row */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-3">
                            <span className="text-xs text-[var(--text-muted)]">
                              Created{' '}
                              {formatDistanceToNow(new Date(item.created_at), {
                                addSuffix: true,
                              })}
                            </span>

                            {/* Breadcrumb on mobile */}
                            {breadcrumb && (
                              <span className="text-xs text-[var(--text-muted)] sm:hidden">
                                {breadcrumb}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'h-8 gap-1.5 rounded-xl text-xs font-medium',
                              isScheduling
                                ? 'bg-[rgba(194,65,12,0.1)] text-[#c2410c]'
                                : 'text-[var(--text-muted)] hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.08)]',
                            )}
                            onClick={() =>
                              setSchedulingItemId(isScheduling ? null : item.id)
                            }
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Schedule</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10"
                            onClick={() => handleComplete(item.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Inline schedule picker */}
                      <AnimatePresence>
                        {isScheduling && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-default)] px-5 py-3">
                              <span className="text-xs text-[var(--text-muted)]">
                                Schedule for:
                              </span>
                              {SCHEDULE_PRESETS.map((preset) => (
                                <Button
                                  key={preset.label}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 rounded-xl border-[var(--border-default)] text-xs hover:border-[#c2410c]/40 hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.06)]"
                                  onClick={() =>
                                    handleSchedule(item.id, preset.days)
                                  }
                                >
                                  {preset.label}
                                </Button>
                              ))}

                              {/* Native date input as fallback for custom date */}
                              <input
                                type="date"
                                className="h-7 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#c2410c]/50"
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const target = new Date(e.target.value);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const diffDays = Math.round(
                                      (target.getTime() - today.getTime()) /
                                        (1000 * 60 * 60 * 24),
                                    );
                                    handleSchedule(item.id, diffDays);
                                  }
                                }}
                              />

                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto h-7 rounded-xl text-xs text-[var(--text-muted)]"
                                onClick={() => setSchedulingItemId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
