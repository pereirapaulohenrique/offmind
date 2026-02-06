'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, CornerDownLeft, Loader2 } from 'lucide-react';
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

  // Auto-focus on mount and on Cmd+N
  useEffect(() => {
    textareaRef.current?.focus();

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
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setValue('');
      textareaRef.current?.blur();
    }
  };

  return (
    <div className="capture-input rounded-lg border border-border bg-card transition-shadow">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Plus className="h-5 w-5" />
          </div>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            className="min-h-[52px] resize-none border-0 bg-transparent py-4 pl-12 pr-24 text-base focus-visible:ring-0"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading}
              className="gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CornerDownLeft className="h-4 w-4" />
              )}
              Capture
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
