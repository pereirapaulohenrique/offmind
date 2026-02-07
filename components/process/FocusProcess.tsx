'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Trash2,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Item, Destination } from '@/types/database';

interface FocusProcessProps {
  items: Item[];
  destinations: Destination[];
  onMoveToDestination: (itemId: string, destinationId: string) => void;
  onScheduleItem: (itemId: string, scheduledAt: string) => void;
  onDeleteItem: (itemId: string) => void;
  onSuggestDestination?: (item: Item) => void;
}

export function FocusProcess({
  items,
  destinations,
  onMoveToDestination,
  onScheduleItem,
  onDeleteItem,
  onSuggestDestination,
}: FocusProcessProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const unprocessedItems = items.filter((item) => !item.destination_id);
  const currentItem = unprocessedItems[currentIndex];

  useEffect(() => {
    if (currentIndex >= unprocessedItems.length) {
      setCurrentIndex(Math.max(0, unprocessedItems.length - 1));
    }
  }, [unprocessedItems.length, currentIndex]);

  const handleMoveToDestination = useCallback(
    (destinationId: string) => {
      if (!currentItem) return;
      setDirection(1);
      onMoveToDestination(currentItem.id, destinationId);
    },
    [currentItem, onMoveToDestination]
  );

  const handleSchedule = useCallback(() => {
    if (!currentItem) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setDirection(1);
    onScheduleItem(currentItem.id, tomorrow.toISOString());
  }, [currentItem, onScheduleItem]);

  const handleSkip = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => Math.min(prev + 1, unprocessedItems.length - 1));
  }, [unprocessedItems.length]);

  const handleDelete = useCallback(() => {
    if (!currentItem) return;
    setDirection(-1);
    onDeleteItem(currentItem.id);
  }, [currentItem, onDeleteItem]);

  // Keyboard shortcuts: 1-9 for destinations, S for schedule, D for delete, → for skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentItem) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= destinations.length) {
        e.preventDefault();
        handleMoveToDestination(destinations[num - 1].id);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          handleSchedule();
          break;
        case 'd':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            handleDelete();
          }
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem, destinations, handleMoveToDestination, handleSchedule, handleDelete, handleSkip]);

  // All done state
  if (unprocessedItems.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--layer-commit-bg)]">
            <Sparkles className="h-7 w-7 text-[var(--layer-commit)]" />
          </div>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">All processed</h2>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            {items.length > 0
              ? `${items.length} item${items.length !== 1 ? 's' : ''} organized across destinations`
              : 'Nothing to process right now'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      {/* Progress indicator */}
      <div className="mb-8 text-sm text-[var(--text-muted)]">
        <span className="text-[var(--text-primary)] font-medium">{currentIndex + 1}</span>
        <span className="mx-1">/</span>
        <span>{unprocessedItems.length}</span>
        <span className="ml-2 text-[var(--text-disabled)]">to process</span>
      </div>

      {/* Current item card */}
      <AnimatePresence mode="wait">
        {currentItem && (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: direction * 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -40, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-[var(--layer-process-border)] bg-[var(--bg-surface)] p-6 shadow-lg shadow-black/10">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] mb-2">
                {currentItem.title}
              </h2>
              {currentItem.notes && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  {currentItem.notes}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-[var(--text-disabled)]">
                <span>{new Date(currentItem.created_at).toLocaleDateString()}</span>
                {currentItem.source && currentItem.source !== 'web' && (
                  <span className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5">
                    via {currentItem.source}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destination targets */}
      <div className="mt-8 w-full max-w-lg">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {destinations.map((dest, index) => {
            const Icon = ICON_MAP[dest.icon] || ICON_MAP['inbox'];
            const colorOption = COLOR_PALETTE.find((c) => c.value === dest.color);

            return (
              <button
                key={dest.id}
                onClick={() => handleMoveToDestination(dest.id)}
                className={cn(
                  'group flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 px-3.5 py-3 text-left transition-all duration-150',
                  'hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)] hover:shadow-sm'
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                    colorOption?.bgSubtle || 'bg-[var(--bg-hover)]'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5',
                      colorOption?.text || 'text-[var(--text-muted)]'
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--text-secondary)]">
                    {dest.name}
                  </span>
                </div>
                <kbd className="hidden font-mono text-[10px] text-[var(--text-disabled)] sm:inline-flex">
                  {index + 1}
                </kbd>
              </button>
            );
          })}
        </div>

        {/* Action row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSchedule}
              className="gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <Calendar className="h-3.5 w-3.5" />
              Schedule
              <kbd className="ml-1 font-mono text-[10px] text-[var(--text-disabled)]">S</kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5 text-[var(--text-muted)] hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
              <kbd className="ml-1 font-mono text-[10px] text-[var(--text-disabled)]">D</kbd>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Skip
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
