'use client';
import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { softDeleteItem } from '@/lib/utils/soft-delete';
import { useItemsStore } from '@/stores/items';
import { toast } from 'sonner';
import type { Item } from '@/types/database';

export function useSoftDelete() {
  const { removeItem, addItem } = useItemsStore();

  const deleteItem = useCallback(async (itemId: string, itemTitle: string) => {
    // Snapshot the item before removing from UI
    const snapshot = useItemsStore.getState().items.find((i) => i.id === itemId);

    // Optimistically remove from UI
    removeItem(itemId);

    // Soft delete in database
    const result = await softDeleteItem(itemId);

    if (!result.success) {
      // Revert: add item back to store
      if (snapshot) addItem(snapshot);
      toast.error('Failed to delete item');
      return;
    }

    // Show undo toast
    toast('Item deleted', {
      description: itemTitle,
      action: {
        label: 'Undo',
        onClick: async () => {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('items')
            .update({ archived_at: null } as Record<string, unknown>)
            .eq('id', itemId)
            .select()
            .single();

          if (!error && data) {
            addItem(data as Item);
            toast.success('Item restored');
          } else {
            toast.error('Failed to restore');
          }
        },
      },
    });
  }, [removeItem, addItem]);

  return { deleteItem };
}
