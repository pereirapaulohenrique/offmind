'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, CornerDownLeft, Loader2, ImageIcon, Mic, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/stores/ui';
import { useItemsStore } from '@/stores/items';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadAttachment } from '@/lib/supabase/storage';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { logActivity } from '@/lib/activity-log';
import { CaptureTargetPill } from '@/components/capture/CaptureTargetPill';
import { useCaptureTargetStore } from '@/stores/capture-target';
import { useCaptureContext } from '@/hooks/useCaptureContext';
import type { Attachment } from '@/types/database';

interface CaptureBarProps {
  userId: string;
  spaces?: Array<{ id: string; name: string; icon: string; color: string }>;
  projects?: Array<{ id: string; name: string; icon: string; color: string; space_id: string | null }>;
  pages?: Array<{ id: string; title: string; icon: string; project_id: string | null; space_id: string | null }>;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function CaptureBar({ userId, spaces = [], projects = [], pages = [] }: CaptureBarProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sidebarCollapsed, setCaptureBarFocused } = useUIStore();
  const { addItem } = useItemsStore();
  const { isRecording, duration, startRecording, stopRecording, audioBlob, clearRecording } = useAudioRecorder();
  const { captureTarget, resetExpiryTimer } = useCaptureTargetStore();

  // Auto-set capture target based on current route
  useCaptureContext({
    spaces,
    projects,
    pages: pages.map((p) => ({ id: p.id, title: p.title, icon: p.icon })),
  });

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

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();
          if (!file) return;

          if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be under 10MB');
            return;
          }

          if (imagePreview) URL.revokeObjectURL(imagePreview);

          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
          return;
        }
      }
    },
    [imagePreview],
  );

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      clearRecording();
      try {
        await startRecording();
      } catch {
        toast.error('Could not access microphone');
      }
    }
  };

  const removeAudio = () => {
    clearRecording();
  };

  const hasAttachments = !!imageFile || !!audioBlob;
  const canSubmit = value.trim() || hasAttachments;

  const handleSubmit = useCallback(async () => {
    const trimmedValue = value.trim();
    if ((!trimmedValue && !imageFile && !audioBlob) || isLoading) return;

    setIsLoading(true);
    try {
      // Upload attachments
      const attachments: Attachment[] = [];

      if (imageFile) {
        const att = await uploadAttachment(imageFile, userId);
        attachments.push(att);
      }

      if (audioBlob) {
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        const att = await uploadAttachment(audioFile, userId);
        att.duration = duration;
        attachments.push(att);
      }

      // Generate temporary title from first ~8 words, full text goes to notes
      const words = trimmedValue ? trimmedValue.split(/\s+/) : [];
      const isLongCapture = words.length > 8;
      const tempTitle = trimmedValue
        ? (isLongCapture ? words.slice(0, 8).join(' ') + '...' : trimmedValue)
        : (attachments.length > 0 ? `Capture with ${attachments.map(a => a.type).join(' & ')}` : 'Untitled');

      const supabase = createClient();
      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: userId,
          title: tempTitle,
          notes: trimmedValue || null,
          layer: 'capture',
          source: 'web',
          ...(attachments.length > 0 ? { attachments } : {}),
          ...(captureTarget?.type === 'project' ? { project_id: captureTarget.id } : {}),
          ...(captureTarget?.type === 'space' ? { space_id: captureTarget.id } : {}),
          ...(captureTarget?.type === 'page' ? { page_id: captureTarget.id } : {}),
        } as any)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        addItem(data as any);

        // Log activity (fire-and-forget)
        logActivity({
          itemId: (data as any).id,
          userId,
          action: 'created',
          metadata: { source: 'web' },
        });

        // For long captures, request AI-generated title in the background
        if (isLongCapture && trimmedValue) {
          fetch('/api/ai/generate-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: (data as any).id, text: trimmedValue }),
          }).catch(() => {
            // AI title generation is best-effort
          });
        }
      }

      // Reset expiry timer if in Direct mode
      if (captureTarget) resetExpiryTimer();

      setValue('');
      removeImage();
      clearRecording();
      if (inputRef.current) inputRef.current.style.height = '20px';
      toast.success(captureTarget ? `Captured → ${captureTarget.name}` : 'Captured', {
        description: trimmedValue
          ? (trimmedValue.length > 50 ? trimmedValue.slice(0, 50) + '...' : trimmedValue)
          : `${attachments.length} attachment${attachments.length !== 1 ? 's' : ''}`,
      });
      inputRef.current?.focus();
    } catch (error: any) {
      console.error('Error capturing:', error?.message || error);
      toast.error('Failed to capture');
    } finally {
      setIsLoading(false);
    }
  }, [value, isLoading, userId, addItem, imageFile, audioBlob, duration, clearRecording, captureTarget, resetExpiryTimer]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Shift+Enter inserts newline (default textarea behavior, no preventDefault needed)
    if (e.key === 'Escape') {
      setValue('');
      removeImage();
      clearRecording();
      if (inputRef.current) inputRef.current.style.height = '20px';
      inputRef.current?.blur();
    }
  };

  // Auto-resize textarea up to 5 lines
  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 20; // ~text-sm line height
    const maxHeight = lineHeight * 5;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setCaptureBarFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setCaptureBarFocused(false);
  };

  // Sidebar-aware left offset
  const sidebarOffset = sidebarCollapsed ? '72px' : '260px';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-5 pt-2 pointer-events-none"
      style={{
        paddingLeft: `calc(${sidebarOffset} + 1.25rem)`,
        transition: 'padding-left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div className="mx-auto max-w-2xl pointer-events-auto">
        {/* Attachment chips above input */}
        {hasAttachments && (
          <div className="mb-2 flex items-center gap-2 px-1">
            {imagePreview && (
              <div className="flex items-center gap-1.5 rounded-xl bg-[var(--bg-surface)]/90 border border-[var(--border-default)] px-2.5 py-1.5 backdrop-blur-xl">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-6 w-6 rounded-md object-cover"
                />
                <span className="text-xs text-[var(--text-secondary)] max-w-[100px] truncate">
                  {imageFile?.name}
                </span>
                <button
                  onClick={removeImage}
                  className="ml-0.5 rounded-full p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {audioBlob && !isRecording && (
              <div className="flex items-center gap-1.5 rounded-xl bg-[var(--bg-surface)]/90 border border-[var(--border-default)] px-2.5 py-1.5 backdrop-blur-xl">
                <Mic className="h-3.5 w-3.5 text-[var(--accent-base)]" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  {formatDuration(duration)}
                </span>
                <button
                  onClick={removeAudio}
                  className="ml-0.5 rounded-full p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className={`capture-input relative flex items-end gap-2 rounded-2xl border px-4 py-3 transition-all duration-300 ${
            isRecording
              ? 'border-red-500/40 bg-[var(--bg-surface)]/95 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
              : captureTarget
                ? 'border-[rgba(194,65,12,0.25)] bg-[var(--bg-surface)]/95 shadow-[0_0_0_1px_rgba(194,65,12,0.08)]'
                : isFocused
                  ? 'border-[var(--accent-border)] bg-[var(--bg-surface)]/95 shadow-[var(--shadow-glow)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)]/80 shadow-[var(--shadow-card)]'
          } backdrop-blur-2xl`}
        >
          <CaptureTargetPill spaces={spaces} projects={projects} pages={pages} />

          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isRecording ? `Recording... ${formatDuration(duration)}` : 'Capture a thought, task, idea, link...'}
            className="flex-1 resize-none bg-transparent text-sm leading-5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            style={{ height: '20px', maxHeight: '100px' }}
            rows={1}
            disabled={isLoading || isRecording}
            data-quick-capture
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          {/* Image attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isRecording}
            className="flex-shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-40"
            title="Attach image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          {/* Mic button */}
          <button
            onClick={handleMicToggle}
            disabled={isLoading}
            className={`flex-shrink-0 rounded-lg p-1.5 transition-colors ${
              isRecording
                ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20 animate-pulse'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            } disabled:opacity-40`}
            title={isRecording ? 'Stop recording' : 'Record audio'}
          >
            <Mic className="h-4 w-4" />
          </button>

          {!canSubmit && !isFocused && !isRecording && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-inset)] px-1.5 py-0.5 text-[10px] text-[var(--text-disabled)] font-mono">
              ⌘N
            </kbd>
          )}

          {canSubmit && !isRecording && (
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
