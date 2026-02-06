'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, CornerDownLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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

  // ⌘N to focus capture bar
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
      const { error } = await supabase
        .from('items')
        .insert({
          user_id: userId,
          title: trimmedValue,
          layer: 'capture',
          source: 'web',
        } as any);

      if (error) throw error;

      setValue('');
      toast.success('Captured');
      inputRef.current?.focus();
    } catch (error: any) {
      console.error('Error capturing:', error?.message || error);
      toast.error('Failed to capture');
    } finally {
      setIsLoading(false);
    }
  }, [value, isLoading, userId]);

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

  return (
    <div className="fixed bottom-0 left-14 right-0 z-30 px-6 pb-4 pt-2 pointer-events-none">
      <div className="mx-auto max-w-2xl pointer-events-auto">
        <div
          className={`capture-input flex items-center gap-3 rounded-2xl border bg-card/90 backdrop-blur-xl px-4 py-2.5 shadow-lg shadow-black/20 transition-all duration-200 ${
            isFocused ? 'border-primary/30' : 'border-border/40'
          }`}
        >
          <Plus
            className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${
              isFocused ? 'text-primary' : 'text-muted-foreground/50'
            }`}
          />

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Capture a thought..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            disabled={isLoading}
            data-quick-capture
          />

          {!value.trim() && !isFocused && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/40 bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground/40">
              ⌘N
            </kbd>
          )}

          {value.trim() && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-7 gap-1 rounded-lg px-3 text-xs"
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
