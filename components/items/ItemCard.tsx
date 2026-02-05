'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/dates';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Item, Destination } from '@/types/database';

interface ItemCardProps {
  item: Item;
  destination?: Destination;
  destinations?: Destination[];
  onUpdate?: (id: string, updates: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string, destinationId: string) => void;
  onClick?: () => void;
  onAISuggest?: (item: Item) => void;
  showAIButton?: boolean;
  compact?: boolean;
}

export function ItemCard({
  item,
  destination,
  destinations,
  onUpdate,
  onDelete,
  onMove,
  onClick,
  onAISuggest,
  showAIButton = false,
  compact = false,
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleComplete = async () => {
    if (onUpdate) {
      onUpdate(item.id, {
        is_completed: !item.is_completed,
        completed_at: item.is_completed ? null : new Date().toISOString(),
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-emphasis',
        item.is_completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={item.is_completed}
            onCheckedChange={handleComplete}
            className="h-5 w-5"
          />
        </div>

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onClick}
        >
          {/* Title */}
          <h3
            className={cn(
              'text-sm font-medium text-foreground',
              item.is_completed && 'line-through text-muted-foreground'
            )}
          >
            {item.title}
          </h3>

          {/* Notes preview */}
          {!compact && item.notes && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {item.notes}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {/* Destination badge */}
            {destination && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
                  `bg-${destination.color}-500/10 text-${destination.color}-500`
                )}
                style={{
                  backgroundColor: `var(--destination-${destination.slug})20`,
                  color: `var(--destination-${destination.slug})`,
                }}
              >
                <span>{destination.icon}</span>
                <span>{destination.name}</span>
              </span>
            )}

            {/* Scheduled time */}
            {item.scheduled_at && (
              <span className="inline-flex items-center gap-1">
                <span>📅</span>
                <span>{formatRelativeTime(item.scheduled_at)}</span>
              </span>
            )}

            {/* Separator */}
            {(destination || item.scheduled_at) && (
              <span className="text-border">•</span>
            )}

            {/* Created time */}
            <span>{formatRelativeTime(item.created_at)}</span>
          </div>
        </div>

        {/* Actions (visible on hover) */}
        <div
          className={cn(
            'flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100',
            isHovered && 'opacity-100'
          )}
        >
          {/* AI Suggest button */}
          {showAIButton && onAISuggest && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onAISuggest(item);
              }}
              title="Get AI suggestion"
            >
              <span className="text-sm">🤖</span>
            </Button>
          )}

          {/* Move to destination */}
          {onMove && destinations && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="text-sm">📤</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {destinations.map((dest) => (
                  <DropdownMenuItem
                    key={dest.id}
                    onClick={() => onMove(item.id, dest.id)}
                  >
                    <span className="mr-2">{dest.icon}</span>
                    {dest.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="text-sm">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <span className="mr-2">✏️</span>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <span className="mr-2">🗑️</span>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
