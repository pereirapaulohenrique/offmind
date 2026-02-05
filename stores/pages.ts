'use client';

import { create } from 'zustand';
import type { Page } from '@/types/database';

interface PagesState {
  pages: Page[];
  isLoading: boolean;
  setPages: (pages: Page[]) => void;
  addPage: (page: Page) => void;
  updatePage: (page: Page) => void;
  removePage: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const usePagesStore = create<PagesState>((set) => ({
  pages: [],
  isLoading: false,

  setPages: (pages) => set({ pages }),

  addPage: (page) =>
    set((state) => ({
      pages: [page, ...state.pages],
    })),

  updatePage: (updatedPage) =>
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === updatedPage.id ? updatedPage : page
      ),
    })),

  removePage: (id) =>
    set((state) => ({
      pages: state.pages.filter((page) => page.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
