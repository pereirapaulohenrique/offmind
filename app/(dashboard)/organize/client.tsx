'use client';

import { useState, useCallback, useEffect } from 'react';
import { Columns3, List, LayoutGrid, Inbox } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useItemsStore } from '@/stores/items';
import { useUIStore } from '@/stores/ui';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { ColumnView } from '@/components/organize/ColumnView';
import { ListView } from '@/components/organize/ListView';
import { GridView } from '@/components/organize/GridView';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Item, Destination, Space, Project } from '@/types/database';

interface OrganizePageClientProps {
  initialItems: Item[];
  destinations: Destination[];
  spaces: Space[];
  projects: Project[];
  userId: string;
}

export function OrganizePageClient({
  initialItems,
  destinations,
  spaces,
  projects,
  userId,
}: OrganizePageClientProps) {
  const getSupabase = () => createClient();
  const { items, setItems, addItem, updateItem, removeItem, isLoading } = useItemsStore();
  const { organizeViewType, setOrganizeViewType } = useUIStore();

  // Initialize items from server
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel('items-organize')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item;
            if (newItem.destination_id && !newItem.is_completed && !newItem.archived_at) {
              addItem(newItem);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Item;
            if (updated.archived_at) {
              removeItem(updated.id);
            } else if (updated.destination_id && !updated.is_completed) {
              updateItem(updated);
            } else {
              removeItem(updated.id);
            }
          } else if (payload.eventType === 'DELETE') {
            removeItem(payload.old.id as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addItem, updateItem, removeItem]);

  // Filter to items with destinations that aren't completed
  const organizedItems = items.filter(
    (item) => item.destination_id && !item.is_completed
  );

  const totalCount = organizedItems.length;

  const viewButtons = [
    { type: 'columns' as const, icon: Columns3, label: 'Columns' },
    { type: 'list' as const, icon: List, label: 'List' },
    { type: 'grid' as const, icon: LayoutGrid, label: 'Grid' },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="flex-shrink-0 px-6 py-5 sm:px-8"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1
              className="text-2xl font-semibold text-[var(--text-primary)]"
              style={{ letterSpacing: '-0.02em' }}
            >
              Organize
            </h1>
            <p className="hidden text-sm text-[var(--text-muted)] sm:block">
              All your items by destination, at a glance.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-xl bg-[var(--bg-inset)] shadow-[var(--shadow-sm)] border border-[var(--border-subtle)]">
              {viewButtons.map((btn, i) => (
                <Button
                  key={btn.type}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    i === 0 && 'rounded-r-none rounded-l-xl',
                    i === viewButtons.length - 1 && 'rounded-l-none rounded-r-xl',
                    i > 0 && i < viewButtons.length - 1 && 'rounded-none',
                    organizeViewType === btn.type &&
                      'bg-[var(--layer-process-bg)] text-[var(--layer-process)]'
                  )}
                  onClick={() => setOrganizeViewType(btn.type)}
                  title={`${btn.label} view`}
                >
                  <btn.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Item count */}
            {totalCount > 0 && (
              <span className="rounded-full bg-[var(--layer-process-bg)] border border-[var(--layer-process-border)] px-3 py-1 text-sm font-medium text-[var(--layer-process)]">
                {totalCount} item{totalCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <LoadingState count={6} type="card" />
        ) : organizedItems.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing organized yet"
            description="Process items from your Inbox to see them organized by destination here."
            variant="process"
            action={{
              label: 'Go to Inbox',
              href: '/inbox',
            }}
          />
        ) : organizeViewType === 'columns' ? (
          <ColumnView
            items={organizedItems}
            destinations={destinations}
            spaces={spaces}
            projects={projects}
          />
        ) : organizeViewType === 'list' ? (
          <ListView
            items={organizedItems}
            destinations={destinations}
            spaces={spaces}
            projects={projects}
          />
        ) : (
          <GridView
            items={organizedItems}
            destinations={destinations}
            spaces={spaces}
            projects={projects}
          />
        )}
      </div>
    </div>
  );
}
