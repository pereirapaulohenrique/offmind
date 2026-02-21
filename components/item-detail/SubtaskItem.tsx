'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subtask } from '@/types/database';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onPromote?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Spring config for checkbox animation
// ---------------------------------------------------------------------------

const checkSpring = {
  type: 'spring' as const,
  damping: 20,
  stiffness: 300,
  mass: 0.6,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SubtaskItem({ subtask, onToggle, onUpdate, onDelete, onPromote }: SubtaskItemProps) {
  const [title, setTitle] = useState(subtask.title);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external title changes (e.g. from real-time subscription)
  useEffect(() => {
    if (!isFocused) {
      setTitle(subtask.title);
    }
  }, [subtask.title, isFocused]);

  // ---- Save on blur ----
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const trimmed = title.trim();
    if (trimmed && trimmed !== subtask.title) {
      onUpdate(subtask.id, trimmed);
    } else if (!trimmed) {
      // Revert empty titles back to original
      setTitle(subtask.title);
    }
  }, [title, subtask.id, subtask.title, onUpdate]);

  // ---- Save on Enter, cancel on Escape ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.blur();
      }
      if (e.key === 'Escape') {
        setTitle(subtask.title);
        inputRef.current?.blur();
      }
    },
    [subtask.title],
  );

  const isCompleted = subtask.is_completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2',
        'border border-transparent transition-colors duration-150',
        'hover:border-white/[0.06] hover:bg-white/[0.02]',
      )}
    >
      {/* ---- Custom Checkbox ---- */}
      <button
        type="button"
        onClick={() => onToggle(subtask.id)}
        className={cn(
          'relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors duration-150',
          isCompleted
            ? 'border-[var(--accent-base)] bg-[var(--accent-base)]'
            : 'border-white/[0.12] bg-white/[0.03] hover:border-white/[0.20] hover:bg-white/[0.06]',
        )}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        <motion.svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3 w-3 text-white"
          initial={false}
          animate={{
            scale: isCompleted ? 1 : 0,
            opacity: isCompleted ? 1 : 0,
          }}
          transition={checkSpring}
        >
          <motion.path
            d="M4 8l3 3 5-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              pathLength: isCompleted ? 1 : 0,
            }}
            transition={checkSpring}
          />
        </motion.svg>
      </button>

      {/* ---- Editable Title ---- */}
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex-1 min-w-0 bg-transparent text-sm outline-none transition-colors duration-150',
          'border-b border-transparent',
          'placeholder:text-neutral-600',
          isFocused && 'border-b-white/[0.12]',
          isCompleted
            ? 'text-neutral-500 line-through'
            : 'text-neutral-100',
        )}
        placeholder="Subtask title..."
      />

      {/* ---- Action Buttons (hover reveal) ---- */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {onPromote && !isCompleted && (
          <button
            type="button"
            onClick={() => onPromote(subtask.id)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg',
              'text-neutral-600 transition-all duration-150',
              'hover:bg-[var(--accent-base)]/10 hover:text-[var(--accent-base)]',
            )}
            aria-label="Promote to item"
            title="Promote to item"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(subtask.id)}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-lg',
            'text-neutral-600 transition-all duration-150',
            'hover:bg-white/[0.06] hover:text-neutral-300',
          )}
          aria-label="Delete subtask"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
