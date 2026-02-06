import { create } from 'zustand';

export type AppMode = 'surface' | 'process' | 'calendar' | 'library';

interface UIState {
  // Active mode (4-mode workspace)
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;

  // Sidebar (always icon-only in new design, kept for mobile compat)
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
  processViewType: 'focus' | 'kanban' | 'list';
  setProcessViewType: (type: 'focus' | 'kanban' | 'list') => void;

  // View type for Surface page
  surfaceViewType: 'surface' | 'agenda' | 'flow';
  setSurfaceViewType: (type: 'surface' | 'agenda' | 'flow') => void;

  // Theme (dark by default)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Active mode
  activeMode: 'surface',
  setActiveMode: (mode) => set({ activeMode: mode }),

  // Sidebar
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

  // View type
  processViewType: 'focus',
  setProcessViewType: (type) => set({ processViewType: type }),

  // Surface view type
  surfaceViewType: 'surface',
  setSurfaceViewType: (type) => set({ surfaceViewType: type }),

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
