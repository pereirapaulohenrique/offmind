'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Inbox,
  LayoutGrid,
  BarChart3,
  List,
  Send,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Target,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useItemsStore } from '@/stores/items';
import { useUIStore } from '@/stores/ui';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemDetailPanel } from '@/components/items/ItemDetailPanel';
import { BulkAIActions, type BulkAISuggestion } from '@/components/ai/BulkAIActions';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { KanbanView } from '@/components/process/KanbanView';
import { FocusProcess } from '@/components/process/FocusProcess';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Item, Destination } from '@/types/database';
import { toast } from 'sonner';

interface ProcessPageClientProps {
  initialItems: Item[];
  destinations: Destination[];
  userId: string;
}

export function ProcessPageClient({
  initialItems,
  destinations,
  userId,
}: ProcessPageClientProps) {
  const getSupabase = () => createClient();
  const { items, setItems, addItem, updateItem, removeItem, isLoading } = useItemsStore();
  const { processViewType, setProcessViewType } = useUIStore();
  const [expandedDestination, setExpandedDestination] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Initialize items from server
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel('items-process')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.layer === 'process') {
            addItem(payload.new as Item);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.layer === 'process') {
              updateItem(payload.new as Item);
            } else {
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

  // Handle moving item to destination
  const handleMoveToDestination = useCallback(
    async (itemId: string, destinationId: string) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from('items')
          .update({
            destination_id: destinationId,
            layer: 'process',
          } as any)
          .eq('id', itemId);

        if (error) throw error;
        toast.success('Item moved');
      } catch (error) {
        console.error('Error moving item:', error);
        toast.error('Failed to move item');
      }
    },
    []
  );

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

  // Handle scheduling item (move to commit layer)
  const handleScheduleItem = useCallback(
    async (itemId: string, scheduledAt: string) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from('items')
          .update({
            layer: 'commit',
            scheduled_at: scheduledAt,
          } as any)
          .eq('id', itemId);

        if (error) throw error;

        removeItem(itemId);
        toast.success('Item scheduled');
      } catch (error) {
        console.error('Error scheduling item:', error);
        toast.error('Failed to schedule item');
      }
    },
    [removeItem]
  );

  // Handle bulk AI suggestions
  const handleApplyBulkSuggestions = useCallback(
    async (suggestions: BulkAISuggestion[]) => {
      const supabase = getSupabase();

      for (const suggestion of suggestions) {
        if (suggestion.destinationSlug) {
          const dest = destinations.find(d => d.slug === suggestion.destinationSlug);
          if (dest) {
            await supabase
              .from('items')
              .update({ destination_id: dest.id } as any)
              .eq('id', suggestion.itemId);
          }
        }
      }
    },
    [destinations]
  );

  // Filter items in process layer
  const processItems = items.filter((item) => item.layer === 'process');

  // Group items by destination
  const itemsByDestination = destinations.reduce(
    (acc, dest) => {
      acc[dest.id] = processItems.filter((item) => item.destination_id === dest.id);
      return acc;
    },
    {} as Record<string, Item[]>
  );

  // Items without a destination
  const uncategorizedItems = processItems.filter((item) => !item.destination_id);

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-border/40 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground">Process</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Organize items into destinations
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* Bulk AI Actions */}
            <BulkAIActions
              items={processItems}
              destinations={destinations}
              pageType="process"
              onApplySuggestions={handleApplyBulkSuggestions}
            />

            {/* View toggle */}
            <div className="flex rounded-lg border border-border/40 bg-card/50 p-0.5">
              <button
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                  processViewType === 'focus'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setProcessViewType('focus')}
                title="Focus mode"
              >
                <Target className="h-3.5 w-3.5 inline-block mr-1" />
                Focus
              </button>
              <button
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                  processViewType === 'kanban'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setProcessViewType('kanban')}
                title="Kanban view"
              >
                <LayoutGrid className="h-3.5 w-3.5 inline-block mr-1" />
                Board
              </button>
              <button
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                  processViewType === 'list'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setProcessViewType('list')}
                title="List view"
              >
                <List className="h-3.5 w-3.5 inline-block mr-1" />
                List
              </button>
            </div>

            {/* Item count */}
            {processItems.length > 0 && (
              <span className="text-xs text-muted-foreground/50">
                {processItems.length} item{processItems.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6">
            <LoadingState count={6} type="card" />
          </div>
        ) : processItems.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Inbox}
              title="Nothing to process"
              description="Items you capture will appear here for processing"
              variant="process"
              action={{
                label: 'Go to Capture',
                href: '/capture',
              }}
            />
          </div>
        ) : processViewType === 'focus' ? (
          <FocusProcess
            items={processItems}
            destinations={destinations}
            onMoveToDestination={handleMoveToDestination}
            onScheduleItem={handleScheduleItem}
            onDeleteItem={handleDeleteItem}
          />
        ) : processViewType === 'kanban' ? (
          <div className="p-6">
            <KanbanView
              items={processItems}
              destinations={destinations}
              onMoveToDestination={handleMoveToDestination}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onScheduleItem={handleScheduleItem}
              onItemClick={(item) => setSelectedItem(item)}
            />
          </div>
        ) : (
          // List view
          <div className="p-6">
            <div className="mx-auto max-w-3xl space-y-3">
              <AnimatePresence mode="popLayout">
                {processItems.map((item) => {
                  const destination = destinations.find(
                    (d) => d.id === item.destination_id
                  );
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProcessItemCard
                        item={item}
                        destination={destination}
                        destinations={destinations}
                        onUpdate={handleUpdateItem}
                        onDelete={handleDeleteItem}
                        onMoveToDestination={handleMoveToDestination}
                        onSchedule={handleScheduleItem}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Item detail panel */}
      <ItemDetailPanel
        item={selectedItem}
        destinations={destinations}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}

// Process Item Card with actions
interface ProcessItemCardProps {
  item: Item;
  destination?: Destination;
  destinations: Destination[];
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onMoveToDestination: (itemId: string, destinationId: string) => void;
  onSchedule: (itemId: string, scheduledAt: string) => void;
  compact?: boolean;
}

function ProcessItemCard({
  item,
  destination,
  destinations,
  onUpdate,
  onDelete,
  onMoveToDestination,
  onSchedule,
  compact = false,
}: ProcessItemCardProps) {
  const handleQuickSchedule = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    onSchedule(item.id, tomorrow.toISOString());
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border/40 bg-card/50 transition-all hover:border-border hover:bg-card',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-medium text-foreground',
              compact ? 'text-sm' : 'text-base',
              item.is_completed && 'completed-text'
            )}
          >
            {item.title}
          </h3>

          {!compact && item.notes && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {item.notes}
            </p>
          )}

          {/* Destination badge (in list view) */}
          {!compact && destination && (
            <div className="mt-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: `var(--destination-${destination.slug})20`,
                  color: `var(--destination-${destination.slug})`,
                }}
              >
                <span>{destination.icon}</span>
                <span>{destination.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {/* Move to destination */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Send className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {destinations.map((dest) => (
                <DropdownMenuItem
                  key={dest.id}
                  onClick={() => onMoveToDestination(item.id, dest.id)}
                  className={item.destination_id === dest.id ? 'bg-accent' : ''}
                >
                  <span className="mr-2">{dest.icon}</span>
                  {dest.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick schedule */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleQuickSchedule}
            title="Schedule for tomorrow"
          >
            <Calendar className="h-4 w-4" />
          </Button>

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdate(item.id, { is_completed: !item.is_completed })}>
                {item.is_completed ? (
                  <RotateCcw className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {item.is_completed ? 'Mark incomplete' : 'Mark complete'}
              </DropdownMenuItem>
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
