import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Sidebar tree expansion
  sidebarExpandedNodes: string[];
  toggleSidebarNode: (nodeId: string) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Quick capture
  quickCaptureOpen: boolean;
  setQuickCaptureOpen: (open: boolean) => void;

  // Capture bar focus
  captureBarFocused: boolean;
  setCaptureBarFocused: (focused: boolean) => void;

  // Processing panel (replaces editingItemId)
  processingPanelOpen: boolean;
  processingItemId: string | null;
  processingPanelExpanded: boolean;
  openProcessingPanel: (itemId: string) => void;
  closeProcessingPanel: () => void;
  toggleProcessingPanelExpanded: () => void;

  // Legacy: editingItemId (for backward compatibility during migration)
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;

  // View type for Organize page
  organizeViewType: 'columns' | 'list' | 'grid';
  setOrganizeViewType: (type: 'columns' | 'list' | 'grid') => void;

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

  // Sidebar tree
  sidebarExpandedNodes: [],
  toggleSidebarNode: (nodeId) =>
    set((state) => ({
      sidebarExpandedNodes: state.sidebarExpandedNodes.includes(nodeId)
        ? state.sidebarExpandedNodes.filter((id) => id !== nodeId)
        : [...state.sidebarExpandedNodes, nodeId],
    })),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Quick capture
  quickCaptureOpen: false,
  setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),

  // Capture bar focus
  captureBarFocused: false,
  setCaptureBarFocused: (focused) => set({ captureBarFocused: focused }),

  // Processing panel
  processingPanelOpen: false,
  processingItemId: null,
  processingPanelExpanded: false,
  openProcessingPanel: (itemId) =>
    set({ processingPanelOpen: true, processingItemId: itemId, editingItemId: itemId }),
  closeProcessingPanel: () =>
    set({ processingPanelOpen: false, processingItemId: null, processingPanelExpanded: false, editingItemId: null }),
  toggleProcessingPanelExpanded: () =>
    set((state) => ({ processingPanelExpanded: !state.processingPanelExpanded })),

  // Legacy editingItemId
  editingItemId: null,
  setEditingItemId: (id) => {
    if (id) {
      set({ editingItemId: id, processingPanelOpen: true, processingItemId: id });
    } else {
      set({ editingItemId: null, processingPanelOpen: false, processingItemId: null, processingPanelExpanded: false });
    }
  },

  // View type - Columns is default for Organize
  organizeViewType: 'columns',
  setOrganizeViewType: (type) => set({ organizeViewType: type }),

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
