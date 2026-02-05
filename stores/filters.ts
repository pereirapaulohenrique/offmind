import { create } from 'zustand';
import type { ItemFilters, ItemSort } from '@/types';

interface FiltersState {
  filters: ItemFilters;
  sort: ItemSort;

  // Actions
  setFilter: <K extends keyof ItemFilters>(key: K, value: ItemFilters[K]) => void;
  clearFilter: (key: keyof ItemFilters) => void;
  clearAllFilters: () => void;
  setSort: (sort: ItemSort) => void;
}

const defaultFilters: ItemFilters = {};
const defaultSort: ItemSort = { field: 'created_at', direction: 'desc' };

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: defaultFilters,
  sort: defaultSort,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilter: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.filters;
      return { filters: rest };
    }),

  clearAllFilters: () => set({ filters: defaultFilters }),

  setSort: (sort) => set({ sort }),
}));
