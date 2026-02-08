'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useItemsStore } from '@/stores/items';
import { useAISuggestion } from '@/hooks/useAISuggestion';
import { ItemCard } from '@/components/items/ItemCard';
import { AISuggestionBadge } from '@/components/items/AISuggestionBadge';
import { BulkAIActions, type BulkAISuggestion } from '@/components/ai/BulkAIActions';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { InboxGridView } from '@/components/inbox/InboxGridView';
import { InboxCompactView } from '@/components/inbox/InboxCompactView';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { List, LayoutGrid, Rows3 } from 'lucide-react';
import { ItemEditModal } from '@/components/items/ItemEditModal';
import type { Item, Destination, Space, Project } from '@/types/database';
import { toast } from 'sonner';

interface InboxPageClientProps {
  initialItems: Item[];
  destinations: Destination[];
  spaces: Space[];
  projects: Project[];
  userId: string;
}

export function InboxPageClient({ initialItems, destinations, spaces, projects, userId }: InboxPageClientProps) {
  const getSupabase = () => createClient();
  const { items, setItems, addItem, updateItem, removeItem, isLoading } = useItemsStore();
  const { suggestDestination, suggestion, isLoading: isAILoading, clearSuggestion } = useAISuggestion();
  const { openProcessingPanel, inboxViewType, setInboxViewType } = useUIStore();
  const [aiSuggestItemId, setAiSuggestItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Initialize items from server
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel('items-capture')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.layer === 'capture') {
            addItem(payload.new as Item);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.layer === 'capture') {
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

        // Update local state
        updateItem({ ...items.find(i => i.id === id)!, ...updates } as Item);
      } catch (error) {
        console.error('Error updating item:', error);
        toast.error('Failed to update item');
      }
    },
    [items, updateItem]
  );

  // Handle item delete
  const handleDeleteItem = useCallback(
    async (id: string) => {
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from('items')
          .delete()
          .eq('id', id);

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

  // Handle moving item to destination (processes it)
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

        removeItem(itemId);
        toast.success('Item processed');
        clearSuggestion();
        setAiSuggestItemId(null);
      } catch (error) {
        console.error('Error moving item:', error);
        toast.error('Failed to move item');
      }
    },
    [removeItem, clearSuggestion]
  );

  // Handle AI suggestion request
  const handleAISuggest = useCallback(
    async (item: Item) => {
      setAiSuggestItemId(item.id);
      await suggestDestination(item.title, item.notes || undefined, item.id);
    },
    [suggestDestination]
  );

  // Handle accepting AI suggestion
  const handleAcceptSuggestion = useCallback(() => {
    if (aiSuggestItemId && suggestion?.destination) {
      handleMoveToDestination(aiSuggestItemId, suggestion.destination.id);
    }
  }, [aiSuggestItemId, suggestion, handleMoveToDestination]);

  // Handle dismissing AI suggestion
  const handleDismissSuggestion = useCallback(() => {
    clearSuggestion();
    setAiSuggestItemId(null);
  }, [clearSuggestion]);

  // Handle bulk AI suggestions
  const handleApplyBulkSuggestions = useCallback(
    async (suggestions: BulkAISuggestion[]) => {
      const supabase = getSupabase();

      for (const suggestion of suggestions) {
        if (suggestion.destinationSlug) {
          // Find destination by slug
          const dest = destinations.find(d => d.slug === suggestion.destinationSlug);
          if (dest) {
            await supabase
              .from('items')
              .update({
                destination_id: dest.id,
                layer: 'process',
              } as any)
              .eq('id', suggestion.itemId);
          }
        }
      }

      // Refresh will happen via realtime subscription
    },
    [destinations]
  );

  // Filter items in capture layer
  const captureItems = items.filter((item) => item.layer === 'capture');

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="px-6 py-5 sm:px-8" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>Inbox</h1>
              {captureItems.length > 0 && (
                <span className="rounded-full bg-[var(--layer-capture-bg)] border border-[var(--layer-capture-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--layer-capture)]">
                  {captureItems.length} item{captureItems.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="hidden text-sm text-[var(--text-muted)] sm:block">
              Unprocessed items. Assign destinations, schedule, or delete.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <BulkAIActions
              items={captureItems}
              destinations={destinations}
              pageType="capture"
              onApplySuggestions={handleApplyBulkSuggestions}
            />
            <div className="flex rounded-xl bg-[var(--bg-inset)] shadow-[var(--shadow-sm)] border border-[var(--border-subtle)]">
              {([
                { type: 'list' as const, icon: List, label: 'List' },
                { type: 'grid' as const, icon: LayoutGrid, label: 'Grid' },
                { type: 'compact' as const, icon: Rows3, label: 'Compact' },
              ]).map((btn, i, arr) => (
                <Button
                  key={btn.type}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    i === 0 && 'rounded-r-none rounded-l-xl',
                    i === arr.length - 1 && 'rounded-l-none rounded-r-xl',
                    i > 0 && i < arr.length - 1 && 'rounded-none',
                    inboxViewType === btn.type &&
                      'bg-[var(--layer-capture-bg)] text-[var(--layer-capture)]'
                  )}
                  onClick={() => setInboxViewType(btn.type)}
                  title={`${btn.label} view`}
                >
                  <btn.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <LoadingState count={3} type="card" />
        ) : captureItems.length === 0 ? (
          <EmptyState
            iconName="check-circle-2"
            title="Inbox Zero!"
            description="All captured thoughts have been processed. Use the capture bar below to add something new."
          />
        ) : inboxViewType === 'list' ? (
          <div className="mx-auto max-w-3xl space-y-3">
            <AnimatePresence mode="popLayout">
              {captureItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15, delay: Math.min(index * 0.03, 0.3) }}
                  className="space-y-2"
                >
                  <ItemCard
                    item={item}
                    destinations={destinations}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                    onMove={handleMoveToDestination}
                    onClick={() => openProcessingPanel(item.id)}
                    onEdit={(item) => setEditingItem(item)}
                    onProcess={(item) => openProcessingPanel(item.id)}
                    onAISuggest={handleAISuggest}
                    showAIButton
                  />

                  {/* AI Suggestion Badge */}
                  {aiSuggestItemId === item.id && (isAILoading || suggestion) && (
                    <AISuggestionBadge
                      destination={suggestion?.destination || null}
                      destinationSlug={suggestion?.destinationSlug || ''}
                      confidence={suggestion?.confidence || 0}
                      reasoning={suggestion?.reasoning}
                      onAccept={handleAcceptSuggestion}
                      onDismiss={handleDismissSuggestion}
                      isLoading={isAILoading}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : inboxViewType === 'grid' ? (
          <InboxGridView
            items={captureItems}
            destinations={destinations}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            onProcess={(item) => openProcessingPanel(item.id)}
          />
        ) : (
          <InboxCompactView
            items={captureItems}
            destinations={destinations}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            onProcess={(item) => openProcessingPanel(item.id)}
          />
        )}
      </div>

      {/* Edit Modal */}
      <ItemEditModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={async (id, updates) => {
          handleUpdateItem(id, updates);
        }}
      />
    </div>
  );
}
