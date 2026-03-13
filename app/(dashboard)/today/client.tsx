'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Inbox,
  ListTodo,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sun,
  Sunrise,
  Moon,
  Sparkles,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Brain,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  FileText,
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

function getGreeting(): { text: string; Icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', Icon: Sunrise };
  if (hour < 18) return { text: 'Good afternoon', Icon: Sun };
  return { text: 'Good evening', Icon: Moon };
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

function ItemRow({
  item,
  trailing,
  muted = false,
  destinations,
  showAge = false,
  onClick,
}: {
  item: Item;
  trailing?: React.ReactNode;
  muted?: boolean;
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
        'group flex w-full items-center gap-3 rounded-none px-4 py-3 text-left',
        'border-l-2 border-l-transparent transition-all duration-150',
        'hover:bg-[var(--bg-hover)] hover:border-l-[var(--accent-base)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
        muted && 'opacity-50 hover:border-l-transparent',
      )}
    >
      {/* Title + metadata */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={cn(
            'truncate text-sm',
            muted
              ? 'text-[var(--text-muted)] line-through decoration-[var(--text-disabled)]'
              : 'font-medium text-[var(--text-primary)]',
          )}
        >
          {item.title}
        </span>
        {hasNotes && !muted && (
          <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--text-disabled)]" />
        )}
      </div>

      {/* Metadata pills */}
      <div className="flex shrink-0 items-center gap-2">
        {destName && !muted && (
          <span className="px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-hover)]">
            {destName}
          </span>
        )}
        {age && !muted && age !== 'today' && (
          <span className="text-[11px] font-medium tabular-nums text-[var(--text-disabled)]">
            {age}
          </span>
        )}
        {trailing && (
          <span className="text-xs tabular-nums text-[var(--text-muted)]">{trailing}</span>
        )}
      </div>
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
      <div className="overflow-hidden rounded-none border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-[var(--bg-hover)]">
            <Brain className="h-[18px] w-[18px] text-[var(--accent-base)]" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
            AI Insights
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
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-[var(--bg-hover)]">
                          <Lightbulb className="h-3 w-3 text-[var(--text-secondary)]" />
                        </div>
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
                            'border border-[var(--accent-border)] text-[var(--accent-base)]',
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
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-[var(--bg-hover)]">
                            <TrendingUp className="h-3 w-3 text-[var(--text-secondary)]" />
                          </div>
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
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-[var(--bg-hover)] mt-0.5">
                          <AlertCircle className="h-3 w-3 text-[var(--text-secondary)]" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onItemClick(staleItem.item_id)}
                              className="min-w-0 flex-1 truncate text-left text-sm text-[var(--text-primary)] hover:underline"
                            >
                              {findItemTitle(staleItem.item_id)}
                            </button>
                            <span
                              className="shrink-0 rounded-none bg-[var(--bg-hover)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]"
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

  const setPageTitle = useUIStore((s) => s.setPageTitle);
  useEffect(() => {
    setPageTitle('Today');
    return () => setPageTitle('');
  }, [setPageTitle]);

  const userName = profile?.full_name?.split(' ')[0] || 'there';
  const { text: greetingText } = getGreeting();
  const todayFormatted = format(new Date(), 'EEEE, MMM d');

  const hasOverdue = overdueItems.length > 0;
  const hasToday = todayItems.length > 0;
  const hasCompleted = completedToday.length > 0;
  const isEverythingEmpty = !hasOverdue && !hasToday && !hasCompleted;

  // Progress: completed vs total today tasks
  const totalTodayTasks = todayItems.length + completedToday.length;
  const completedPercent = totalTodayTasks > 0 ? (completedToday.length / totalTodayTasks) * 100 : 0;

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
      <div className="flex-1 overflow-auto px-6 pb-6 pt-5">
        <motion.div
          className="mx-auto max-w-5xl space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Greeting + date (page title "Today" is in the header bar) */}
          <motion.div variants={itemVariants} className="flex items-baseline justify-between px-0.5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {greetingText}, <span className="text-[var(--text-secondary)]">{userName}</span>
            </h2>
            <span className="text-xs tabular-nums text-[var(--text-muted)]">
              {todayFormatted}
            </span>
          </motion.div>

          {/* Status bar — full width */}
          <StatusBar counts={counts} onNavigate={(path) => router.push(path)} />

          {/* Progress bar (when there are today tasks) */}
          {totalTodayTasks > 0 && (
            <motion.div variants={itemVariants} className="flex items-center gap-3 px-1">
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
            </motion.div>
          )}

          {/* Everything-empty state */}
          {isEverythingEmpty && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 rounded-none border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[var(--accent-glow)]">
                <Sun className="h-4 w-4 text-[var(--accent-base)] opacity-60" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Your mind is clear.
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Capture something when inspiration strikes.
                </p>
              </div>
            </motion.div>
          )}

          {/* 2-column layout: Left = tasks, Right = AI insights */}
          {!isEverythingEmpty && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
              {/* LEFT COLUMN — Today + Overdue + Completed */}
              <div className="min-w-0 space-y-4">
                {/* Overdue section */}
                {hasOverdue && (
                  <motion.section variants={itemVariants}>
                    <div className="overflow-hidden rounded-none border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                      <div className="flex items-center gap-2.5 px-4 py-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-none bg-[rgba(248,113,113,0.06)]">
                          <AlertTriangle className="h-4 w-4 text-red-400/70" />
                        </div>
                        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-primary)]">
                          Overdue
                        </h2>
                        <span className="ml-auto rounded-full bg-[rgba(248,113,113,0.06)] px-2 py-0.5 text-[10px] font-bold tabular-nums text-red-400">
                          {overdueItems.length}
                        </span>
                      </div>

                      <div className="mx-4 h-px bg-[var(--border-subtle)]" />

                      <motion.div
                        className="px-1 py-1.5"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {overdueItems.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            destinations={destinations}
                            showAge
                            trailing={
                              item.scheduled_at
                                ? formatOverdueDistance(item.scheduled_at)
                                : undefined
                            }
                            onClick={() => handleItemClick(item.id)}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.section>
                )}

                {/* Scheduled today section */}
                <motion.section variants={itemVariants}>
                  <div className="overflow-hidden rounded-none border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <div className="flex items-center gap-2.5 px-4 py-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-none bg-[var(--bg-hover)]">
                        <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                      </div>
                      <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-primary)]">
                        Scheduled
                      </h2>
                      {hasToday && (
                        <span className="ml-auto rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-[10px] font-bold tabular-nums text-[var(--text-secondary)]">
                          {todayItems.length}
                        </span>
                      )}
                    </div>

                    <div className="mx-4 h-px bg-[var(--border-subtle)]" />

                    {hasToday ? (
                      <motion.div
                        className="px-1 py-1.5"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {todayItems.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            destinations={destinations}
                            trailing={
                              <span className="font-medium tabular-nums">
                                {formatScheduledTime(item)}
                              </span>
                            }
                            onClick={() => handleItemClick(item.id)}
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <p className="px-4 py-4 text-xs text-[var(--text-muted)]">
                        Nothing scheduled today.
                      </p>
                    )}
                  </div>
                </motion.section>

                {/* Completed today (collapsible) */}
                {hasCompleted && (
                  <motion.section variants={itemVariants}>
                    <div className="overflow-hidden rounded-none border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                      <button
                        onClick={() => setCompletedExpanded((prev) => !prev)}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-4 py-3 text-left',
                          'transition-colors duration-150 hover:bg-[var(--bg-hover)]',
                          'rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                        )}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-none bg-[var(--bg-hover)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--text-muted)]" />
                        </div>
                        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                          Done
                        </h2>
                        <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
                          {completedToday.length} {completedToday.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="ml-auto text-[var(--text-muted)]">
                          {completedExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </button>

                      {completedExpanded && (
                        <>
                          <div className="mx-4 h-px bg-[var(--border-subtle)]" />
                          <motion.div
                            className="px-1 py-1.5"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {completedToday.map((item) => (
                              <ItemRow
                                key={item.id}
                                item={item}
                                muted
                                trailing={
                                  item.completed_at
                                    ? format(new Date(item.completed_at), 'HH:mm')
                                    : undefined
                                }
                                onClick={() => handleItemClick(item.id)}
                              />
                            ))}
                          </motion.div>
                        </>
                      )}
                    </div>
                  </motion.section>
                )}
              </div>

              {/* RIGHT COLUMN — AI Insights (sticky on desktop) */}
              <div className="min-w-0 lg:sticky lg:top-5 lg:self-start">
                <AIInsightsCard
                  somedayItems={somedayItems}
                  allActiveItems={allActiveItems}
                  staleItems={staleItems}
                  onItemClick={handleItemClick}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
