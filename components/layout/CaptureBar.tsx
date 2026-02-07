'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, CornerDownLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/stores/ui';
import { useItemsStore } from '@/stores/items';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CaptureBarProps {
  userId: string;
}

export function CaptureBar({ userId }: CaptureBarProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sidebarCollapsed, setCaptureBarFocused } = useUIStore();
  const { addItem } = useItemsStore();

  // Cmd+N to focus capture bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue || isLoading) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: userId,
          title: trimmedValue,
          layer: 'capture',
          source: 'web',
        } as any)
        .select()
        .single();

      if (error) throw error;

      if (data) addItem(data as any);
      setValue('');
      toast.success('Captured', {
        description: trimmedValue.length > 50 ? trimmedValue.slice(0, 50) + '...' : trimmedValue,
      });
      inputRef.current?.focus();
    } catch (error: any) {
      console.error('Error capturing:', error?.message || error);
      toast.error('Failed to capture');
    } finally {
      setIsLoading(false);
    }
  }, [value, isLoading, userId, addItem]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setValue('');
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setCaptureBarFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setCaptureBarFocused(false);
  };

  // Sidebar-aware left offset
  const sidebarOffset = sidebarCollapsed ? '68px' : '252px';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 pointer-events-none"
      style={{
        paddingLeft: `calc(${sidebarOffset} + 1rem)`,
        transition: 'padding-left 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      <div className="mx-auto max-w-2xl pointer-events-auto">
        <div
          className={`capture-input relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-150 ${
            isFocused
              ? 'border-[rgba(0,212,255,0.20)] bg-[var(--bg-surface)]/95 shadow-[var(--shadow-glow)]'
              : 'border-[rgba(0,212,255,0.06)] bg-[var(--bg-surface)]/80 shadow-[var(--shadow-card)]'
          } backdrop-blur-xl`}
        >
          <Plus
            className={`h-4.5 w-4.5 flex-shrink-0 transition-all duration-200 ${
              isFocused ? 'text-[var(--accent-base)] rotate-45' : 'text-[var(--text-muted)] rotate-0'
            }`}
          />

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Capture a thought, task, idea, link..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            disabled={isLoading}
            data-quick-capture
          />

          {!value.trim() && !isFocused && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-inset)] px-1.5 py-0.5 text-[10px] text-[var(--text-disabled)] font-mono">
              ⌘N
            </kbd>
          )}

          {value.trim() && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-7 gap-1.5 rounded-lg px-3 text-xs"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CornerDownLeft className="h-3 w-3" />
              )}
              Capture
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
