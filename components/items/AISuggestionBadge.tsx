'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Destination } from '@/types/database';

interface AISuggestionBadgeProps {
  destination: Destination | null;
  destinationSlug: string;
  confidence: number;
  reasoning?: string;
  onAccept: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export function AISuggestionBadge({
  destination,
  destinationSlug,
  confidence,
  reasoning,
  onAccept,
  onDismiss,
  isLoading = false,
}: AISuggestionBadgeProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
      >
        <span className="text-sm">🤖</span>
        <span className="text-sm text-muted-foreground animate-pulse">
          Analyzing...
        </span>
      </motion.div>
    );
  }

  const confidenceLevel =
    confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-lg border border-primary/30 bg-primary/5 p-3"
    >
      <div className="flex items-start gap-3">
        {/* AI icon */}
        <span className="text-lg">🤖</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              AI suggests:
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm"
              style={{
                backgroundColor: `var(--destination-${destinationSlug})20`,
                color: `var(--destination-${destinationSlug})`,
              }}
            >
              {destination?.icon || '📋'}
              <span>{destination?.name || destinationSlug}</span>
            </span>
            <span
              className={cn(
                'text-xs',
                confidenceLevel === 'high' && 'text-green-500',
                confidenceLevel === 'medium' && 'text-yellow-500',
                confidenceLevel === 'low' && 'text-muted-foreground'
              )}
            >
              {Math.round(confidence * 100)}% confident
            </span>
          </div>

          {reasoning && (
            <p className="mt-1 text-xs text-muted-foreground">{reasoning}</p>
          )}

          {/* Actions */}
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="default" onClick={onAccept}>
              Accept
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
