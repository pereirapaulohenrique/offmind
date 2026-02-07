'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useItemsStore } from '@/stores/items';
import { useAISuggestion } from '@/hooks/useAISuggestion';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemDetailPanel } from '@/components/items/ItemDetailPanel';
import { AISuggestionBadge } from '@/components/items/AISuggestionBadge';
import { BulkAIActions, type BulkAISuggestion } from '@/components/ai/BulkAIActions';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [aiSuggestItemId, setAiSuggestItemId] = useState<string | null>(null);

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
      <div className="border-b border-[var(--border-subtle)] px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">Inbox</h1>
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
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            <AnimatePresence mode="popLayout">
              {captureItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2"
                >
                  <ItemCard
                    item={item}
                    destinations={destinations}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                    onMove={handleMoveToDestination}
                    onClick={() => setSelectedItem(item)}
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
        )}
      </div>

      {/* Item detail panel */}
      <ItemDetailPanel
        item={selectedItem}
        destinations={destinations}
        spaces={spaces}
        projects={projects}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}
