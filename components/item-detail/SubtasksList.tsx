'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { SubtaskItem } from './SubtaskItem';
import type { Subtask } from '@/types/database';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SubtasksListProps {
  itemId: string;
  userId: string;
  initialSubtasks: Subtask[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a temporary client-side ID for optimistic inserts. */
function tempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SubtasksList({ itemId, userId, initialSubtasks }: SubtasksListProps) {
  // ---- Local state ----
  const [subtasks, setSubtasks] = useState<Subtask[]>(
    () => [...initialSubtasks].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // ---- Sync when initialSubtasks prop changes (e.g. parent re-fetch) ----
  useEffect(() => {
    setSubtasks([...initialSubtasks].sort((a, b) => a.sort_order - b.sort_order));
  }, [initialSubtasks]);

  // ---- Real-time subscription ----
  useEffect(() => {
    const channel = supabase
      .channel(`subtasks:${itemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subtasks',
          filter: `item_id=eq.${itemId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            const inserted = newRecord as Subtask;
            setSubtasks((prev) => {
              // Replace a temp record if it exists (same title and sort_order range)
              // or append if this is a genuinely new row
              const withoutTemp = prev.filter(
                (s) => !s.id.startsWith('temp-') || s.title !== inserted.title,
              );
              // Avoid duplicate if already present (e.g. our own optimistic insert was already replaced)
              if (withoutTemp.some((s) => s.id === inserted.id)) return withoutTemp;
              return [...withoutTemp, inserted].sort((a, b) => a.sort_order - b.sort_order);
            });
          }

          if (eventType === 'UPDATE') {
            const updated = newRecord as Subtask;
            setSubtasks((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s)),
            );
          }

          if (eventType === 'DELETE') {
            const deletedId = (oldRecord as { id: string }).id;
            setSubtasks((prev) => prev.filter((s) => s.id !== deletedId));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, supabase]);

  // --------------------------------------------------------------------------
  // CRUD Operations
  // --------------------------------------------------------------------------

  // ---- Add subtask ----
  const handleAdd = useCallback(async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setIsAdding(true);

    // Optimistic insert with temp id
    const now = new Date().toISOString();
    const sortOrder = subtasks.length;
    const optimistic: Subtask = {
      id: tempId(),
      item_id: itemId,
      user_id: userId,
      title: trimmed,
      is_completed: false,
      completed_at: null,
      sort_order: sortOrder,
      created_at: now,
      updated_at: now,
    };

    setSubtasks((prev) => [...prev, optimistic]);
    setNewTitle('');

    // Keep input focused for rapid entry
    requestAnimationFrame(() => inputRef.current?.focus());

    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          item_id: itemId,
          user_id: userId,
          title: trimmed,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic entry with server record
      if (data) {
        const inserted = data as Subtask;
        setSubtasks((prev) =>
          prev
            .map((s) => (s.id === optimistic.id ? inserted : s))
            .sort((a, b) => a.sort_order - b.sort_order),
        );
      }
    } catch (err) {
      console.error('SubtasksList: add failed', err);
      // Roll back optimistic insert
      setSubtasks((prev) => prev.filter((s) => s.id !== optimistic.id));
      toast.error('Failed to add subtask');
    } finally {
      setIsAdding(false);
    }
  }, [newTitle, subtasks.length, itemId, userId, supabase]);

  // ---- Toggle completion ----
  const handleToggle = useCallback(
    async (id: string) => {
      const target = subtasks.find((s) => s.id === id);
      if (!target) return;

      const nextCompleted = !target.is_completed;
      const now = new Date().toISOString();

      // Optimistic toggle
      setSubtasks((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                is_completed: nextCompleted,
                completed_at: nextCompleted ? now : null,
                updated_at: now,
              }
            : s,
        ),
      );

      try {
        const { error } = await supabase
          .from('subtasks')
          .update({
            is_completed: nextCompleted,
            completed_at: nextCompleted ? now : null,
            updated_at: now,
          })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('SubtasksList: toggle failed', err);
        // Revert
        setSubtasks((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  is_completed: target.is_completed,
                  completed_at: target.completed_at,
                  updated_at: target.updated_at,
                }
              : s,
          ),
        );
        toast.error('Failed to update subtask');
      }
    },
    [subtasks, supabase],
  );

  // ---- Update title ----
  const handleUpdate = useCallback(
    async (id: string, title: string) => {
      const target = subtasks.find((s) => s.id === id);
      if (!target || target.title === title) return;

      const now = new Date().toISOString();

      // Optimistic update
      setSubtasks((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, title, updated_at: now } : s,
        ),
      );

      try {
        const { error } = await supabase
          .from('subtasks')
          .update({ title, updated_at: now })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('SubtasksList: update title failed', err);
        // Revert
        setSubtasks((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, title: target.title, updated_at: target.updated_at }
              : s,
          ),
        );
        toast.error('Failed to update subtask');
      }
    },
    [subtasks, supabase],
  );

  // ---- Delete ----
  const handleDelete = useCallback(
    async (id: string) => {
      const target = subtasks.find((s) => s.id === id);
      if (!target) return;

      // Optimistic removal
      setSubtasks((prev) => prev.filter((s) => s.id !== id));

      // Don't attempt server delete for temp (un-synced) rows
      if (id.startsWith('temp-')) return;

      try {
        const { error } = await supabase
          .from('subtasks')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('SubtasksList: delete failed', err);
        // Revert
        setSubtasks((prev) =>
          [...prev, target].sort((a, b) => a.sort_order - b.sort_order),
        );
        toast.error('Failed to delete subtask');
      }
    },
    [subtasks, supabase],
  );

  // ---- Input key handler ----
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
      if (e.key === 'Escape') {
        setNewTitle('');
        inputRef.current?.blur();
      }
    },
    [handleAdd],
  );

  // --------------------------------------------------------------------------
  // Derived values
  // --------------------------------------------------------------------------

  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.is_completed).length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-3">
      {/* ---- Section header ---- */}
      <div className="flex items-center gap-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Subtasks
        </h3>
        {total > 0 && (
          <span
            className={cn(
              'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5',
              'text-[10px] font-semibold tabular-nums',
              completed === total && total > 0
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-white/[0.06] text-neutral-400',
            )}
          >
            {total}
          </span>
        )}
      </div>

      {/* ---- Progress bar ---- */}
      {total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                completed === total && total > 0
                  ? 'bg-emerald-500'
                  : 'bg-[#c2410c]',
              )}
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-mono text-neutral-500 tabular-nums">
            {completed}/{total}
          </span>
        </div>
      )}

      {/* ---- Subtask list ---- */}
      <div
        className={cn(
          'rounded-2xl border border-white/[0.06] bg-white/[0.02]',
          total === 0 && !newTitle && 'border-dashed',
        )}
      >
        <AnimatePresence initial={false}>
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>

        {/* ---- Add subtask input ---- */}
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2',
            total > 0 && 'border-t border-white/[0.04]',
          )}
        >
          <div
            className={cn(
              'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md',
              'text-neutral-600',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Add a subtask..."
            disabled={isAdding}
            className={cn(
              'flex-1 min-w-0 bg-transparent text-sm text-neutral-100 outline-none',
              'placeholder:text-neutral-600',
              'disabled:opacity-50',
            )}
          />

          {/* Submit button — visible when there is text */}
          {newTitle.trim() && (
            <motion.button
              type="button"
              onClick={handleAdd}
              disabled={isAdding}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg',
                'bg-[#c2410c] text-white transition-colors',
                'hover:bg-[#c2410c]/80',
                'disabled:opacity-50',
              )}
              aria-label="Add subtask"
            >
              <Plus className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
