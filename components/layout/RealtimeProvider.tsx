'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useItemsStore } from '@/stores/items';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Item } from '@/types/database';

interface RealtimeProviderProps {
  userId: string;
  initialInboxItems: Item[];
  children: React.ReactNode;
}

/**
 * Mounts once in the dashboard layout. Responsibilities:
 *  1. Seed the Zustand items store with server-fetched inbox items
 *  2. Open a single Supabase real-time channel for the user's items
 *  3. Keep the store in sync when items are added/updated/deleted from ANY source
 */
export function RealtimeProvider({ userId, initialInboxItems, children }: RealtimeProviderProps) {
  const { setItems, addItem, updateItem, removeItem } = useItemsStore();
  const initializedRef = useRef(false);

  // Seed store once with server data
  useEffect(() => {
    if (!initializedRef.current) {
      setItems(initialInboxItems);
      initializedRef.current = true;
    }
  }, [initialInboxItems, setItems]);

  // Global real-time subscription — runs on every dashboard page
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('global-items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          if (payload.eventType === 'INSERT') {
            addItem(payload.new as Item);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Item;
            if (updated.archived_at) {
              removeItem(updated.id);
            } else {
              updateItem(updated);
            }
          } else if (payload.eventType === 'DELETE') {
            removeItem((payload.old as any).id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addItem, updateItem, removeItem]);

  return <>{children}</>;
}
