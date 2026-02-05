'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QuickCaptureProps {
  onCapture: (title: string) => Promise<void>;
  isLoading?: boolean;
}

export function QuickCapture({ onCapture, isLoading = false }: QuickCaptureProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { quickCaptureOpen, setQuickCaptureOpen } = useUIStore();

  // Focus on Cmd+N
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue || isLoading) return;

    await onCapture(trimmedValue);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Clear on Escape
    if (e.key === 'Escape') {
      setValue('');
      textareaRef.current?.blur();
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-border bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ○
            </div>
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="min-h-[44px] resize-none py-3 pl-9 pr-20"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
              >
                {isLoading ? '...' : '↵ Add'}
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded border border-border px-1">Enter</kbd> to add,{' '}
          <kbd className="rounded border border-border px-1">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
