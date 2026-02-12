'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface RoutingNoteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string | null) => void;
  destinationName: string;
  fromDestinationName?: string;
}

export function RoutingNoteModal({
  open,
  onClose,
  onConfirm,
  destinationName,
  fromDestinationName,
}: RoutingNoteModalProps) {
  const [note, setNote] = useState('');

  const handleSkip = () => {
    onConfirm(null);
    setNote('');
  };

  const handleRoute = () => {
    onConfirm(note.trim() || null);
    setNote('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRoute();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Routing item</span>
          </DialogTitle>
          <DialogDescription>
            <span className="inline-flex items-center gap-1.5">
              {fromDestinationName && (
                <>
                  <span className="font-medium text-[var(--text-secondary)]">{fromDestinationName}</span>
                  <ArrowRight className="h-3 w-3 text-[var(--text-muted)]" />
                </>
              )}
              <span className="font-medium text-[var(--accent-base)]">{destinationName}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note about this routing (optional)..."
            className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-border)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-border)]"
            rows={3}
            autoFocus
          />
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            Press {navigator?.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to route with note
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip
          </Button>
          <Button size="sm" onClick={handleRoute}>
            Route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
