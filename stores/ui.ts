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

  // Capture bar focus
  captureBarFocused: boolean;
  setCaptureBarFocused: (focused: boolean) => void;

  // Item editor
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;

  // View type for Process page
  processViewType: 'focus' | 'list' | 'kanban' | 'table';
  setProcessViewType: (type: 'focus' | 'list' | 'kanban' | 'table') => void;

  // Theme (dark by default)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar - collapsed by default for more content space
  sidebarCollapsed: true,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Quick capture
  quickCaptureOpen: false,
  setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),

  // Capture bar focus
  captureBarFocused: false,
  setCaptureBarFocused: (focused) => set({ captureBarFocused: focused }),

  // Item editor
  editingItemId: null,
  setEditingItemId: (id) => set({ editingItemId: id }),

  // View type - Focus (tinder-style) is default
  processViewType: 'focus',
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
