import { create } from 'zustand';
import type { Item } from '@/types/database';

interface ItemsState {
  items: Item[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Optimistic updates
  optimisticUpdate: (id: string, updates: Partial<Item>) => void;
  revertOptimisticUpdate: (id: string, originalItem: Item) => void;
}

export const useItemsStore = create<ItemsState>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
    })),

  updateItem: (item) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === item.id ? item : i)),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  optimisticUpdate: (id, updates) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),

  revertOptimisticUpdate: (id, originalItem) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? originalItem : i)),
    })),
}));

// Selectors
export const selectItemsByLayer = (state: ItemsState, layer: string) =>
  state.items.filter((item) => item.layer === layer);

export const selectItemsByDestination = (state: ItemsState, destinationId: string) =>
  state.items.filter((item) => item.destination_id === destinationId);

export const selectCaptureItems = (state: ItemsState) =>
  state.items.filter((item) => item.layer === 'capture');

export const selectProcessItems = (state: ItemsState) =>
  state.items.filter((item) => item.layer === 'process');

export const selectCommitItems = (state: ItemsState) =>
  state.items.filter((item) => item.layer === 'commit' && item.scheduled_at);
