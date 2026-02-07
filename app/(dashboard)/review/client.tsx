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
  Crosshair,
  Table2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useItemsStore } from '@/stores/items';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemDetailPanel } from '@/components/items/ItemDetailPanel';
import { BulkAIActions, type BulkAISuggestion } from '@/components/ai/BulkAIActions';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { KanbanView } from '@/components/process/KanbanView';
import { FocusProcess } from '@/components/process/FocusProcess';
import { TableView } from '@/components/process/TableView';
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

interface ReviewPageClientProps {
  initialItems: Item[];
  destinations: Destination[];
  userId: string;
}

type ViewMode = 'focus' | 'kanban' | 'grouped' | 'list' | 'table';

export function ReviewPageClient({
  initialItems,
  destinations,
  userId,
}: ReviewPageClientProps) {
  const getSupabase = () => createClient();
  const { items, setItems, addItem, updateItem, removeItem, isLoading } = useItemsStore();
  const [viewMode, setViewMode] = useState<ViewMode>('focus');
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

  // Items without a destination (newly processed but not categorized)
  const uncategorizedItems = processItems.filter((item) => !item.destination_id);

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex-shrink-0 border-b border-[var(--border-subtle)] px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">Review</h1>
            <p className="hidden text-sm text-[var(--text-muted)] sm:block">
              Organize items into destinations. Schedule when ready.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto sm:gap-3">
            {/* Bulk AI Actions */}
            <BulkAIActions
              items={processItems}
              destinations={destinations}
              pageType="process"
              onApplySuggestions={handleApplyBulkSuggestions}
            />

            {/* View toggle */}
            <div className="flex rounded-md border border-[var(--border-default)]">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-r-none',
                  viewMode === 'focus' && 'bg-[var(--layer-process-bg)] text-[var(--layer-process)]'
                )}
                onClick={() => setViewMode('focus')}
                title="Focus view"
              >
                <Crosshair className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-none border-x border-[var(--border-default)]',
                  viewMode === 'kanban' && 'bg-[var(--layer-process-bg)] text-[var(--layer-process)]'
                )}
                onClick={() => setViewMode('kanban')}
                title="Kanban view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-none border-r border-[var(--border-default)]',
                  viewMode === 'grouped' && 'bg-[var(--layer-process-bg)] text-[var(--layer-process)]'
                )}
                onClick={() => setViewMode('grouped')}
                title="Grouped view"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-none border-r border-[var(--border-default)]',
                  viewMode === 'list' && 'bg-[var(--layer-process-bg)] text-[var(--layer-process)]'
                )}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-l-none',
                  viewMode === 'table' && 'bg-[var(--layer-process-bg)] text-[var(--layer-process)]'
                )}
                onClick={() => setViewMode('table')}
                title="Table view"
              >
                <Table2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Item count */}
            {processItems.length > 0 && (
              <span className="rounded-full bg-[var(--layer-process-bg)] border border-[var(--layer-process-border)] px-3 py-1 text-sm font-medium text-[var(--layer-process)]">
                {processItems.length} item{processItems.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <LoadingState count={6} type="card" />
        ) : processItems.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing to review"
            description="Items from your Inbox will appear here. Start by capturing some thoughts!"
            variant="process"
            action={{
              label: 'Go to Inbox',
              href: '/inbox',
            }}
          />
        ) : viewMode === 'focus' ? (
          // Focus view (tinder-style card flow)
          <FocusProcess
            items={processItems}
            destinations={destinations}
            onMoveToDestination={handleMoveToDestination}
            onScheduleItem={handleScheduleItem}
            onDeleteItem={handleDeleteItem}
          />
        ) : viewMode === 'kanban' ? (
          // Kanban view
          <KanbanView
            items={processItems}
            destinations={destinations}
            onMoveToDestination={handleMoveToDestination}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onScheduleItem={handleScheduleItem}
            onItemClick={(item) => setSelectedItem(item)}
          />
        ) : viewMode === 'grouped' ? (
          // Grouped view (by destination)
          <div className="mx-auto max-w-6xl">
            {/* Uncategorized items */}
            {uncategorizedItems.length > 0 && (
              <DestinationGroup
                title="Uncategorized"
                iconName="inbox"
                color="gray"
                items={uncategorizedItems}
                destinations={destinations}
                isExpanded={expandedDestination === 'uncategorized'}
                onToggle={() =>
                  setExpandedDestination(
                    expandedDestination === 'uncategorized' ? null : 'uncategorized'
                  )
                }
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onMoveToDestination={handleMoveToDestination}
                onScheduleItem={handleScheduleItem}
              />
            )}

            {/* Destination groups */}
            {destinations.map((destination) => {
              const destItems = itemsByDestination[destination.id] || [];
              if (destItems.length === 0) return null;

              return (
                <DestinationGroup
                  key={destination.id}
                  title={destination.name}
                  iconName={destination.icon}
                  color={destination.color}
                  items={destItems}
                  destinations={destinations}
                  isExpanded={expandedDestination === destination.id}
                  onToggle={() =>
                    setExpandedDestination(
                      expandedDestination === destination.id ? null : destination.id
                    )
                  }
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  onMoveToDestination={handleMoveToDestination}
                  onScheduleItem={handleScheduleItem}
                />
              );
            })}
          </div>
        ) : viewMode === 'table' ? (
          // Table view
          <div className="mx-auto max-w-6xl">
            <TableView
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

// Destination Group Component
interface DestinationGroupProps {
  title: string;
  iconName: string;
  color: string;
  items: Item[];
  destinations: Destination[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateItem: (id: string, updates: Partial<Item>) => void;
  onDeleteItem: (id: string) => void;
  onMoveToDestination: (itemId: string, destinationId: string) => void;
  onScheduleItem: (itemId: string, scheduledAt: string) => void;
}

function DestinationGroup({
  title,
  iconName,
  color,
  items,
  destinations,
  isExpanded,
  onToggle,
  onUpdateItem,
  onDeleteItem,
  onMoveToDestination,
  onScheduleItem,
}: DestinationGroupProps) {
  const Icon = ICON_MAP[iconName] || Inbox;
  const colorOption = COLOR_PALETTE.find(c => c.value === color);

  return (
    <div className="mb-6">
      {/* Header */}
      <button
        onClick={onToggle}
        className="mb-3 flex w-full items-center gap-2 text-left"
      >
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
        )}>
          <Icon className={cn('h-4 w-4', colorOption?.text || 'text-[var(--text-muted)]')} />
        </div>
        <h2 className="text-lg font-medium text-[var(--text-primary)]">{title}</h2>
        <span className="text-sm text-[var(--text-muted)]">({items.length})</span>
        <ChevronDown
          className={cn(
            'ml-auto h-4 w-4 text-[var(--text-muted)] transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Items */}
      <AnimatePresence>
        {(isExpanded || items.length <= 3) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden pl-10"
          >
            {items.map((item) => (
              <ProcessItemCard
                key={item.id}
                item={item}
                destinations={destinations}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
                onMoveToDestination={onMoveToDestination}
                onSchedule={onScheduleItem}
                compact
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show count when collapsed */}
      {!isExpanded && items.length > 3 && (
        <button
          onClick={onToggle}
          className="ml-10 text-sm text-primary hover:underline"
        >
          Show all {items.length} items
        </button>
      )}
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
    // Schedule for tomorrow at 9am
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    onSchedule(item.id, tomorrow.toISOString());
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--border-emphasis)]',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-medium text-[var(--text-primary)]',
              compact ? 'text-sm' : 'text-base',
              item.is_completed && 'line-through text-[var(--text-muted)]'
            )}
          >
            {item.title}
          </h3>

          {!compact && item.notes && (
            <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">
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
