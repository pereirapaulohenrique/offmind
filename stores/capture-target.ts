import { create } from 'zustand';

export type CaptureTargetType = 'project' | 'page' | 'space';

export interface CaptureTarget {
  type: CaptureTargetType;
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface RecentTarget extends CaptureTarget {
  lastUsedAt: number;
}

interface CaptureTargetState {
  captureTarget: CaptureTarget | null;
  recentTargets: RecentTarget[];
  _expiryTimer: ReturnType<typeof setTimeout> | null;

  setCaptureTarget: (target: CaptureTarget | null) => void;
  clearCaptureTarget: () => void;
  addRecentTarget: (target: CaptureTarget) => void;
  resetExpiryTimer: () => void;
}

const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const MAX_RECENT = 5;

export const useCaptureTargetStore = create<CaptureTargetState>((set, get) => ({
  captureTarget: null,
  recentTargets: [],
  _expiryTimer: null,

  setCaptureTarget: (target) => {
    const state = get();
    if (state._expiryTimer) clearTimeout(state._expiryTimer);

    if (target === null) {
      set({ captureTarget: null, _expiryTimer: null });
      return;
    }

    const timer = setTimeout(() => {
      set({ captureTarget: null, _expiryTimer: null });
    }, EXPIRY_MS);

    get().addRecentTarget(target);
    set({ captureTarget: target, _expiryTimer: timer });
  },

  clearCaptureTarget: () => {
    const state = get();
    if (state._expiryTimer) clearTimeout(state._expiryTimer);
    set({ captureTarget: null, _expiryTimer: null });
  },

  addRecentTarget: (target) => {
    set((state) => {
      const filtered = state.recentTargets.filter(
        (t) => !(t.type === target.type && t.id === target.id)
      );
      const newRecent: RecentTarget = { ...target, lastUsedAt: Date.now() };
      return {
        recentTargets: [newRecent, ...filtered].slice(0, MAX_RECENT),
      };
    });
  },

  resetExpiryTimer: () => {
    const state = get();
    if (!state.captureTarget) return;

    if (state._expiryTimer) clearTimeout(state._expiryTimer);

    const timer = setTimeout(() => {
      set({ captureTarget: null, _expiryTimer: null });
    }, EXPIRY_MS);

    set({ _expiryTimer: timer });
  },
}));
