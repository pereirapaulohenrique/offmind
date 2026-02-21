'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { createClient } from '@/lib/supabase/client';
import type { Item, Profile } from '@/types/database';

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
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 28 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  count,
  label,
  icon: Icon,
  colorClass,
  bgClass,
  borderClass,
  hoverBgClass,
  onClick,
}: {
  count: number;
  label: string;
  icon: typeof Inbox;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  hoverBgClass: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border p-5 text-left',
        'transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-[var(--shadow-card-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
        borderClass,
        bgClass,
        hoverBgClass,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl', bgClass)}>
          <Icon className={cn('h-5 w-5', colorClass)} />
        </div>
        <div className="min-w-0">
          <p className={cn('text-2xl font-bold tabular-nums tracking-tight', colorClass)}>
            {count}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {label}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function ItemRow({
  item,
  trailing,
  muted = false,
  onClick,
}: {
  item: Item;
  trailing?: React.ReactNode;
  muted?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={listItemVariants}
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left',
        'transition-all duration-200',
        'hover:bg-[var(--bg-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
        muted && 'opacity-60',
      )}
    >
      <span
        className={cn(
          'flex-1 truncate text-sm font-medium',
          muted
            ? 'text-[var(--text-muted)] line-through decoration-[var(--text-disabled)]'
            : 'text-[var(--text-primary)]',
        )}
      >
        {item.title}
      </span>
      {trailing && (
        <span className="shrink-0 text-xs text-[var(--text-muted)]">{trailing}</span>
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
  if (!hasAnyData) return null;

  const totalInsights = insights
    ? insights.promotions.length + insights.clusters.length + insights.stale.length
    : 0;

  // Helper to find item title by id
  const findItemTitle = (itemId: string): string => {
    const all = [...somedayItems, ...allActiveItems, ...staleItems];
    return all.find(i => i.id === itemId)?.title || 'Unknown item';
  };

  return (
    <motion.section variants={itemVariants}>
      <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-subtle)]">
            <Brain className="h-5 w-5 text-[var(--accent-base)]" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)]">
            AI Insights
          </h2>
          {insights && totalInsights > 0 && (
            <span className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--accent-base)]">
              {totalInsights}
            </span>
          )}
          <button
            onClick={fetchInsights}
            disabled={loading}
            className={cn(
              'ml-auto flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
              loading
                ? 'cursor-not-allowed border-[var(--border-default)] text-[var(--text-disabled)]'
                : 'border-[var(--accent-border)] text-[var(--accent-base)] hover:bg-[var(--accent-glow)]',
            )}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : insights ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {loading ? 'Analyzing...' : insights ? 'Refresh' : 'Generate Insights'}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <>
            <div className="mx-6 h-px bg-[var(--accent-subtle)]" />
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="h-8 w-8 text-[var(--accent-base)] opacity-40" />
              </motion.div>
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                Analyzing your items...
              </p>
            </div>
          </>
        )}

        {/* Error state */}
        {error && !loading && (
          <>
            <div className="mx-6 h-px bg-[var(--accent-subtle)]" />
            <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
              <AlertCircle className="h-6 w-6 text-red-400 opacity-60" />
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Something went wrong. Try again.
              </p>
            </div>
          </>
        )}

        {/* Insights loaded */}
        {insights && !loading && !error && (
          <>
            <div className="mx-6 h-px bg-[var(--accent-subtle)]" />

            {totalInsights === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(52,211,153,0.08)]">
                  <CheckCircle2 className="h-5 w-5 text-[var(--layer-commit)] opacity-60" />
                </div>
                <p className="mt-4 text-sm text-[var(--text-muted)]">
                  Your system looks healthy, nothing to flag right now.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Promotion suggestions */}
                {insights.promotions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="space-y-1"
                  >
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Ready to Promote
                    </p>
                    {insights.promotions.map((promo) => (
                      <motion.div
                        key={promo.item_id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-[var(--bg-hover)]"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(251,191,36,0.1)]">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => onItemClick(promo.item_id)}
                            className="block truncate text-sm font-medium text-[var(--text-primary)] hover:underline"
                          >
                            {findItemTitle(promo.item_id)}
                          </button>
                          <p className="truncate text-xs italic text-[var(--text-muted)]">
                            {promo.reasoning}
                          </p>
                        </div>
                        <button
                          onClick={() => onItemClick(promo.item_id)}
                          className={cn(
                            'flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium',
                            'border border-[rgba(52,211,153,0.3)] text-[var(--layer-commit)]',
                            'transition-colors duration-200 hover:bg-[rgba(52,211,153,0.08)]',
                          )}
                        >
                          Promote
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Clusters */}
                {insights.clusters.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.05 }}
                    className="space-y-1"
                  >
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Related Items
                    </p>
                    {insights.clusters.map((cluster, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] transition-colors duration-200"
                      >
                        <button
                          onClick={() => setExpandedCluster(expandedCluster === idx ? null : idx)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-[var(--bg-hover)] rounded-xl"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(96,165,250,0.1)]">
                            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                              {cluster.theme}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {cluster.item_ids.length} items &middot; Suggested project: {cluster.suggested_project_name}
                            </span>
                          </div>
                          <span className="text-[var(--text-muted)]">
                            {expandedCluster === idx ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                        </button>
                        {expandedCluster === idx && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="border-t border-[var(--border-subtle)] px-3 py-2"
                          >
                            <p className="mb-2 text-xs italic text-[var(--text-muted)]">
                              {cluster.reasoning}
                            </p>
                            <div className="space-y-1">
                              {cluster.item_ids.map((itemId) => (
                                <button
                                  key={itemId}
                                  onClick={() => onItemClick(itemId)}
                                  className="block w-full truncate rounded-lg px-2 py-1 text-left text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.1 }}
                    className="space-y-1"
                  >
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Needs Attention
                    </p>
                    {insights.stale.map((staleItem) => (
                      <motion.div
                        key={staleItem.item_id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-[var(--bg-hover)]"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(239,68,68,0.1)]">
                          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => onItemClick(staleItem.item_id)}
                            className="block truncate text-sm font-medium text-[var(--text-primary)] hover:underline"
                          >
                            {findItemTitle(staleItem.item_id)}
                          </button>
                          <p className="truncate text-xs italic text-[var(--text-muted)]">
                            {staleItem.reasoning}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium',
                            staleItem.action.toLowerCase().includes('archive')
                              ? 'bg-[rgba(239,68,68,0.08)] text-red-400'
                              : staleItem.action.toLowerCase().includes('schedule')
                                ? 'bg-[rgba(52,211,153,0.08)] text-[var(--layer-commit)]'
                                : 'bg-[rgba(251,191,36,0.08)] text-amber-500',
                          )}
                        >
                          {staleItem.action}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}

        {/* Initial state (no insights yet, not loading) */}
        {!insights && !loading && !error && (
          <>
            <div className="mx-6 h-px bg-[var(--accent-subtle)]" />
            <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-glow)]">
                <Sparkles className="h-5 w-5 text-[var(--accent-base)] opacity-50" />
              </div>
              <p className="mt-4 max-w-xs text-sm text-[var(--text-muted)]">
                Get AI-powered suggestions to promote ideas, group related items, and clean up stale tasks.
              </p>
            </div>
          </>
        )}
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
}: TodayPageClientProps) {
  const router = useRouter();
  const openProcessingPanel = useUIStore((s) => s.openProcessingPanel);

  const [onboardingVisible, setOnboardingVisible] = useState(showOnboarding);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  const userName = profile?.full_name?.split(' ')[0] || 'there';
  const { text: greetingText, Icon: GreetingIcon } = getGreeting();
  const todayFormatted = format(new Date(), 'MMMM d, yyyy');

  const hasOverdue = overdueItems.length > 0;
  const hasToday = todayItems.length > 0;
  const hasCompleted = completedToday.length > 0;
  const isEverythingEmpty = !hasOverdue && !hasToday && !hasCompleted;

  // Onboarding complete handler
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

      {/* Header */}
      <div className="px-8 py-7">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
        >
          {/* Accent bar */}
          <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-[var(--accent-base)] to-[var(--accent-hover)] opacity-60" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <GreetingIcon className="h-6 w-6 text-[var(--accent-base)] opacity-70" />
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                {greetingText}, {userName}
              </h1>
            </div>
            <p className="mt-1.5 text-sm tabular-nums text-[var(--text-muted)]">
              {todayFormatted}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <motion.div
          className="mx-auto max-w-3xl space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ---------------------------------------------------------------- */}
          {/* Summary cards                                                    */}
          {/* ---------------------------------------------------------------- */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-3 gap-4"
          >
            <SummaryCard
              count={counts.inbox}
              label="Inbox"
              icon={Inbox}
              colorClass="text-[var(--layer-capture)]"
              bgClass="bg-[rgba(96,165,250,0.10)]"
              borderClass="border-[rgba(96,165,250,0.18)]"
              hoverBgClass="hover:bg-[rgba(96,165,250,0.14)]"
              onClick={() => router.push('/inbox')}
            />
            <SummaryCard
              count={counts.backlog}
              label="Backlog"
              icon={ListTodo}
              colorClass="text-[var(--layer-process)]"
              bgClass="bg-[rgba(251,191,36,0.10)]"
              borderClass="border-[rgba(251,191,36,0.18)]"
              hoverBgClass="hover:bg-[rgba(251,191,36,0.14)]"
              onClick={() => router.push('/backlog')}
            />
            <SummaryCard
              count={counts.waiting}
              label="Waiting"
              icon={Clock}
              colorClass="text-[var(--layer-commit)]"
              bgClass="bg-[rgba(52,211,153,0.10)]"
              borderClass="border-[rgba(52,211,153,0.18)]"
              hoverBgClass="hover:bg-[rgba(52,211,153,0.14)]"
              onClick={() => router.push('/waiting-for')}
            />
          </motion.div>

          {/* ---------------------------------------------------------------- */}
          {/* AI Insights                                                      */}
          {/* ---------------------------------------------------------------- */}
          <AIInsightsCard
            somedayItems={somedayItems}
            allActiveItems={allActiveItems}
            staleItems={staleItems}
            onItemClick={handleItemClick}
          />

          {/* ---------------------------------------------------------------- */}
          {/* Everything-empty state                                           */}
          {/* ---------------------------------------------------------------- */}
          {isEverythingEmpty && (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-16 text-center shadow-[var(--shadow-card)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-glow)]">
                <Sun className="h-8 w-8 text-[var(--accent-base)] opacity-60" />
              </div>
              <p className="mt-6 max-w-xs text-base font-medium text-[var(--text-primary)]">
                Your mind is clear.
              </p>
              <p className="mt-2 max-w-xs text-sm text-[var(--text-muted)]">
                Capture something when inspiration strikes.
              </p>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Overdue section                                                  */}
          {/* ---------------------------------------------------------------- */}
          {hasOverdue && (
            <motion.section variants={itemVariants}>
              <div className="rounded-2xl border border-red-500/20 bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
                {/* Section header */}
                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-red-500">
                    Overdue
                  </h2>
                  <span className="ml-auto rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-red-500">
                    {overdueItems.length}
                  </span>
                </div>

                <div className="mx-6 h-px bg-red-500/10" />

                {/* Items */}
                <motion.div
                  className="p-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {overdueItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
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

          {/* ---------------------------------------------------------------- */}
          {/* Scheduled today section                                          */}
          {/* ---------------------------------------------------------------- */}
          {!isEverythingEmpty && (
            <motion.section variants={itemVariants}>
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
                {/* Section header */}
                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--layer-commit-bg)]">
                    <Calendar className="h-4 w-4 text-[var(--layer-commit)]" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    Scheduled Today
                  </h2>
                  {hasToday && (
                    <span className="ml-auto rounded-full bg-[rgba(52,211,153,0.10)] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--layer-commit)]">
                      {todayItems.length}
                    </span>
                  )}
                </div>

                <div className="mx-6 h-px bg-[var(--border-subtle)]" />

                {/* Items or empty state */}
                {hasToday ? (
                  <motion.div
                    className="p-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {todayItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
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
                  <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-hover)]">
                      <Calendar className="h-5 w-5 text-[var(--text-disabled)]" />
                    </div>
                    <p className="mt-4 max-w-xs text-sm text-[var(--text-muted)]">
                      Your day is clear. A perfect time to focus on what matters.
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Completed today section (collapsible)                            */}
          {/* ---------------------------------------------------------------- */}
          {hasCompleted && (
            <motion.section variants={itemVariants}>
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
                {/* Toggle header */}
                <button
                  onClick={() => setCompletedExpanded((prev) => !prev)}
                  className={cn(
                    'flex w-full items-center gap-3 px-6 py-4 text-left',
                    'transition-colors duration-200 hover:bg-[var(--bg-hover)]',
                    'rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(52,211,153,0.10)]">
                    <CheckCircle2 className="h-4 w-4 text-[var(--layer-commit)]" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Completed Today
                  </h2>
                  <span className="ml-1 text-sm text-[var(--text-muted)]">
                    &mdash; {completedToday.length}{' '}
                    {completedToday.length === 1 ? 'item' : 'items'} completed
                  </span>
                  <span className="ml-auto text-[var(--text-muted)]">
                    {completedExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                </button>

                {/* Collapsible body */}
                {completedExpanded && (
                  <>
                    <div className="mx-6 h-px bg-[var(--border-subtle)]" />
                    <motion.div
                      className="p-2"
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
        </motion.div>
      </div>
    </div>
  );
}
