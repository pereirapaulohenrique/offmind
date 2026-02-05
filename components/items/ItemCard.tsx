'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  Inbox,
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ICON_MAP } from '@/components/icons';
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

  // Get destination icon component
  const DestIcon = destination?.icon ? ICON_MAP[destination.icon] || Inbox : null;

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
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: `var(--destination-${destination.slug})20`,
                  color: `var(--destination-${destination.slug})`,
                }}
              >
                {DestIcon && <DestIcon className="h-3 w-3" />}
                <span>{destination.name}</span>
              </span>
            )}

            {/* Scheduled time */}
            {item.scheduled_at && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
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

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* AI Suggest button - Always visible when enabled */}
          {showAIButton && onAISuggest && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAISuggest(item);
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get AI suggestion</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Move to destination - visible on hover */}
          {onMove && destinations && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 transition-opacity',
                    !isHovered && 'opacity-0 group-hover:opacity-100'
                  )}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {destinations.map((dest) => {
                  const Icon = ICON_MAP[dest.icon] || Inbox;
                  return (
                    <DropdownMenuItem
                      key={dest.id}
                      onClick={() => onMove(item.id, dest.id)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {dest.name}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* More options - visible on hover */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 transition-opacity',
                  !isHovered && 'opacity-0 group-hover:opacity-100'
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
