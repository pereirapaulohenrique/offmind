'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Inbox,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  RotateCcw,
  Archive,
  ArchiveRestore,
  Pencil,
  MessageSquarePlus,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { ItemActivity } from '@/types/database';

interface ItemActivityTimelineProps {
  itemId: string;
}

const ACTION_CONFIG: Record<
  string,
  { icon: typeof Inbox; label: string; color: string; dotColor: string }
> = {
  created: {
    icon: Inbox,
    label: 'Captured',
    color: 'text-blue-400',
    dotColor: 'bg-blue-400',
  },
  routed: {
    icon: ArrowRightLeft,
    label: 'Routed',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
  },
  scheduled: {
    icon: Calendar,
    label: 'Scheduled',
    color: 'text-green-400',
    dotColor: 'bg-green-400',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  uncompleted: {
    icon: RotateCcw,
    label: 'Reopened',
    color: 'text-orange-400',
    dotColor: 'bg-orange-400',
  },
  archived: {
    icon: Archive,
    label: 'Archived',
    color: 'text-gray-400',
    dotColor: 'bg-gray-400',
  },
  unarchived: {
    icon: ArchiveRestore,
    label: 'Restored',
    color: 'text-gray-400',
    dotColor: 'bg-gray-400',
  },
  field_changed: {
    icon: Pencil,
    label: 'Updated',
    color: 'text-purple-400',
    dotColor: 'bg-purple-400',
  },
  note_added: {
    icon: MessageSquarePlus,
    label: 'Note added',
    color: 'text-blue-300',
    dotColor: 'bg-blue-300',
  },
};

function getActionLabel(activity: ItemActivity): string {
  const meta = activity.metadata as Record<string, any> | null;
  switch (activity.action) {
    case 'created':
      return meta?.source ? `Captured via ${meta.source}` : 'Captured';
    case 'routed':
      if (meta?.from_destination && meta?.to_destination) {
        return `Moved from ${meta.from_destination} to ${meta.to_destination}`;
      }
      return meta?.to_destination ? `Moved to ${meta.to_destination}` : 'Routed';
    case 'scheduled':
      return meta?.scheduled_at ? `Scheduled for ${new Date(meta.scheduled_at).toLocaleDateString()}` : 'Scheduled';
    case 'completed':
      return 'Marked complete';
    case 'uncompleted':
      return 'Reopened';
    case 'archived':
      return 'Archived';
    case 'unarchived':
      return 'Restored from archive';
    case 'field_changed':
      if (meta?.field) {
        return `Updated ${meta.field}`;
      }
      return 'Updated';
    case 'note_added':
      return 'Note added';
    default:
      return activity.action;
  }
}

const INITIAL_SHOW = 5;

export function ItemActivityTimeline({ itemId }: ItemActivityTimelineProps) {
  const [activities, setActivities] = useState<ItemActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const supabaseRef = useRef(createClient());

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseRef.current
        .from('item_activities')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities((data as ItemActivity[]) || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const visibleActivities = showAll ? activities : activities.slice(0, INITIAL_SHOW);
  const hasMore = activities.length > INITIAL_SHOW;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--text-muted)]" />
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Activity</h3>
        </div>
        <div className="flex items-center gap-2 py-4 text-xs text-[var(--text-muted)]">
          Loading activity...
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--text-muted)]" />
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Activity</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] py-2">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">Activity</h3>
        <span className="text-xs text-[var(--text-muted)]">({activities.length})</span>
      </div>

      <div className="relative pl-4">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border-subtle)]" />

        <div className="space-y-0">
          {visibleActivities.map((activity, index) => {
            const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG.field_changed;
            const Icon = config.icon;
            const isLast = index === visibleActivities.length - 1;

            return (
              <div key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Dot */}
                <div
                  className={`relative z-10 mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${config.dotColor} ring-2 ring-[var(--bg-primary)]`}
                  style={{ marginLeft: '-1px' }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0 -mt-0.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${config.color}`} />
                    <span className="text-xs text-[var(--text-primary)]">
                      {getActionLabel(activity)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] ml-auto flex-shrink-0">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Optional note */}
                  {activity.note && (
                    <div className="mt-1 ml-5.5 rounded-md bg-[var(--bg-inset)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      {activity.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more / less */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 ml-2 mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform ${showAll ? 'rotate-180' : ''}`}
            />
            {showAll ? 'Show less' : `Show all (${activities.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
