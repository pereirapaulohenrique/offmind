'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { Destination } from '@/types/database';

interface DroppableDestinationProps {
  destination: Destination;
  children: React.ReactNode;
  itemCount: number;
}

export function DroppableDestination({
  destination,
  children,
  itemCount,
}: DroppableDestinationProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: destination.id,
    data: {
      type: 'destination',
      destination,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg border p-3 transition-colors min-h-[200px]',
        isOver
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card/50'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
          style={{
            backgroundColor: `var(--destination-${destination.slug})15`,
          }}
        >
          {destination.icon}
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">
            {destination.name}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">{itemCount}</span>
      </div>

      {/* Items container */}
      <div className="flex-1 space-y-2">{children}</div>

      {/* Drop zone indicator */}
      {isOver && itemCount === 0 && (
        <div className="flex h-16 items-center justify-center rounded-md border-2 border-dashed border-primary/50 text-sm text-primary">
          Drop here
        </div>
      )}
    </div>
  );
}
