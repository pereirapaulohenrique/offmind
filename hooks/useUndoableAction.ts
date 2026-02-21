'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

interface UndoableActionOptions {
  /** The action to perform (e.g., archive, delete, complete) */
  action: () => Promise<void>;
  /** The undo action (e.g., restore, uncomplete) */
  undo: () => Promise<void>;
  /** Optimistic UI update before the action completes */
  optimistic?: () => void;
  /** Revert the optimistic UI update on failure */
  revert?: () => void;
  /** Toast message shown after the action */
  message: string;
  /** Optional toast description */
  description?: string;
}

export function useUndoableAction() {
  const perform = useCallback(async (options: UndoableActionOptions) => {
    // Run optimistic UI update immediately
    options.optimistic?.();

    try {
      await options.action();

      toast(options.message, {
        description: options.description,
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await options.undo();
            } catch {
              toast.error('Failed to undo');
            }
          },
        },
      });
    } catch {
      // Revert optimistic update on failure
      options.revert?.();
      toast.error('Action failed');
    }
  }, []);

  return { perform };
}
