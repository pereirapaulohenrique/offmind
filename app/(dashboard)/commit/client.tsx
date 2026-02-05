'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useItemsStore } from '@/stores/items';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
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

interface CommitPageClientProps {
  initialItems: Item[];
  userId: string;
}

type ViewMode = 'day' | 'week' | 'agenda';

export function CommitPageClient({ initialItems, userId }: CommitPageClientProps) {
  const getSupabase = () => createClient();
  const { items, setItems, addItem, updateItem, removeItem, isLoading } = useItemsStore();
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [selectedDate, setSelectedDate] = useState(new Date());

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
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.layer === 'commit') {
            addItem(payload.new as Item);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.layer === 'commit') {
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
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Commit</h1>
            <p className="text-sm text-muted-foreground">
              Your scheduled commitments
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-md border border-border">
              <Button
                variant="ghost"
                size="sm"
                className={cn('rounded-r-none', viewMode === 'agenda' && 'bg-accent')}
                onClick={() => setViewMode('agenda')}
              >
                Agenda
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn('rounded-none', viewMode === 'day' && 'bg-accent')}
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn('rounded-l-none', viewMode === 'week' && 'bg-accent')}
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
            </div>

            {/* Item count */}
            {commitItems.length > 0 && (
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
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
                ←
              </Button>
              <span className="min-w-[200px] text-center text-sm font-medium">
                {formatDateHeader()}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNext}>
                →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <LoadingState count={5} type="card" />
        ) : commitItems.length === 0 ? (
          <EmptyState
            iconName="calendar"
            title="Nothing scheduled"
            description="Schedule items from your backlog to commit to specific times."
            action={{
              label: 'View Backlog',
              href: '/process',
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
                isToday ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'
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
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">No items scheduled for this day</p>
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
              'min-h-[200px] rounded-lg border p-2',
              isToday ? 'border-primary bg-primary/5' : 'border-border'
            )}
          >
            <div className="mb-2 text-center">
              <div className="text-xs text-muted-foreground">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={cn(
                  'text-lg font-medium',
                  isToday ? 'text-primary' : 'text-foreground'
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
                    'truncate rounded px-2 py-1 text-xs',
                    item.is_completed
                      ? 'bg-muted text-muted-foreground line-through'
                      : 'bg-primary/10 text-primary'
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
        'group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-emphasis',
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
              'text-sm font-medium text-foreground',
              item.is_completed && 'line-through text-muted-foreground'
            )}
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
            <span className="text-sm">{item.is_completed ? '↩️' : '✅'}</span>
          </Button>

          {/* Reschedule */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="text-sm">📅</span>
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
                <span className="text-sm">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <span className="mr-2">🗑️</span>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
