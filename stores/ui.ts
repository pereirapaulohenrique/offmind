import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Quick capture
  quickCaptureOpen: boolean;
  setQuickCaptureOpen: (open: boolean) => void;

  // Item editor
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;

  // View type for Process page
  processViewType: 'list' | 'kanban' | 'table';
  setProcessViewType: (type: 'list' | 'kanban' | 'table') => void;

  // Theme (dark by default)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Quick capture
  quickCaptureOpen: false,
  setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),

  // Item editor
  editingItemId: null,
  setEditingItemId: (id) => set({ editingItemId: id }),

  // View type
  processViewType: 'list',
  setProcessViewType: (type) => set({ processViewType: type }),

  // Theme
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  },
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
      }
      return { theme: newTheme };
    }),
}));
