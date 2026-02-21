'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useItemsStore } from '@/stores/items';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Calendar,
  MoreHorizontal,
  Trash2,
  PanelRight,
} from 'lucide-react';
import { BulkAIActions, type BulkAISuggestion } from '@/components/ai/BulkAIActions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Item } from '@/types/database';
import { toast } from 'sonner';

interface SchedulePageClientProps {
  initialItems: Item[];
  unscheduledItems: Item[];
  userId: string;
}

type ViewMode = 'day' | 'week' | 'agenda';

export function SchedulePageClient({ initialItems, unscheduledItems, userId }: SchedulePageClientProps) {
  const getSupabase = () => createClient();
  const { items, setItems, addItem, updateItem, removeItem, isLoading } = useItemsStore();
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [unscheduled, setUnscheduled] = useState<Item[]>(unscheduledItems);
  const [showSidebar, setShowSidebar] = useState(false);

  // Initialize items from server
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel('items-commit')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT' && payload.new.layer === 'commit' && !payload.new.archived_at) {
            addItem(payload.new as Item);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.archived_at) {
              removeItem(payload.new.id as string);
            } else if (payload.new.layer === 'commit') {
              updateItem(payload.new as Item);
            } else {
              // Item moved to another layer
              removeItem(payload.new.id as string);
            }
          } else if (payload.eventType === 'DELETE') {
            removeItem(payload.old.id as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addItem, updateItem, removeItem]);

  // Handle item update
  const handleUpdateItem = useCallback(
    async (id: string, updates: Partial<Item>) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from('items')
          .update(updates as any)
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating item:', error);
        toast.error('Failed to update item');
      }
    },
    []
  );

  // Handle item delete
  const handleDeleteItem = useCallback(
    async (id: string) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase.from('items').delete().eq('id', id);

        if (error) throw error;

        removeItem(id);
        toast.success('Item deleted');
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    },
    [removeItem]
  );

  // Handle unscheduling (move back to process)
  const handleUnschedule = useCallback(
    async (itemId: string) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from('items')
          .update({
            layer: 'process',
            scheduled_at: null,
          } as any)
          .eq('id', itemId);

        if (error) throw error;

        removeItem(itemId);
        toast.success('Item unscheduled');
      } catch (error) {
        console.error('Error unscheduling item:', error);
        toast.error('Failed to unschedule item');
      }
    },
    [removeItem]
  );

  // Handle reschedule
  const handleReschedule = useCallback(
    async (itemId: string, newDate: Date) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from('items')
          .update({
            scheduled_at: newDate.toISOString(),
          } as any)
          .eq('id', itemId);

        if (error) throw error;
        toast.success('Item rescheduled');
      } catch (error) {
        console.error('Error rescheduling item:', error);
        toast.error('Failed to reschedule item');
      }
    },
    []
  );

  // Handle bulk AI suggestions (for scheduling)
  const handleApplyBulkSuggestions = useCallback(
    async (suggestions: BulkAISuggestion[]) => {
      const supabase = getSupabase();

      for (const suggestion of suggestions) {
        // Parse schedule suggestion - format: "Schedule for YYYY-MM-DD at HH:MM"
        const match = suggestion.suggestion.match(/Schedule for (\d{4}-\d{2}-\d{2})(?: at (\d{2}:\d{2}))?/);
        if (match) {
          const dateStr = match[1];
          const timeStr = match[2] || '09:00';
          const scheduledAt = new Date(`${dateStr}T${timeStr}:00`);

          await supabase
            .from('items')
            .update({ scheduled_at: scheduledAt.toISOString() } as any)
            .eq('id', suggestion.itemId);
        }
      }
    },
    []
  );

  // Handle scheduling an item from the unscheduled sidebar
  const handleScheduleFromSidebar = useCallback(
    async (itemId: string, date: Date) => {
      const supabase = getSupabase();
      try {
        const scheduledAt = date.toISOString();
        const { error } = await supabase
          .from('items')
          .update({
            scheduled_at: scheduledAt,
            layer: 'commit',
          } as any)
          .eq('id', itemId);

        if (error) throw error;

        // Move item from unscheduled to scheduled
        const item = unscheduled.find(i => i.id === itemId);
        if (item) {
          const updated = { ...item, scheduled_at: scheduledAt, layer: 'commit' };
          setUnscheduled(prev => prev.filter(i => i.id !== itemId));
          // The realtime subscription will handle adding it to the scheduled items
        }
        toast.success('Item scheduled');
      } catch (error) {
        toast.error('Failed to schedule item');
      }
    },
    [unscheduled]
  );

  // Filter items in commit layer
  const commitItems = items.filter(
    (item) => item.layer === 'commit' && item.scheduled_at
  );

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, Item[]> = {};
    commitItems.forEach((item) => {
      if (item.scheduled_at) {
        const date = new Date(item.scheduled_at).toDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      }
    });
    // Sort items within each date by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        return (
          new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
        );
      });
    });
    return grouped;
  }, [commitItems]);

  // Get items for selected date
  const selectedDateItems = itemsByDate[selectedDate.toDateString()] || [];

  // Get week dates
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  // Navigation
  const goToToday = () => setSelectedDate(new Date());
  const goToPrev = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setSelectedDate(newDate);
  };
  const goToNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };

  const formatDateHeader = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="px-6 py-5 sm:px-8" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>Schedule</h1>
            <p className="hidden text-sm text-[var(--text-muted)] sm:block">
              Your scheduled items
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Actions */}
            <BulkAIActions
              items={commitItems}
              destinations={[]}
              pageType="commit"
              onApplySuggestions={handleApplyBulkSuggestions}
            />

            {/* View toggle */}
            <div className="flex rounded-xl bg-[var(--bg-inset)] shadow-[var(--shadow-sm)] border border-[var(--border-subtle)]">
              <Button
                variant="ghost"
                size="sm"
                className={cn('rounded-l-xl rounded-r-none', viewMode === 'agenda' && 'bg-[var(--layer-commit-bg)] text-[var(--layer-commit)] shadow-sm')}
                onClick={() => setViewMode('agenda')}
              >
                Agenda
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn('rounded-none', viewMode === 'day' && 'bg-[var(--layer-commit-bg)] text-[var(--layer-commit)]')}
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn('rounded-r-xl rounded-l-none', viewMode === 'week' && 'bg-[var(--layer-commit-bg)] text-[var(--layer-commit)]')}
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
            </div>

            {/* Sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-xl',
                showSidebar && 'bg-[var(--layer-commit-bg)] text-[var(--layer-commit)]',
              )}
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <PanelRight className="h-4 w-4 mr-1.5" />
              Unscheduled
              {unscheduled.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                  {unscheduled.length}
                </span>
              )}
            </Button>

            {/* Item count */}
            {commitItems.length > 0 && (
              <span className="rounded-full bg-[var(--layer-commit-bg)] border border-[var(--layer-commit-border)] px-3 py-1 text-sm font-medium text-[var(--layer-commit)]">
                {commitItems.length} scheduled
              </span>
            )}
          </div>
        </div>

        {/* Date navigation */}
        {viewMode !== 'agenda' && (
          <div className="mt-4 flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[200px] text-center text-sm font-medium">
                {formatDateHeader()}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <LoadingState count={5} type="card" />
          ) : commitItems.length === 0 ? (
            <EmptyState
              iconName="calendar"
              title="Nothing scheduled"
              description="Schedule items from your backlog to plan your time."
              action={{
                label: 'View Backlog',
                href: '/organize',
              }}
            />
          ) : viewMode === 'agenda' ? (
            // Agenda view - all upcoming items
            <div className="mx-auto max-w-3xl">
              <AgendaView
                itemsByDate={itemsByDate}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onUnschedule={handleUnschedule}
                onReschedule={handleReschedule}
              />
            </div>
          ) : viewMode === 'day' ? (
            // Day view
            <div className="mx-auto max-w-3xl">
              <DayView
                date={selectedDate}
                items={selectedDateItems}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onUnschedule={handleUnschedule}
                onReschedule={handleReschedule}
              />
            </div>
          ) : (
            // Week view
            <div className="mx-auto max-w-6xl">
              <WeekView
                dates={weekDates}
                itemsByDate={itemsByDate}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onUnschedule={handleUnschedule}
                onReschedule={handleReschedule}
              />
            </div>
          )}
        </div>

        {/* Unscheduled sidebar */}
        {showSidebar && (
          <div className="w-80 shrink-0 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Unscheduled
                </h3>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {unscheduled.length}
                </span>
              </div>

              {unscheduled.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-6 text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    All backlog items are scheduled!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unscheduled.map(item => (
                    <UnscheduledCard
                      key={item.id}
                      item={item}
                      onSchedule={handleScheduleFromSidebar}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Agenda View Component
interface AgendaViewProps {
  itemsByDate: Record<string, Item[]>;
  onUpdateItem: (id: string, updates: Partial<Item>) => void;
  onDeleteItem: (id: string) => void;
  onUnschedule: (id: string) => void;
  onReschedule: (id: string, date: Date) => void;
}

function AgendaView({
  itemsByDate,
  onUpdateItem,
  onDeleteItem,
  onUnschedule,
  onReschedule,
}: AgendaViewProps) {
  const sortedDates = Object.keys(itemsByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const today = new Date().toDateString();

  return (
    <div className="space-y-6">
      {sortedDates.map((dateStr) => {
        const date = new Date(dateStr);
        const isToday = dateStr === today;
        const isPast = date < new Date(today);

        return (
          <div key={dateStr}>
            <h2
              className={cn(
                'mb-3 text-sm font-medium',
                isToday ? 'text-[var(--layer-commit)]' : isPast ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
              )}
            >
              {isToday ? 'Today' : date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {itemsByDate[dateStr].map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <CommitItemCard
                      item={item}
                      onUpdate={onUpdateItem}
                      onDelete={onDeleteItem}
                      onUnschedule={onUnschedule}
                      onReschedule={onReschedule}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Day View Component
interface DayViewProps {
  date: Date;
  items: Item[];
  onUpdateItem: (id: string, updates: Partial<Item>) => void;
  onDeleteItem: (id: string) => void;
  onUnschedule: (id: string) => void;
  onReschedule: (id: string, date: Date) => void;
}

function DayView({
  date,
  items,
  onUpdateItem,
  onDeleteItem,
  onUnschedule,
  onReschedule,
}: DayViewProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center">
        <p className="text-[var(--text-muted)]">No items scheduled for this day</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <CommitItemCard
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onUnschedule={onUnschedule}
              onReschedule={onReschedule}
              showTime
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Week View Component
interface WeekViewProps {
  dates: Date[];
  itemsByDate: Record<string, Item[]>;
  onUpdateItem: (id: string, updates: Partial<Item>) => void;
  onDeleteItem: (id: string) => void;
  onUnschedule: (id: string) => void;
  onReschedule: (id: string, date: Date) => void;
}

function WeekView({
  dates,
  itemsByDate,
  onUpdateItem,
  onDeleteItem,
  onUnschedule,
  onReschedule,
}: WeekViewProps) {
  const today = new Date().toDateString();

  return (
    <div className="grid grid-cols-7 gap-2">
      {dates.map((date) => {
        const dateStr = date.toDateString();
        const isToday = dateStr === today;
        const items = itemsByDate[dateStr] || [];

        return (
          <div
            key={dateStr}
            className={cn(
              'min-h-[200px] rounded-2xl border p-3',
              isToday ? 'border-[var(--layer-commit)] bg-[var(--layer-commit-bg)] shadow-[var(--shadow-card)]' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
            )}
          >
            <div className="mb-2 text-center">
              <div className="text-xs text-muted-foreground">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={cn(
                  'text-lg font-medium',
                  isToday ? 'text-[var(--layer-commit)]' : 'text-[var(--text-primary)]'
                )}
              >
                {date.getDate()}
              </div>
            </div>
            <div className="space-y-1">
              {items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'truncate rounded-lg px-2 py-1 text-xs',
                    item.is_completed
                      ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] line-through'
                      : 'bg-[var(--layer-commit-bg)] text-[var(--layer-commit)]'
                  )}
                  title={item.title}
                >
                  {item.scheduled_at && (
                    <span className="mr-1 opacity-70">
                      {new Date(item.scheduled_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                  {item.title}
                </div>
              ))}
              {items.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{items.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Commit Item Card Component
interface CommitItemCardProps {
  item: Item;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onUnschedule: (id: string) => void;
  onReschedule: (id: string, date: Date) => void;
  showTime?: boolean;
}

function CommitItemCard({
  item,
  onUpdate,
  onDelete,
  onUnschedule,
  onReschedule,
  showTime = false,
}: CommitItemCardProps) {
  const router = useRouter();
  const time = item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const handleQuickReschedule = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    if (item.scheduled_at) {
      const original = new Date(item.scheduled_at);
      newDate.setHours(original.getHours(), original.getMinutes(), 0, 0);
    } else {
      newDate.setHours(9, 0, 0, 0);
    }
    onReschedule(item.id, newDate);
  };

  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-px',
        item.is_completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Time */}
        {(showTime || time) && (
          <div className="w-16 shrink-0 text-sm text-muted-foreground">
            {item.is_all_day ? 'All day' : time}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-sm font-medium text-foreground cursor-pointer hover:text-[var(--accent-base)] transition-colors',
              item.is_completed && 'line-through text-muted-foreground'
            )}
            onClick={() => router.push(`/items/${item.id}`)}
          >
            {item.title}
          </h3>
          {item.notes && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {item.notes}
            </p>
          )}
          {item.duration_minutes && (
            <span className="mt-1 inline-block text-xs text-muted-foreground">
              {item.duration_minutes} min
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {/* Complete toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onUpdate(item.id, {
                is_completed: !item.is_completed,
                completed_at: item.is_completed ? null : new Date().toISOString(),
              })
            }
          >
            {item.is_completed ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </Button>

          {/* Reschedule */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Calendar className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleQuickReschedule(0)}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickReschedule(1)}>
                Tomorrow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickReschedule(7)}>
                Next week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUnschedule(item.id)}>
                Unschedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// Unscheduled Card Component
function UnscheduledCard({
  item,
  onSchedule,
}: {
  item: Item;
  onSchedule: (itemId: string, date: Date) => void;
}) {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const quickSchedule = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(9, 0, 0, 0);
    onSchedule(item.id, date);
  };

  return (
    <div className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 transition-all hover:border-[var(--border-default)]">
      <p
        className="text-sm font-medium text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent-base)] transition-colors truncate"
        onClick={() => router.push(`/items/${item.id}`)}
      >
        {item.title}
      </p>
      {item.notes && (
        <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
          {item.notes}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          onClick={() => quickSchedule(0)}
          className="rounded-lg bg-[var(--layer-commit-bg)] border border-[var(--layer-commit-border)] px-2 py-0.5 text-[10px] font-medium text-[var(--layer-commit)] transition-colors hover:bg-[var(--layer-commit)]/20"
        >
          Today
        </button>
        <button
          onClick={() => quickSchedule(1)}
          className="rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          Tomorrow
        </button>
        <button
          onClick={() => quickSchedule(7)}
          className="rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          Next week
        </button>
        {!showDatePicker ? (
          <button
            onClick={() => setShowDatePicker(true)}
            className="rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            Pick date
          </button>
        ) : (
          <input
            type="date"
            autoFocus
            onChange={(e) => {
              if (e.target.value) {
                const date = new Date(e.target.value);
                date.setHours(9, 0, 0, 0);
                onSchedule(item.id, date);
                setShowDatePicker(false);
              }
            }}
            onBlur={() => setShowDatePicker(false)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] px-2 py-0.5 text-[10px] text-[var(--text-primary)] focus:border-[var(--accent-base)]/40 focus:outline-none"
            min={new Date().toISOString().split('T')[0]}
          />
        )}
      </div>
    </div>
  );
}
