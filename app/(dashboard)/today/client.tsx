'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Inbox,
  ListTodo,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Brain,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  FileText,
  Activity,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { createClient } from '@/lib/supabase/client';
import type { Item, Destination } from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TodayPageClientProps {
  profile: any;
  showOnboarding: boolean;
  counts: {
    inbox: number;
    backlog: number;
    waiting: number;
  };
  overdueItems: Item[];
  todayItems: Item[];
  completedToday: Item[];
  somedayItems: Item[];
  allActiveItems: Item[];
  staleItems: Item[];
  destinations: Destination[];
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 28 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 28 },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatScheduledTime(item: Item): string {
  if (item.is_all_day) return 'All day';
  if (!item.scheduled_at) return 'All day';
  return format(new Date(item.scheduled_at), 'HH:mm');
}

function formatOverdueDistance(scheduledAt: string): string {
  return formatDistanceToNow(new Date(scheduledAt), { addSuffix: true });
}

function formatAge(createdAt: string): string {
  const days = differenceInDays(new Date(), new Date(createdAt));
  if (days === 0) return 'today';
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

function getDestinationName(
  destinationId: string | null,
  destinations: Destination[],
): string | null {
  if (!destinationId) return null;
  const dest = destinations.find((d) => d.id === destinationId);
  return dest?.name || null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Compact status bar replacing the 3 big cards */
function StatusBar({
  counts,
  onNavigate,
}: {
  counts: { inbox: number; backlog: number; waiting: number };
  onNavigate: (path: string) => void;
}) {
  const segments = [
    { key: 'inbox', label: 'Inbox', count: counts.inbox, path: '/inbox', icon: Inbox },
    { key: 'backlog', label: 'Backlog', count: counts.backlog, path: '/backlog', icon: ListTodo },
    { key: 'waiting', label: 'Waiting', count: counts.waiting, path: '/waiting-for', icon: Clock },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center rounded-none border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
    >
      {segments.map((seg, i) => (
        <button
          key={seg.key}
          onClick={() => onNavigate(seg.path)}
          className={cn(
            'group flex flex-1 items-center justify-center gap-2.5 py-3',
            'transition-all duration-150',
            'hover:bg-[var(--bg-hover)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
            i < segments.length - 1 && 'border-r border-[var(--border-subtle)]',
          )}
        >
          <seg.icon className="h-4 w-4 text-[var(--text-disabled)]" />
          <span className="text-sm text-[var(--text-muted)]">{seg.label}</span>
          <span
            className={cn(
              'text-sm tabular-nums',
              seg.count > 0
                ? 'font-bold text-[var(--text-primary)]'
                : 'text-[var(--text-disabled)]',
            )}
          >
            {seg.count}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

/** Hero item for Today's Focus — large, warm, numbered */
function FocusItem({
  item,
  index,
  destinations,
  trailing,
  onClick,
}: {
  item: Item;
  index: number;
  destinations?: Destination[];
  trailing?: React.ReactNode;
  onClick: () => void;
}) {
  const destName = destinations ? getDestinationName(item.destination_id, destinations) : null;
  const hasNotes = !!item.notes;

  return (
    <motion.button
      variants={listItemVariants}
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-4 px-5 py-4 text-left',
        'transition-all duration-150',
        'hover:bg-[rgba(194,122,90,0.04)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
      )}
    >
      {/* Warm numbered circle */}
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(194,122,90,0.10)] text-[12px] font-bold tabular-nums text-[var(--accent-base)]">
        {index}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="truncate text-[16px] font-medium leading-snug text-[var(--text-primary)]">
            {item.title}
          </span>
          {trailing && (
            <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">{trailing}</span>
          )}
        </div>

        {(destName || hasNotes) && (
          <div className="mt-1.5 flex items-center gap-2">
            {destName && (
              <span className="px-1.5 py-px text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] bg-[rgba(194,122,90,0.06)]">
                {destName}
              </span>
            )}
            {hasNotes && (
              <FileText className="h-3 w-3 text-[var(--text-disabled)]" />
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}

/** Compact item for Overdue — tight, urgent */
function CompactItem({
  item,
  trailing,
  destinations,
  showAge = false,
  onClick,
}: {
  item: Item;
  trailing?: React.ReactNode;
  destinations?: Destination[];
  showAge?: boolean;
  onClick: () => void;
}) {
  const destName = destinations ? getDestinationName(item.destination_id, destinations) : null;
  const age = showAge ? formatAge(item.created_at) : null;

  return (
    <motion.button
      variants={listItemVariants}
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-2.5 px-4 py-2 text-left',
        'transition-all duration-150',
        'hover:bg-[rgba(180,83,9,0.03)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
      )}
    >
      <span className="truncate text-sm font-medium text-[var(--text-primary)]">
        {item.title}
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {destName && (
          <span className="px-1.5 py-px text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-hover)]">
            {destName}
          </span>
        )}
        {age && age !== 'today' && (
          <span className="text-[10px] tabular-nums text-[var(--text-disabled)]">{age}</span>
        )}
        {trailing && (
          <span className="rounded-sm bg-amber-50 px-1.5 py-px text-[11px] font-medium tabular-nums text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            {trailing}
          </span>
        )}
      </div>
    </motion.button>
  );
}

/** Dense item for In Motion — minimal chrome, stronger destination tag */
function DenseItem({
  item,
  destinations,
  showAge = false,
  onClick,
}: {
  item: Item;
  destinations?: Destination[];
  showAge?: boolean;
  onClick: () => void;
}) {
  const destName = destinations ? getDestinationName(item.destination_id, destinations) : null;
  const hasNotes = !!item.notes;
  const age = showAge ? formatAge(item.created_at) : null;

  return (
    <motion.button
      variants={listItemVariants}
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-2.5 px-1 py-2.5 text-left',
        'transition-all duration-150',
        'hover:bg-[var(--bg-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
      )}
    >
      {/* Subtle status dot */}
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-disabled)]" />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--text-primary)]">
        {item.title}
      </span>
      <div className="flex shrink-0 items-center gap-1.5">
        {hasNotes && <FileText className="h-3 w-3 text-[var(--text-disabled)]" />}
        {destName && (
          <span className="rounded-sm border border-[var(--border-subtle)] px-1.5 py-px text-[10px] font-medium text-[var(--text-muted)]">
            {destName}
          </span>
        )}
        {age && age !== 'today' && (
          <span className="text-[10px] tabular-nums text-[var(--text-disabled)]">{age}</span>
        )}
      </div>
    </motion.button>
  );
}

/** Muted item for Done section */
function MutedItem({
  item,
  trailing,
  onClick,
}: {
  item: Item;
  trailing?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={listItemVariants}
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 px-4 py-2.5 text-left opacity-50',
        'transition-all duration-150 hover:opacity-70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#6b8f71]/60" />
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-muted)] line-through decoration-[var(--text-disabled)]">
        {item.title}
      </span>
      {trailing && (
        <span className="shrink-0 text-[11px] tabular-nums text-[var(--text-disabled)]">{trailing}</span>
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// AI Insights Card
// ---------------------------------------------------------------------------

function AIInsightsCard({
  somedayItems,
  allActiveItems,
  staleItems,
  onItemClick,
}: {
  somedayItems: Item[];
  allActiveItems: Item[];
  staleItems: Item[];
  onItemClick: (id: string) => void;
}) {
  const [insights, setInsights] = useState<{
    promotions: Array<{ item_id: string; confidence: number; reasoning: string }>;
    clusters: Array<{ theme: string; item_ids: string[]; suggested_project_name: string; reasoning: string }>;
    stale: Array<{ item_id: string; action: string; confidence: number; reasoning: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null);
  const hasFetched = useRef(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError(false);
    try {
      const [promotionsRes, clustersRes, staleRes] = await Promise.allSettled([
        somedayItems.length >= 2
          ? fetch('/api/ai/suggest-promotions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                somedayItems: somedayItems.map(i => ({
                  id: i.id,
                  title: i.title,
                  notes: i.notes || undefined,
                  created_at: i.created_at,
                  maturity: (i.custom_values as any)?.maturity || undefined,
                })),
                recentActivity: allActiveItems.slice(0, 10).map(i => i.title),
              }),
            }).then(r => r.json())
          : Promise.resolve({ promotions: [] }),
        allActiveItems.length >= 5
          ? fetch('/api/ai/cluster-items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: allActiveItems.map(i => ({
                  id: i.id,
                  title: i.title,
                  notes: i.notes || undefined,
                  destination: (i as any).destinations?.slug || undefined,
                })),
              }),
            }).then(r => r.json())
          : Promise.resolve({ clusters: [] }),
        staleItems.length >= 2
          ? fetch('/api/ai/stale-items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: staleItems.map(i => ({
                  id: i.id,
                  title: i.title,
                  destination: 'backlog',
                  age_days: Math.floor((Date.now() - new Date(i.created_at).getTime()) / (1000 * 60 * 60 * 24)),
                  has_subtasks: false,
                })),
              }),
            }).then(r => r.json())
          : Promise.resolve({ stale: [] }),
      ]);

      setInsights({
        promotions: promotionsRes.status === 'fulfilled' ? (promotionsRes.value.promotions || []) : [],
        clusters: clustersRes.status === 'fulfilled' ? (clustersRes.value.clusters || []) : [],
        stale: staleRes.status === 'fulfilled' ? (staleRes.value.stale || []) : [],
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const hasAnyData = somedayItems.length >= 2 || allActiveItems.length >= 5 || staleItems.length >= 2;

  // Auto-fetch on mount
  useEffect(() => {
    if (hasAnyData && !hasFetched.current) {
      hasFetched.current = true;
      fetchInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnyData]);

  if (!hasAnyData) return null;

  const totalInsights = insights
    ? insights.promotions.length + insights.clusters.length + insights.stale.length
    : 0;

  const findItemTitle = (itemId: string): string => {
    const all = [...somedayItems, ...allActiveItems, ...staleItems];
    return all.find(i => i.id === itemId)?.title || 'Unknown item';
  };

  return (
    <motion.section variants={itemVariants}>
      <div className="overflow-hidden rounded-none border border-[var(--border-subtle)] border-t-2 border-t-[var(--accent-base)]/25 bg-[var(--bg-surface)]">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3">
          <Brain className="h-4 w-4 text-[var(--accent-base)]" />
          <h2 className="text-[13px] font-semibold text-[var(--text-secondary)]">
            Insights
          </h2>
          {insights && totalInsights > 0 && (
            <span className="rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-bold tabular-nums text-[var(--accent-base)]">
              {totalInsights}
            </span>
          )}
          <button
            onClick={fetchInsights}
            disabled={loading}
            className={cn(
              'ml-auto flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-[11px] font-medium',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
              loading
                ? 'cursor-not-allowed border-[var(--border-default)] text-[var(--text-disabled)]'
                : 'border-[var(--accent-border)] text-[var(--accent-base)] hover:bg-[var(--accent-glow)]',
            )}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : insights ? (
              <RefreshCw className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {loading ? 'Analyzing...' : insights ? 'Refresh' : 'Generate'}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <>
            <div className="mx-4 h-px bg-[var(--border-subtle)]" />
            <div className="flex items-center justify-center gap-2 px-4 py-4">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent-base)] opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">
                Analyzing...
              </p>
            </div>
          </>
        )}

        {/* Error state */}
        {error && !loading && (
          <>
            <div className="mx-4 h-px bg-[var(--border-subtle)]" />
            <div className="flex items-center gap-2 px-4 py-3">
              <AlertCircle className="h-3.5 w-3.5 text-red-400/60" />
              <p className="text-xs text-[var(--text-muted)]">
                Failed to load. Try refreshing.
              </p>
            </div>
          </>
        )}

        {/* Insights loaded */}
        {insights && !loading && !error && (
          <>
            <div className="mx-4 h-px bg-[var(--border-subtle)]" />

            {totalInsights === 0 ? (
              <div className="flex items-center gap-2 px-4 py-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--text-disabled)]" />
                <p className="text-xs text-[var(--text-muted)]">
                  All clear. Nothing to flag.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {/* Promotion suggestions */}
                {insights.promotions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="space-y-0.5"
                  >
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Ready to Promote
                    </p>
                    {insights.promotions.map((promo) => (
                      <motion.div
                        key={promo.item_id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="group flex items-center gap-2.5 rounded-none px-2.5 py-2 transition-colors duration-150 hover:bg-[var(--bg-hover)]"
                      >
                        <Lightbulb className="h-3.5 w-3.5 shrink-0 text-[var(--accent-base)]/60" />
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => onItemClick(promo.item_id)}
                            className="block truncate text-sm text-[var(--text-primary)] hover:underline"
                          >
                            {findItemTitle(promo.item_id)}
                          </button>
                          <p className="truncate text-[10px] italic text-[var(--text-muted)]">
                            {promo.reasoning}
                          </p>
                        </div>
                        <button
                          onClick={() => onItemClick(promo.item_id)}
                          className={cn(
                            'flex shrink-0 items-center gap-1 rounded-none px-2 py-0.5 text-[11px] font-medium',
                            'border border-[var(--accent-base)]/20 text-[var(--accent-base)]',
                            'transition-colors duration-150 hover:bg-[var(--accent-glow)]',
                          )}
                        >
                          Promote
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Clusters */}
                {insights.clusters.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.05 }}
                    className="space-y-0.5"
                  >
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Related Items
                    </p>
                    {insights.clusters.map((cluster, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="rounded-none border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-colors duration-150"
                      >
                        <button
                          onClick={() => setExpandedCluster(expandedCluster === idx ? null : idx)}
                          className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors duration-150 hover:bg-[var(--bg-hover)] rounded-none"
                        >
                          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-[var(--text-primary)]">
                              {cluster.theme}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {cluster.item_ids.length} items
                            </span>
                          </div>
                          <span className="text-[var(--text-muted)]">
                            {expandedCluster === idx ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </span>
                        </button>
                        {expandedCluster === idx && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="border-t border-[var(--border-subtle)] px-2.5 py-1.5"
                          >
                            <p className="mb-1.5 text-[10px] italic text-[var(--text-muted)]">
                              {cluster.reasoning}
                            </p>
                            <div className="space-y-0.5">
                              {cluster.item_ids.map((itemId) => (
                                <button
                                  key={itemId}
                                  onClick={() => onItemClick(itemId)}
                                  className="block w-full truncate rounded-none px-2 py-1 text-left text-xs text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
                                >
                                  {findItemTitle(itemId)}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Stale items */}
                {insights.stale.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.1 }}
                    className="space-y-0.5"
                  >
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Needs Attention
                    </p>
                    {insights.stale.map((staleItem) => (
                      <motion.div
                        key={staleItem.item_id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="group flex items-start gap-2.5 rounded-none px-2.5 py-2 transition-colors duration-150 hover:bg-[var(--bg-hover)]"
                      >
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600/50" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onItemClick(staleItem.item_id)}
                              className="min-w-0 flex-1 truncate text-left text-sm text-[var(--text-primary)] hover:underline"
                            >
                              {findItemTitle(staleItem.item_id)}
                            </button>
                            <span
                              className={cn(
                                'shrink-0 rounded-none px-2 py-0.5 text-[10px] font-medium',
                                staleItem.action.toLowerCase().includes('schedule') && 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
                                staleItem.action.toLowerCase().includes('complete') && 'bg-[rgba(107,143,113,0.08)] text-[#6b8f71]',
                                staleItem.action.toLowerCase().includes('archive') && 'bg-[var(--bg-hover)] text-[var(--text-muted)]',
                                !staleItem.action.toLowerCase().includes('schedule') &&
                                !staleItem.action.toLowerCase().includes('complete') &&
                                !staleItem.action.toLowerCase().includes('archive') &&
                                'bg-[var(--bg-hover)] text-[var(--text-secondary)]',
                              )}
                            >
                              {staleItem.action}
                            </span>
                          </div>
                          <p className="truncate text-[10px] italic text-[var(--text-muted)]">
                            {staleItem.reasoning}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}

        {/* Initial state — just header, no extra content (auto-fetch handles the rest) */}
      </div>
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TodayPageClient({
  profile,
  showOnboarding,
  counts,
  overdueItems,
  todayItems,
  completedToday,
  somedayItems,
  allActiveItems,
  staleItems,
  destinations,
}: TodayPageClientProps) {
  const router = useRouter();
  const openProcessingPanel = useUIStore((s) => s.openProcessingPanel);

  const [onboardingVisible, setOnboardingVisible] = useState(showOnboarding);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  const userName = profile?.full_name?.split(' ')[0] || 'there';
  const greetingText = getGreeting();
  const todayFormatted = format(new Date(), 'EEEE, MMM d');

  const hasOverdue = overdueItems.length > 0;
  const hasToday = todayItems.length > 0;
  const hasCompleted = completedToday.length > 0;

  // Progress: completed vs total today tasks
  const totalTodayTasks = todayItems.length + completedToday.length;
  const completedPercent = totalTodayTasks > 0 ? (completedToday.length / totalTodayTasks) * 100 : 0;

  // Recent — active items not overdue/today/completed, fills the left column
  const overdueIds = new Set(overdueItems.map(i => i.id));
  const todayIds = new Set(todayItems.map(i => i.id));
  const completedIds = new Set(completedToday.map(i => i.id));
  const recentItems = allActiveItems
    .filter(item => !overdueIds.has(item.id) && !todayIds.has(item.id) && !completedIds.has(item.id))
    .slice(0, 8);
  const hasRecent = recentItems.length > 0;
  const hasAnyContent = hasOverdue || hasToday || hasCompleted || hasRecent;

  const handleOnboardingComplete = async () => {
    setOnboardingVisible(false);
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', profile?.id);
    } catch {
      // Not critical
    }
  };

  const handleItemClick = (itemId: string) => {
    openProcessingPanel(itemId);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Onboarding overlay */}
      {onboardingVisible && (
        <OnboardingFlow
          userName={userName}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 pb-6 pt-6">
        <motion.div
          className="mx-auto max-w-7xl space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page header — editorial: terracotta dot, large title, date on right */}
          <motion.div variants={itemVariants} className="flex items-end justify-between pb-1">
            <div>
              <h1 className="flex items-center gap-2.5 text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-base)]" />
                Today
              </h1>
              <p className="mt-1 pl-[18px] text-[15px] text-[var(--text-muted)]">
                {greetingText}, <span className="font-medium text-[var(--text-secondary)]">{userName}</span>
              </p>
            </div>
            <span className="pb-1.5 text-sm tabular-nums text-[var(--text-muted)]">
              {todayFormatted}
            </span>
          </motion.div>

          {/* Status strip + progress — compact utility */}
          <motion.div variants={itemVariants} className="space-y-2">
            <StatusBar counts={counts} onNavigate={(path) => router.push(path)} />
            {totalTodayTasks > 0 && (
              <div className="flex items-center gap-3 px-1">
                <div className="h-1 flex-1 overflow-hidden rounded-sm bg-[var(--border-subtle)]">
                  <motion.div
                    className="h-full rounded-sm bg-[var(--accent-base)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${completedPercent}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
                  />
                </div>
                <span className="text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                  {completedToday.length}/{totalTodayTasks}
                </span>
              </div>
            )}
          </motion.div>

          {/* Two-column workspace — always rendered, content adapts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            {/* LEFT — Primary workspace */}
            <div className="min-w-0 space-y-6">
              {/* Overdue — borderless urgent strip, amber tint */}
              {hasOverdue && (
                <motion.section variants={itemVariants}>
                  <div className="overflow-hidden border-l-[3px] border-l-amber-600/60 bg-[rgba(180,83,9,0.025)] dark:bg-[rgba(180,83,9,0.06)]">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-700/70" />
                      <h2 className="text-[12px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/80">
                        Overdue
                      </h2>
                      <span className="ml-auto rounded-sm bg-amber-100/60 px-1.5 py-px text-[10px] font-bold tabular-nums text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {overdueItems.length}
                      </span>
                    </div>
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                      {overdueItems.map((item) => (
                        <CompactItem
                          key={item.id}
                          item={item}
                          destinations={destinations}
                          showAge
                          trailing={item.scheduled_at ? formatOverdueDistance(item.scheduled_at) : undefined}
                          onClick={() => handleItemClick(item.id)}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.section>
              )}

              {/* Today's Focus — HERO: warm surface, no standard border, editorial header */}
              <motion.section variants={itemVariants}>
                <div className="overflow-hidden rounded-sm bg-[rgba(194,122,90,0.035)] dark:bg-[rgba(194,122,90,0.06)]">
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-base)]" />
                      <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
                        Today&apos;s Focus
                      </h2>
                    </div>
                    {hasToday && (
                      <span className="text-[12px] font-bold tabular-nums text-[var(--accent-base)]">
                        {todayItems.length} {todayItems.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>
                  {hasToday ? (
                    <motion.div className="pb-2" variants={containerVariants} initial="hidden" animate="visible">
                      {todayItems.map((item, idx) => (
                        <FocusItem
                          key={item.id}
                          item={item}
                          index={idx + 1}
                          destinations={destinations}
                          trailing={<span className="font-medium tabular-nums">{formatScheduledTime(item)}</span>}
                          onClick={() => handleItemClick(item.id)}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <div className="px-5 pb-6 pt-2">
                      <p className="text-[15px] text-[var(--text-muted)]">
                        Nothing on the agenda.
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-disabled)]">
                        Schedule items to build your focus list, or capture something new below.
                      </p>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* In Motion — BORDERLESS: label + dividers, no card container */}
              {hasRecent && (
                <motion.section variants={itemVariants}>
                  <div className="flex items-center gap-2 px-1 pb-2">
                    <Activity className="h-3 w-3 text-[var(--text-disabled)]" />
                    <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      In Motion
                    </h2>
                    <span className="text-[11px] tabular-nums text-[var(--text-disabled)]">
                      {recentItems.length}
                    </span>
                  </div>
                  <motion.div className="divide-y divide-[var(--border-subtle)]" variants={containerVariants} initial="hidden" animate="visible">
                    {recentItems.map((item) => (
                      <DenseItem
                        key={item.id}
                        item={item}
                        destinations={destinations}
                        showAge
                        onClick={() => handleItemClick(item.id)}
                      />
                    ))}
                  </motion.div>
                </motion.section>
              )}

              {/* Done — INLINE TOGGLE: no card when collapsed, card on expand */}
              {hasCompleted && (
                <motion.section variants={itemVariants}>
                  <button
                    onClick={() => setCompletedExpanded((prev) => !prev)}
                    className={cn(
                      'flex w-full items-center gap-2 px-1 py-2 text-left',
                      'transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#6b8f71]/50" />
                    <span className="text-[13px] font-medium text-[var(--text-muted)]">
                      Done today
                    </span>
                    <span className="text-[12px] font-bold tabular-nums text-[#6b8f71]/60">
                      {completedToday.length}
                    </span>
                    <span className="ml-auto text-[var(--text-disabled)]">
                      {completedExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                  {completedExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                      className="mt-1 overflow-hidden rounded-sm border border-[var(--border-subtle)] border-l-[3px] border-l-[#6b8f71]/30 bg-[var(--bg-surface)]"
                    >
                      <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        {completedToday.map((item) => (
                          <MutedItem
                            key={item.id}
                            item={item}
                            trailing={item.completed_at ? format(new Date(item.completed_at), 'HH:mm') : undefined}
                            onClick={() => handleItemClick(item.id)}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </motion.section>
              )}

              {/* Empty state — editorial, warm */}
              {!hasAnyContent && (
                <motion.div
                  variants={itemVariants}
                  className="rounded-sm bg-[rgba(194,122,90,0.035)] px-6 py-8 text-center dark:bg-[rgba(194,122,90,0.06)]"
                >
                  <p className="text-[16px] font-medium text-[var(--text-primary)]">Your mind is clear.</p>
                  <p className="mt-2 text-[13px] text-[var(--text-muted)]">Capture something when inspiration strikes.</p>
                </motion.div>
              )}
            </div>

            {/* RIGHT — Secondary rail (sticky, denser) */}
            <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
              <AIInsightsCard
                somedayItems={somedayItems}
                allActiveItems={allActiveItems}
                staleItems={staleItems}
                onItemClick={handleItemClick}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
