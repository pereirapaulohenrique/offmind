import { create } from 'zustand';
import type { Subtask } from '@/types/database';

interface SubtasksState {
  subtasks: Subtask[];
  isLoading: boolean;

  // Actions
  setSubtasks: (subtasks: Subtask[]) => void;
  addSubtask: (subtask: Subtask) => void;
  updateSubtask: (subtask: Subtask) => void;
  removeSubtask: (id: string) => void;
  setLoading: (loading: boolean) => void;

  // Optimistic updates
  optimisticToggle: (id: string) => void;
}

export const useSubtasksStore = create<SubtasksState>((set) => ({
  subtasks: [],
  isLoading: false,

  setSubtasks: (subtasks) => set({ subtasks }),

  addSubtask: (subtask) =>
    set((state) => ({
      subtasks: [...state.subtasks, subtask],
    })),

  updateSubtask: (subtask) =>
    set((state) => ({
      subtasks: state.subtasks.map((s) => (s.id === subtask.id ? subtask : s)),
    })),

  removeSubtask: (id) =>
    set((state) => ({
      subtasks: state.subtasks.filter((s) => s.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  optimisticToggle: (id) =>
    set((state) => ({
      subtasks: state.subtasks.map((s) =>
        s.id === id
          ? {
              ...s,
              is_completed: !s.is_completed,
              completed_at: s.is_completed ? null : new Date().toISOString(),
            }
          : s
      ),
    })),
}));

// Selectors
export const selectSubtasksByItem = (state: SubtasksState, itemId: string) =>
  state.subtasks
    .filter((s) => s.item_id === itemId)
    .sort((a, b) => a.sort_order - b.sort_order);

export const selectSubtaskProgress = (state: SubtasksState, itemId: string) => {
  const subs = state.subtasks.filter((s) => s.item_id === itemId);
  if (subs.length === 0) return null;
  return { total: subs.length, completed: subs.filter((s) => s.is_completed).length };
};
