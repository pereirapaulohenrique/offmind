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
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { ItemActivity } from '@/types/database';

interface ActivityRailProps {
  itemId: string;
}

const ACTION_CONFIG: Record<
  string,
  { icon: typeof Inbox; label: string; color: string; bg: string }
> = {
  created: {
    icon: Inbox,
    label: 'Captured',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
  },
  routed: {
    icon: ArrowRightLeft,
    label: 'Routed',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
  scheduled: {
    icon: Calendar,
    label: 'Scheduled',
    color: 'text-green-400',
    bg: 'bg-green-500/15',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
  },
  uncompleted: {
    icon: RotateCcw,
    label: 'Reopened',
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
  },
  archived: {
    icon: Archive,
    label: 'Archived',
    color: 'text-gray-400',
    bg: 'bg-gray-500/15',
  },
  unarchived: {
    icon: ArchiveRestore,
    label: 'Restored',
    color: 'text-gray-400',
    bg: 'bg-gray-500/15',
  },
  field_changed: {
    icon: Pencil,
    label: 'Updated',
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
  },
  note_added: {
    icon: MessageSquarePlus,
    label: 'Note added',
    color: 'text-blue-300',
    bg: 'bg-blue-400/15',
  },
};

function getActionLabel(activity: ItemActivity): string {
  const meta = activity.metadata as Record<string, any> | null;
  switch (activity.action) {
    case 'created':
      return meta?.source ? `Captured via ${meta.source}` : 'Captured';
    case 'routed':
      if (meta?.from_destination && meta?.to_destination) {
        return `${meta.from_destination} → ${meta.to_destination}`;
      }
      return meta?.to_destination ? `Moved to ${meta.to_destination}` : 'Routed';
    case 'scheduled':
      return meta?.scheduled_at
        ? `Scheduled for ${new Date(meta.scheduled_at).toLocaleDateString()}`
        : 'Scheduled';
    case 'completed':
      return 'Marked complete';
    case 'uncompleted':
      return 'Reopened';
    case 'archived':
      return 'Archived';
    case 'unarchived':
      return 'Restored from archive';
    case 'field_changed':
      return meta?.field ? `Updated ${meta.field}` : 'Updated';
    case 'note_added':
      return 'Note added';
    default:
      return activity.action;
  }
}

export function ActivityRail({ itemId }: ActivityRailProps) {
  const [expanded, setExpanded] = useState(false);
  const [activities, setActivities] = useState<ItemActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      console.error('ActivityRail: failed to load activities', err);
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <aside
      className={cn(
        'fixed top-[57px] bottom-[57px] left-0 z-40 flex-col border-r border-white/[0.06] transition-all duration-300 overflow-hidden',
        'hidden lg:flex',
        expanded
          ? 'w-[280px] bg-[#1e1b18] shadow-[4px_0_24px_rgba(0,0,0,0.3)]'
          : 'w-[44px] bg-[#1e1b18]/60',
      )}
    >
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-3 border-b border-white/[0.06] text-neutral-500 hover:text-neutral-300 transition-colors flex-shrink-0"
        title="Toggle activity history"
      >
        <Clock className="h-[18px] w-[18px] flex-shrink-0" />
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-opacity duration-200',
            expanded ? 'opacity-100' : 'opacity-0',
          )}
        >
          Activity
        </span>
      </button>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {isLoading ? (
          <div className="px-3 py-4 text-[10px] text-neutral-600">Loading…</div>
        ) : activities.length === 0 ? (
          <div className="px-3 py-4 text-[10px] text-neutral-600">No activity</div>
        ) : (
          activities.map((activity, index) => {
            const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG.field_changed;
            const Icon = config.icon;
            const label = getActionLabel(activity);
            const time = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

            return (
              <div
                key={activity.id}
                className="relative flex items-start gap-2.5 px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
                title={expanded ? undefined : `${label} — ${time}`}
              >
                {/* Connecting line */}
                {index < activities.length - 1 && (
                  <div className="absolute left-[21px] top-[30px] bottom-[-2px] w-px bg-white/[0.06]" />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                    config.bg,
                  )}
                >
                  <Icon className={cn('h-3 w-3', config.color)} />
                </div>

                {/* Detail (visible only when expanded) */}
                <div
                  className={cn(
                    'flex-1 min-w-0 transition-opacity duration-200',
                    expanded ? 'opacity-100' : 'opacity-0 pointer-events-none',
                  )}
                >
                  <div className="text-xs text-neutral-400 leading-snug">
                    {label}
                  </div>
                  <div className="text-[10px] text-neutral-600 mt-0.5">
                    {time}
                  </div>
                  {activity.note && (
                    <div className="mt-1 rounded-md bg-white/[0.03] px-2 py-1 text-[11px] text-neutral-500 italic">
                      {activity.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
