'use client';

import { useState } from 'react';
import { Inbox, Plus, Link2, X, ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { Item } from '@/types/database';

interface PageCaptureQueueProps {
  items: Item[];
  onAppendItem: (item: Item) => void;
  onAppendAll: () => void;
  onLinkItem: (item: Item) => void;
  onDismissItem: (item: Item) => void;
}

export function PageCaptureQueue({
  items,
  onAppendItem,
  onAppendAll,
  onLinkItem,
  onDismissItem,
}: PageCaptureQueueProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(109,174,247,0.1)] border border-[rgba(109,174,247,0.2)] px-2.5 py-1 text-xs font-medium text-[#6daef7] hover:bg-[rgba(109,174,247,0.15)] transition-colors"
        >
          <Inbox className="h-3 w-3" />
          {items.length} new
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-80 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Captured to this page
          </span>
          {items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px] text-[#6daef7] hover:text-[#6daef7] hover:bg-[rgba(109,174,247,0.1)]"
              onClick={() => {
                onAppendAll();
                setOpen(false);
              }}
            >
              <Plus className="h-3 w-3" />
              Append all
            </Button>
          )}
        </div>

        <div className="max-h-[280px] overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-2 border-b border-[var(--border-subtle)] px-3 py-2.5 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-primary)] truncate">
                  {item.title}
                </p>
                {item.notes && item.notes !== item.title && (
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)] truncate">
                    {item.notes.slice(0, 80)}
                  </p>
                )}
                <p className="mt-0.5 text-[10px] text-[var(--text-disabled)]">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </div>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAppendItem(item)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:text-[#6daef7] hover:bg-[rgba(109,174,247,0.1)] transition-colors"
                  title="Append to page"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onLinkItem(item)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                  title="Move to inbox"
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDismissItem(item)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                  title="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
