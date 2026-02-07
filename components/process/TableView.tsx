'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Inbox,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/dates';
import { ICON_MAP, COLOR_PALETTE } from '@/components/icons';
import type { Item, Destination } from '@/types/database';

interface TableViewProps {
  items: Item[];
  destinations: Destination[];
  onMoveToDestination: (itemId: string, destinationId: string) => void;
  onUpdateItem: (id: string, updates: Partial<Item>) => void;
  onDeleteItem: (id: string) => void;
  onScheduleItem: (itemId: string, scheduledAt: string) => void;
  onItemClick?: (item: Item) => void;
}

type SortField = 'title' | 'destination' | 'created_at' | 'source';
type SortDirection = 'asc' | 'desc';

export function TableView({
  items,
  destinations,
  onMoveToDestination,
  onUpdateItem,
  onDeleteItem,
  onScheduleItem,
  onItemClick,
}: TableViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'destination': {
          const destA = destinations.find((d) => d.id === a.destination_id)?.name || '';
          const destB = destinations.find((d) => d.id === b.destination_id)?.name || '';
          cmp = destA.localeCompare(destB);
          break;
        }
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'source':
          cmp = (a.source || '').localeCompare(b.source || '');
          break;
      }
      return sortDirection === 'desc' ? -cmp : cmp;
    });
  }, [items, sortField, sortDirection, destinations]);

  const allSelected = selectedIds.size === items.length && items.length > 0;
  const someSelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-default)]">
            <th className="w-10 px-3 py-2.5">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                className="h-4 w-4"
              />
            </th>
            <th className="text-left">
              <button
                onClick={() => handleSort('title')}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Title
                <SortIcon field="title" />
              </button>
            </th>
            <th className="text-left w-40">
              <button
                onClick={() => handleSort('destination')}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Destination
                <SortIcon field="destination" />
              </button>
            </th>
            <th className="text-left w-28">
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Created
                <SortIcon field="created_at" />
              </button>
            </th>
            <th className="text-left w-20">
              <button
                onClick={() => handleSort('source')}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Source
                <SortIcon field="source" />
              </button>
            </th>
            <th className="w-20 px-3 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => {
            const destination = destinations.find((d) => d.id === item.destination_id);
            const DestIcon = destination?.icon
              ? ICON_MAP[destination.icon] || Inbox
              : null;
            const colorOption = destination?.color
              ? COLOR_PALETTE.find((c) => c.value === destination.color)
              : null;
            const isSelected = selectedIds.has(item.id);

            return (
              <tr
                key={item.id}
                className={cn(
                  'group border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-hover)]',
                  isSelected && 'bg-[var(--accent-subtle)]',
                  item.is_completed && 'opacity-50'
                )}
              >
                <td className="px-3 py-2.5">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onItemClick?.(item)}
                    className="flex items-center gap-2 text-left"
                  >
                    <span
                      className={cn(
                        'text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-base)] transition-colors',
                        item.is_completed && 'completed-text'
                      )}
                    >
                      {item.title}
                    </span>
                  </button>
                  {item.notes && (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
                      {item.notes}
                    </p>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-[var(--bg-active)]">
                        {destination ? (
                          <>
                            {DestIcon && (
                              <DestIcon
                                className={cn(
                                  'h-3 w-3',
                                  colorOption?.text || 'text-[var(--text-muted)]'
                                )}
                              />
                            )}
                            <span className="text-[var(--text-secondary)]">
                              {destination.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-[var(--text-disabled)]">None</span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {destinations.map((dest) => {
                        const Icon = ICON_MAP[dest.icon] || Inbox;
                        return (
                          <DropdownMenuItem
                            key={dest.id}
                            onClick={() => onMoveToDestination(item.id, dest.id)}
                            className={
                              item.destination_id === dest.id
                                ? 'bg-[var(--accent-subtle)]'
                                : ''
                            }
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {dest.name}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-[var(--text-disabled)] capitalize">
                    {item.source || 'web'}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        onUpdateItem(item.id, {
                          is_completed: !item.is_completed,
                          completed_at: item.is_completed
                            ? null
                            : new Date().toISOString(),
                        })
                      }
                      title={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {item.is_completed ? (
                        <RotateCcw className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(9, 0, 0, 0);
                        onScheduleItem(item.id, tomorrow.toISOString());
                      }}
                      title="Schedule for tomorrow"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDeleteItem(item.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
