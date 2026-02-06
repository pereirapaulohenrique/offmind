'use client';
import { useCallback, useState } from 'react';
import { softDeleteItem, restoreItem } from '@/lib/utils/soft-delete';
import { useItemsStore } from '@/stores/items';
import { toast } from 'sonner';

export function useSoftDelete() {
  // Track recently deleted items for undo
  const [recentlyDeleted, setRecentlyDeleted] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const { removeItem, addItem } = useItemsStore();

  const deleteItem = useCallback(async (itemId: string, itemTitle: string) => {
    // Optimistically remove from UI
    removeItem(itemId);

    // Soft delete in database
    const result = await softDeleteItem(itemId);

    if (!result.success) {
      toast.error('Failed to delete item');
      return;
    }

    // Show undo toast
    toast('Item deleted', {
      description: itemTitle,
      action: {
        label: 'Undo',
        onClick: async () => {
          const restored = await restoreItem(itemId);
          if (restored.success) {
            toast.success('Item restored');
          }
        },
      },
    });
  }, [removeItem]);

  return { deleteItem };
}
