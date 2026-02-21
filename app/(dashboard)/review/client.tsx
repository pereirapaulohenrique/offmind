'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  format,
  formatDistanceToNow,
  isPast,
  differenceInDays,
  addDays,
  isToday,
  isTomorrow,
} from 'date-fns';
import { toast } from 'sonner';
import {
  Inbox,
  ListTodo,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  ArrowUpRight,
  Archive,
  Sparkles,
  Flame,
  PartyPopper,
  ExternalLink,
} from 'lucide-react';
import type { Item, Destination } from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeeklyReviewClientProps {
  userId: string;
  inboxItems: Item[];
  backlogItems: Item[];
  somedayItems: Item[];
  waitingItems: Item[];
  scheduledItems: Item[];
  overdueItems: Item[];
  unscheduledBacklog: Item[];
  completedThisWeek: number;
  reviewStreak: { count: number; last_review: string | null };
  destinations: Destination[];
}

interface ReviewStats {
  prioritiesSet: number;
  itemsPromoted: number;
  itemsArchived: number;
  itemsScheduled: number;
  followUpsSent: number;
  responsesReceived: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 7;

const STEP_LABELS = [
  'Welcome',
  'Inbox Zero',
  'Backlog',
  'Someday',
  'Waiting',
  'Plan',
  'Done',
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { label: 'Medium', value: 'medium', color: 'bg-blue-500/20 text-[#60a5fa] border-blue-500/30' },
  { label: 'High', value: 'high', color: 'bg-amber-500/20 text-[#fbbf24] border-amber-500/30' },
  { label: 'Urgent', value: 'urgent', color: 'bg-red-500/20 text-[#f87171] border-red-500/30' },
] as const;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enterFromRight: {
    x: 80,
    opacity: 0,
  },
  enterFromLeft: {
    x: -80,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exitToLeft: {
    x: -80,
    opacity: 0,
    transition: { duration: 0.2 },
  },
  exitToRight: {
    x: 80,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
};

const listItem = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
  },
};

const celebrationVariants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.1 },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMM d');
}

function getMotivationalMessage(streak: number): string {
  if (streak >= 12) return 'A year of weekly reviews. You are unstoppable.';
  if (streak >= 8) return 'Two months strong. This habit is part of you now.';
  if (streak >= 4) return 'A full month of reviews. Your system is thriving.';
  if (streak >= 3) return 'Three weeks in a row. You are building momentum.';
  if (streak >= 2) return 'Back-to-back reviews. Keep the streak alive.';
  return 'Every review strengthens your system. Welcome back.';
}

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center gap-0 px-4">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep;

        return (
          <div key={i} className="flex items-center">
            {/* Step dot */}
            <motion.div
              className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300',
                isCompleted && 'bg-emerald-500/20 text-emerald-400',
                isCurrent && 'bg-[var(--accent-base)] text-white shadow-lg shadow-[var(--accent-base)]/20',
                isFuture && 'border border-[var(--border-subtle)] text-[var(--text-muted)]',
              )}
              animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
              transition={
                isCurrent
                  ? { duration: 1.5, repeat: Infinity, repeatType: 'reverse' }
                  : undefined
              }
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span>{i + 1}</span>
              )}
            </motion.div>

            {/* Connector line */}
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  'h-0.5 w-6 transition-colors duration-300 sm:w-10',
                  i < currentStep
                    ? 'bg-emerald-500/40'
                    : 'bg-[var(--border-subtle)]',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WeeklyReviewClient({
  userId,
  inboxItems: initialInboxItems,
  backlogItems: initialBacklogItems,
  somedayItems: initialSomedayItems,
  waitingItems: initialWaitingItems,
  scheduledItems: initialScheduledItems,
  overdueItems: initialOverdueItems,
  unscheduledBacklog: initialUnscheduledBacklog,
  completedThisWeek,
  reviewStreak,
  destinations,
}: WeeklyReviewClientProps) {
  const router = useRouter();

  // ── Step state ──────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // ── Item state (mutable copies for local updates) ──────────────────────
  const [inboxItems] = useState<Item[]>(initialInboxItems);
  const [backlogItems, setBacklogItems] = useState<Item[]>(initialBacklogItems);
  const [somedayItems, setSomedayItems] = useState<Item[]>(initialSomedayItems);
  const [waitingItems, setWaitingItems] = useState<Item[]>(initialWaitingItems);
  const [scheduledItems, setScheduledItems] = useState<Item[]>(initialScheduledItems);
  const [overdueItems, setOverdueItems] = useState<Item[]>(initialOverdueItems);
  const [unscheduledBacklog, setUnscheduledBacklog] = useState<Item[]>(initialUnscheduledBacklog);

  // ── Stats tracking ─────────────────────────────────────────────────────
  const [stats, setStats] = useState<ReviewStats>({
    prioritiesSet: 0,
    itemsPromoted: 0,
    itemsArchived: 0,
    itemsScheduled: 0,
    followUpsSent: 0,
    responsesReceived: 0,
  });

  // ── AI Summary state ────────────────────────────────────────────────
  const [aiSummary, setAiSummary] = useState<{
    greeting: string;
    highlights: string[];
    concerns: string[];
    suggestion: string;
  } | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(false);

  // ── Streak result ──────────────────────────────────────────────────────
  const [finalStreak, setFinalStreak] = useState<number | null>(null);
  const [streakSaved, setStreakSaved] = useState(false);

  // ── Navigation ─────────────────────────────────────────────────────────

  const goForward = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('back');
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  // ── Streak update ──────────────────────────────────────────────────────

  const updateStreak = useCallback(async () => {
    if (streakSaved) return;
    setStreakSaved(true);

    try {
      const supabase = createClient();
      const lastReview = reviewStreak.last_review
        ? new Date(reviewStreak.last_review)
        : null;
      const now = new Date();

      // Streak continues if last review was within 8-14 days (weekly tolerance)
      let newCount = 1;
      if (lastReview) {
        const daysSince = differenceInDays(now, lastReview);
        if (daysSince <= 14) {
          newCount = reviewStreak.count + 1;
        }
      }

      // Update profile settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', userId)
        .single();

      const currentSettings = (profile?.settings || {}) as Record<string, any>;
      await supabase
        .from('profiles')
        .update({
          settings: {
            ...currentSettings,
            review_streak: {
              count: newCount,
              last_review: now.toISOString(),
            },
          },
        } as any)
        .eq('id', userId);

      setFinalStreak(newCount);
    } catch (err) {
      console.error('Failed to update streak:', err);
      setFinalStreak(reviewStreak.count);
    }
  }, [userId, reviewStreak, streakSaved]);

  // Trigger streak save when landing on celebration step
  const handleStepChange = useCallback(
    (nextStep: number) => {
      if (nextStep === 6) {
        updateStreak();
      }
    },
    [updateStreak],
  );

  const goForwardWithHook = useCallback(() => {
    const next = currentStep + 1;
    if (next < TOTAL_STEPS) {
      setDirection('forward');
      setCurrentStep(next);
      handleStepChange(next);
    }
  }, [currentStep, handleStepChange]);

  // ── DB actions ─────────────────────────────────────────────────────────

  const setPriority = useCallback(
    async (itemId: string, priority: string) => {
      const supabase = createClient();
      const item = backlogItems.find((i) => i.id === itemId);
      if (!item) return;

      const cv = (item.custom_values as Record<string, any>) || {};
      const updatedCv = { ...cv, priority };

      const { error } = await supabase
        .from('items')
        .update({ custom_values: updatedCv } as any)
        .eq('id', itemId);

      if (error) {
        toast.error('Failed to set priority');
        return;
      }

      setBacklogItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, custom_values: updatedCv } : i,
        ),
      );
      setStats((s) => ({ ...s, prioritiesSet: s.prioritiesSet + 1 }));
      toast.success('Priority set');
    },
    [backlogItems],
  );

  const promoteToBacklog = useCallback(
    async (itemId: string) => {
      const supabase = createClient();
      const backlogDest = destinations.find((d) => d.slug === 'backlog');
      if (!backlogDest) {
        toast.error('Backlog destination not found');
        return;
      }

      const { error } = await supabase
        .from('items')
        .update({
          destination_id: backlogDest.id,
          layer: 'process',
        } as any)
        .eq('id', itemId);

      if (error) {
        toast.error('Failed to promote item');
        return;
      }

      setSomedayItems((prev) => prev.filter((i) => i.id !== itemId));
      setStats((s) => ({ ...s, itemsPromoted: s.itemsPromoted + 1 }));
      toast.success('Promoted to backlog');
    },
    [destinations],
  );

  const archiveItem = useCallback(async (itemId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('items')
      .update({ archived_at: new Date().toISOString() } as any)
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to archive item');
      return;
    }

    setSomedayItems((prev) => prev.filter((i) => i.id !== itemId));
    setBacklogItems((prev) => prev.filter((i) => i.id !== itemId));
    setStats((s) => ({ ...s, itemsArchived: s.itemsArchived + 1 }));
    toast.success('Item archived');
  }, []);

  const markFollowUpSent = useCallback(
    async (itemId: string) => {
      const supabase = createClient();
      const item = waitingItems.find((i) => i.id === itemId);
      if (!item) return;

      const cv = (item.custom_values as Record<string, any>) || {};
      const updatedCv = { ...cv, last_followup: new Date().toISOString() };

      const { error } = await supabase
        .from('items')
        .update({ custom_values: updatedCv } as any)
        .eq('id', itemId);

      if (error) {
        toast.error('Failed to update follow-up');
        return;
      }

      setWaitingItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, custom_values: updatedCv } : i,
        ),
      );
      setStats((s) => ({ ...s, followUpsSent: s.followUpsSent + 1 }));
      toast.success('Follow-up noted');
    },
    [waitingItems],
  );

  const markResponseReceived = useCallback(async (itemId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('items')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      } as any)
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to complete item');
      return;
    }

    setWaitingItems((prev) => prev.filter((i) => i.id !== itemId));
    setStats((s) => ({ ...s, responsesReceived: s.responsesReceived + 1 }));
    toast.success('Marked as received');
  }, []);

  const extendFollowUp = useCallback(
    async (itemId: string) => {
      const supabase = createClient();
      const item = waitingItems.find((i) => i.id === itemId);
      if (!item) return;

      const cv = (item.custom_values as Record<string, any>) || {};
      const newDate = addDays(new Date(), 7).toISOString().split('T')[0];
      const updatedCv = { ...cv, follow_up_date: newDate };

      const { error } = await supabase
        .from('items')
        .update({ custom_values: updatedCv } as any)
        .eq('id', itemId);

      if (error) {
        toast.error('Failed to extend follow-up');
        return;
      }

      setWaitingItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, custom_values: updatedCv } : i,
        ),
      );
      toast.success('Follow-up extended by 7 days');
    },
    [waitingItems],
  );

  const scheduleItem = useCallback(
    async (itemId: string, dateStr: string) => {
      if (!dateStr) return;

      const supabase = createClient();
      const scheduledAt = new Date(dateStr).toISOString();

      const { error } = await supabase
        .from('items')
        .update({
          scheduled_at: scheduledAt,
          layer: 'commit',
        } as any)
        .eq('id', itemId);

      if (error) {
        toast.error('Failed to schedule item');
        return;
      }

      // Move from unscheduled to scheduled
      const item = unscheduledBacklog.find((i) => i.id === itemId);
      if (item) {
        const updated = { ...item, scheduled_at: scheduledAt, layer: 'commit' };
        setUnscheduledBacklog((prev) => prev.filter((i) => i.id !== itemId));
        setScheduledItems((prev) => [...prev, updated]);
      }

      // Also check overdue
      const overdueItem = overdueItems.find((i) => i.id === itemId);
      if (overdueItem) {
        const updated = { ...overdueItem, scheduled_at: scheduledAt, layer: 'commit' };
        setOverdueItems((prev) => prev.filter((i) => i.id !== itemId));
        setScheduledItems((prev) => [...prev, updated]);
      }

      setStats((s) => ({ ...s, itemsScheduled: s.itemsScheduled + 1 }));
      toast.success('Item scheduled');
    },
    [unscheduledBacklog, overdueItems],
  );

  // ── AI Summary fetch ─────────────────────────────────────────────────

  const fetchAISummary = useCallback(async () => {
    setAiSummaryLoading(true);
    setAiSummaryError(false);
    try {
      const res = await fetch('/api/ai/review-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inboxCount: inboxItems.length,
          backlogCount: backlogItems.length,
          somedayCount: somedayItems.length,
          waitingCount: waitingItems.length,
          overdueCount: overdueItems.length,
          completedThisWeek,
          streakCount: reviewStreak.count,
          topItems: backlogItems.slice(0, 5).map((i) => ({
            title: i.title,
            destination: 'backlog',
            age_days: Math.floor(
              (Date.now() - new Date(i.created_at).getTime()) / (1000 * 60 * 60 * 24),
            ),
          })),
        }),
      });
      const data = await res.json();
      if (data.greeting) {
        setAiSummary(data);
      } else {
        setAiSummaryError(true);
      }
    } catch {
      setAiSummaryError(true);
    } finally {
      setAiSummaryLoading(false);
    }
  }, [
    inboxItems.length,
    backlogItems,
    somedayItems.length,
    waitingItems.length,
    overdueItems.length,
    completedThisWeek,
    reviewStreak.count,
  ]);

  // ── Computed data ──────────────────────────────────────────────────────

  const backlogNeedingPriority = backlogItems.filter((item) => {
    const cv = (item.custom_values as Record<string, any>) || {};
    return !cv.priority;
  });

  const staleBacklogItems = backlogItems.filter((item) => {
    const age = differenceInDays(new Date(), new Date(item.created_at));
    return age > 14;
  });

  // Group scheduled items by day
  const scheduledByDay = scheduledItems.reduce<Record<string, Item[]>>(
    (groups, item) => {
      if (!item.scheduled_at) return groups;
      const dayKey = format(new Date(item.scheduled_at), 'yyyy-MM-dd');
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(item);
      return groups;
    },
    {},
  );

  const sortedDayKeys = Object.keys(scheduledByDay).sort();

  // ── Step renderers ─────────────────────────────────────────────────────

  const renderWelcome = () => (
    <motion.div
      className="flex flex-col items-center text-center"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Accent bar */}
      <motion.div
        variants={fadeInUp}
        className="mb-6 h-1 w-20 rounded-full bg-gradient-to-r from-[var(--accent-base)] to-[var(--accent-hover)] opacity-60"
      />

      <motion.h1
        variants={fadeInUp}
        className="text-4xl font-bold tracking-tight text-[var(--text-primary)]"
      >
        Weekly Review
      </motion.h1>

      {/* Streak */}
      <motion.div variants={fadeInUp} className="mt-4">
        {reviewStreak.count > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-sm font-medium text-amber-400">
            <Flame className="h-4 w-4" />
            {reviewStreak.count} week streak
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--text-muted)]">
            <Flame className="h-4 w-4" />
            Start your streak
          </span>
        )}
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={fadeInUp}
        className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {[
          { label: 'Inbox', count: inboxItems.length, icon: Inbox, accent: 'text-blue-400' },
          { label: 'Backlog', count: backlogItems.length, icon: ListTodo, accent: 'text-amber-400' },
          { label: 'Waiting', count: waitingItems.length, icon: Clock, accent: 'text-purple-400' },
          { label: 'Overdue', count: overdueItems.length, icon: AlertTriangle, accent: 'text-red-400' },
          { label: 'Completed', count: completedThisWeek, icon: CheckCircle2, accent: 'text-emerald-400' },
          { label: 'Scheduled', count: scheduledItems.length, icon: Calendar, accent: 'text-cyan-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
          >
            <stat.icon className={cn('h-4 w-4', stat.accent)} />
            <div className="text-left">
              <p className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
                {stat.count}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* AI Review Summary */}
      <motion.div variants={fadeInUp} className="mt-6 w-full max-w-md">
        {!aiSummary && !aiSummaryLoading && (
          <button
            onClick={fetchAISummary}
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--accent-subtle)] bg-[var(--bg-surface)] px-5 py-3.5',
              'text-sm font-medium text-[var(--text-secondary)]',
              'transition-all duration-200 hover:border-[var(--accent-border)] hover:bg-[var(--accent-glow)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
            )}
          >
            <Sparkles className="h-4 w-4 text-[var(--accent-base)]" />
            {aiSummaryError ? 'Retry AI Summary' : 'Get AI Summary'}
          </button>
        )}

        {aiSummaryLoading && (
          <div className="rounded-2xl border border-[var(--accent-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--accent-base)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                AI Review Summary
              </span>
            </div>
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-3/4 rounded-lg bg-[var(--bg-hover)]" />
              <div className="h-4 w-full rounded-lg bg-[var(--bg-hover)]" />
              <div className="h-3 w-5/6 rounded-lg bg-[var(--bg-hover)]" />
              <div className="h-3 w-2/3 rounded-lg bg-[var(--bg-hover)]" />
              <div className="h-3 w-4/5 rounded-lg bg-[var(--bg-hover)]" />
            </div>
          </div>
        )}

        {aiSummary && !aiSummaryLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="rounded-2xl border border-[var(--accent-subtle)] bg-[var(--bg-surface)] p-5 text-left space-y-4"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--accent-base)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                AI Review Summary
              </span>
            </div>

            {/* Greeting */}
            <p className="text-base font-medium text-[var(--text-primary)]">
              {aiSummary.greeting}
            </p>

            {/* Highlights */}
            {aiSummary.highlights.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Highlights
                </p>
                <ul className="space-y-1">
                  {aiSummary.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {aiSummary.concerns.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Watch out for
                </p>
                <ul className="space-y-1">
                  {aiSummary.concerns.map((concern, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {concern}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestion */}
            {aiSummary.suggestion && (
              <div className="rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-glow)] px-4 py-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-base)]" />
                  <p className="text-sm italic text-[var(--text-secondary)]">
                    {aiSummary.suggestion}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Time estimate */}
      <motion.p
        variants={fadeInUp}
        className="mt-6 text-sm text-[var(--text-muted)]"
      >
        ~5-10 minutes
      </motion.p>

      {/* Begin button */}
      <motion.button
        variants={fadeInUp}
        onClick={goForwardWithHook}
        className={cn(
          'mt-6 inline-flex items-center gap-2 rounded-2xl px-8 py-3.5',
          'bg-[var(--accent-base)] text-white font-semibold text-base',
          'shadow-lg shadow-[var(--accent-base)]/20',
          'transition-all duration-200 hover:bg-[var(--accent-active)] hover:shadow-xl hover:shadow-[var(--accent-base)]/30',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
        )}
      >
        Begin Review
        <ChevronRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );

  const renderInboxZero = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Clear your inbox
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Process everything that landed in your inbox this week.
        </p>
      </motion.div>

      {inboxItems.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-12 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="mt-4 text-lg font-semibold text-emerald-400">
            Inbox Zero! Nice work.
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Nothing to process. You are on top of things.
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Inbox className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    {inboxItems.length} item{inboxItems.length !== 1 ? 's' : ''} to process
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Process them to reach inbox zero
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/inbox')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2',
                  'bg-[var(--accent-base)] text-white text-sm font-medium',
                  'transition-all duration-200 hover:bg-[var(--accent-active)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                )}
              >
                Go to Inbox
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Items preview */}
          <motion.div
            variants={staggerContainer}
            className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
          >
            {inboxItems.slice(0, 10).map((item) => (
              <motion.div
                key={item.id}
                variants={listItem}
                className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-5 py-3 last:border-b-0"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="truncate text-sm text-[var(--text-primary)]">
                  {item.title}
                </span>
              </motion.div>
            ))}
            {inboxItems.length > 10 && (
              <div className="px-5 py-3 text-xs text-[var(--text-muted)]">
                +{inboxItems.length - 10} more items
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );

  const renderBacklogReview = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Review your backlog
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {backlogItems.length} item{backlogItems.length !== 1 ? 's' : ''} in your backlog.
          Set priorities and clean up stale items.
        </p>
      </motion.div>

      {/* Items needing priority */}
      {backlogNeedingPriority.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Items needing priority
            </h3>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              {backlogNeedingPriority.length}
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
            {backlogNeedingPriority.slice(0, 15).map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 border-b border-[var(--border-subtle)] px-5 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Created{' '}
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPriority(item.id, opt.value)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all duration-200',
                        opt.color,
                        'hover:scale-105 hover:brightness-110',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {backlogNeedingPriority.length > 15 && (
              <div className="px-5 py-3 text-xs text-[var(--text-muted)]">
                +{backlogNeedingPriority.length - 15} more items without priority
              </div>
            )}
          </div>
        </motion.div>
      )}

      {backlogNeedingPriority.length === 0 && (
        <motion.div
          variants={fadeInUp}
          className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">
            All backlog items have priorities set. Well done.
          </p>
        </motion.div>
      )}

      {/* Stale items */}
      {staleBacklogItems.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Stale items
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              In backlog for over 2 weeks
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
            {staleBacklogItems.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-5 py-3 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {differenceInDays(new Date(), new Date(item.created_at))} days old
                  </p>
                </div>
                <button
                  onClick={() => archiveItem(item.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]',
                    'transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                  )}
                >
                  <Archive className="h-3 w-3" />
                  Archive
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderSomedayMaybe = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Revisit your ideas
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Incubating ideas that might be ready for action.
        </p>
      </motion.div>

      {somedayItems.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-12 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10">
            <Lightbulb className="h-7 w-7 text-purple-400" />
          </div>
          <p className="mt-4 text-base font-semibold text-[var(--text-primary)]">
            No items incubating
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            You are focused!
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
        >
          {somedayItems.map((item) => {
            const cv = (item.custom_values as Record<string, any>) || {};
            const age = differenceInDays(new Date(), new Date(item.created_at));
            const maturity = cv.maturity || null;

            return (
              <motion.div
                key={item.id}
                variants={listItem}
                className="flex flex-col gap-2 border-b border-[var(--border-subtle)] px-5 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {age} day{age !== 1 ? 's' : ''} old
                    </span>
                    {maturity && (
                      <>
                        <span className="text-[var(--text-disabled)]">&middot;</span>
                        <span className="text-[11px] text-purple-400">
                          {maturity}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => promoteToBacklog(item.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400',
                      'transition-all duration-200 hover:bg-emerald-500/20',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                    )}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    Promote
                  </button>
                  <span className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-hover)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)] cursor-default">
                    Keep
                  </span>
                  <button
                    onClick={() => archiveItem(item.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]',
                      'transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                    )}
                  >
                    <Archive className="h-3 w-3" />
                    Archive
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );

  const renderWaitingFor = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Check your follow-ups
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Review items you are waiting on from others.
        </p>
      </motion.div>

      {waitingItems.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-12 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="mt-4 text-base font-semibold text-emerald-400">
            Nothing pending. All clear!
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
        >
          {waitingItems.map((item) => {
            const cv = (item.custom_values as Record<string, any>) || {};
            const waitingSince = item.waiting_since || item.created_at;
            const daysWaiting = differenceInDays(
              new Date(),
              new Date(waitingSince),
            );
            const followUpDate = cv.follow_up_date
              ? new Date(cv.follow_up_date)
              : null;
            const isOverdue = followUpDate ? isPast(followUpDate) : false;

            return (
              <motion.div
                key={item.id}
                variants={listItem}
                className={cn(
                  'flex flex-col gap-2 border-b border-[var(--border-subtle)] px-5 py-3.5 last:border-b-0',
                  isOverdue && 'bg-red-500/[0.03]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {item.waiting_for && (
                        <span className="text-[11px] font-medium text-purple-400">
                          {item.waiting_for}
                        </span>
                      )}
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {daysWaiting} day{daysWaiting !== 1 ? 's' : ''} waiting
                      </span>
                      {followUpDate && (
                        <span
                          className={cn(
                            'text-[11px]',
                            isOverdue
                              ? 'font-semibold text-red-400'
                              : 'text-[var(--text-muted)]',
                          )}
                        >
                          Follow up:{' '}
                          {format(followUpDate, 'MMM d')}
                          {isOverdue && ' (overdue)'}
                        </span>
                      )}
                    </div>
                  </div>

                  {isOverdue && (
                    <span className="shrink-0 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                      Overdue
                    </span>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => markFollowUpSent(item.id)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400',
                      'transition-all duration-200 hover:bg-blue-500/20',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                    )}
                  >
                    Follow up sent
                  </button>
                  <button
                    onClick={() => markResponseReceived(item.id)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400',
                      'transition-all duration-200 hover:bg-emerald-500/20',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                    )}
                  >
                    Response received
                  </button>
                  <button
                    onClick={() => extendFollowUp(item.id)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]',
                      'transition-all duration-200 hover:bg-[var(--bg-hover)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                    )}
                  >
                    Extend +7d
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );

  const renderPlanNextWeek = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Plan your week
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Review what is ahead and schedule unplanned items.
        </p>
      </motion.div>

      {/* Overdue items */}
      {overdueItems.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-semibold text-red-400">
              Overdue
            </h3>
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
              {overdueItems.length}
            </span>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] overflow-hidden">
            {overdueItems.map((item) => (
              <ScheduleRow
                key={item.id}
                item={item}
                onSchedule={scheduleItem}
                isOverdue
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Scheduled by day */}
      {sortedDayKeys.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Upcoming schedule
          </h3>

          {sortedDayKeys.map((dayKey) => (
            <div
              key={dayKey}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
            >
              <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/50 px-5 py-2.5">
                <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {getDayLabel(new Date(dayKey + 'T00:00:00'))}
                </span>
                <span className="rounded-full bg-[var(--bg-hover)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                  {scheduledByDay[dayKey].length}
                </span>
              </div>
              {scheduledByDay[dayKey].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-5 py-2.5 last:border-b-0"
                >
                  <span className="text-xs font-medium tabular-nums text-[var(--text-muted)] w-12 shrink-0">
                    {item.is_all_day
                      ? 'All day'
                      : item.scheduled_at
                        ? format(new Date(item.scheduled_at), 'HH:mm')
                        : ''}
                  </span>
                  <span className="truncate text-sm text-[var(--text-primary)]">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {/* Unscheduled items */}
      {unscheduledBacklog.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Unscheduled backlog
            </h3>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              {unscheduledBacklog.length}
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
            {unscheduledBacklog.slice(0, 15).map((item) => (
              <ScheduleRow
                key={item.id}
                item={item}
                onSchedule={scheduleItem}
              />
            ))}
            {unscheduledBacklog.length > 15 && (
              <div className="px-5 py-3 text-xs text-[var(--text-muted)]">
                +{unscheduledBacklog.length - 15} more unscheduled items
              </div>
            )}
          </div>
        </motion.div>
      )}

      {overdueItems.length === 0 &&
        sortedDayKeys.length === 0 &&
        unscheduledBacklog.length === 0 && (
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-12 text-center"
          >
            <Calendar className="h-8 w-8 text-[var(--text-disabled)]" />
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              No items to schedule. Your week is clear.
            </p>
          </motion.div>
        )}
    </motion.div>
  );

  const renderCelebration = () => {
    const streak = finalStreak ?? reviewStreak.count;
    const totalActions =
      stats.prioritiesSet +
      stats.itemsPromoted +
      stats.itemsArchived +
      stats.itemsScheduled +
      stats.followUpsSent +
      stats.responsesReceived;

    return (
      <motion.div
        className="flex flex-col items-center text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Celebration icon */}
        <motion.div
          variants={celebrationVariants}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10"
        >
          <PartyPopper className="h-12 w-12 text-emerald-400" />
        </motion.div>

        <motion.h2
          variants={fadeInUp}
          className="mt-6 text-3xl font-bold text-[var(--text-primary)]"
        >
          Review Complete!
        </motion.h2>

        {/* Streak display */}
        <motion.div variants={fadeInUp} className="mt-5">
          <div className="inline-flex flex-col items-center gap-1 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-8 py-5">
            <Flame className="h-8 w-8 text-amber-400" />
            <span className="text-4xl font-bold tabular-nums text-amber-400">
              {streak}
            </span>
            <span className="text-sm font-medium text-amber-400/80">
              week streak
            </span>
          </div>
        </motion.div>

        {/* Motivational message */}
        <motion.p
          variants={fadeInUp}
          className="mt-5 max-w-sm text-sm text-[var(--text-muted)]"
        >
          {getMotivationalMessage(streak)}
        </motion.p>

        {/* Stats summary */}
        {totalActions > 0 && (
          <motion.div
            variants={fadeInUp}
            className="mt-6 w-full max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              This session
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Priorities set',
                  value: stats.prioritiesSet,
                  show: stats.prioritiesSet > 0,
                },
                {
                  label: 'Items promoted',
                  value: stats.itemsPromoted,
                  show: stats.itemsPromoted > 0,
                },
                {
                  label: 'Items archived',
                  value: stats.itemsArchived,
                  show: stats.itemsArchived > 0,
                },
                {
                  label: 'Items scheduled',
                  value: stats.itemsScheduled,
                  show: stats.itemsScheduled > 0,
                },
                {
                  label: 'Follow-ups sent',
                  value: stats.followUpsSent,
                  show: stats.followUpsSent > 0,
                },
                {
                  label: 'Responses received',
                  value: stats.responsesReceived,
                  show: stats.responsesReceived > 0,
                },
              ]
                .filter((s) => s.show)
                .map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-2 rounded-xl bg-[var(--bg-hover)] px-3 py-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent-base)]" />
                    <div>
                      <span className="text-sm font-bold tabular-nums text-[var(--text-primary)]">
                        {stat.value}
                      </span>
                      <span className="ml-1.5 text-[11px] text-[var(--text-muted)]">
                        {stat.label}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Done button */}
        <motion.button
          variants={fadeInUp}
          onClick={() => router.push('/today')}
          className={cn(
            'mt-8 inline-flex items-center gap-2 rounded-2xl px-8 py-3.5',
            'bg-[var(--accent-base)] text-white font-semibold text-base',
            'shadow-lg shadow-[var(--accent-base)]/20',
            'transition-all duration-200 hover:bg-[var(--accent-active)] hover:shadow-xl hover:shadow-[var(--accent-base)]/30',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
          )}
        >
          Done
          <CheckCircle2 className="h-4 w-4" />
        </motion.button>
      </motion.div>
    );
  };

  // ── Step content router ────────────────────────────────────────────────

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcome();
      case 1:
        return renderInboxZero();
      case 2:
        return renderBacklogReview();
      case 3:
        return renderSomedayMaybe();
      case 4:
        return renderWaitingFor();
      case 5:
        return renderPlanNextWeek();
      case 6:
        return renderCelebration();
      default:
        return null;
    }
  };

  // ── Main render ────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* Top bar with step indicator */}
      <div className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 px-6 py-4 backdrop-blur-sm">
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        <div className="mt-2 text-center">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {STEP_LABELS[currentStep]}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-2xl px-6 py-8 sm:px-8 sm:py-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={
                direction === 'forward'
                  ? slideVariants.enterFromRight
                  : slideVariants.enterFromLeft
              }
              animate={slideVariants.center}
              exit={
                direction === 'forward'
                  ? slideVariants.exitToLeft
                  : slideVariants.exitToRight
              }
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation bar */}
      {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
        <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 px-6 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <button
              onClick={goBack}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-muted)]',
                'transition-all duration-200 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {/* Skip button */}
              <button
                onClick={goForwardWithHook}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-muted)]',
                  'transition-all duration-200 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
                )}
              >
                Skip
              </button>

              {/* Continue button */}
              <button
                onClick={goForwardWithHook}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-2xl px-5 py-2',
                  'bg-[var(--accent-base)] text-white text-sm font-medium',
                  'shadow-md shadow-[var(--accent-base)]/15',
                  'transition-all duration-200 hover:bg-[var(--accent-active)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
                )}
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back-only bar for celebration step */}
      {currentStep === TOTAL_STEPS - 1 && (
        <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 px-6 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-start">
            <button
              onClick={goBack}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-muted)]',
                'transition-all duration-200 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScheduleRow — inline item with date picker for scheduling
// ---------------------------------------------------------------------------

function ScheduleRow({
  item,
  onSchedule,
  isOverdue = false,
}: {
  item: Item;
  onSchedule: (itemId: string, dateStr: string) => void;
  isOverdue?: boolean;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState('');

  // Default to tomorrow
  const defaultDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const handleSchedule = () => {
    const targetDate = dateValue || defaultDate;
    onSchedule(item.id, targetDate);
    setShowDatePicker(false);
    setDateValue('');
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-b border-[var(--border-subtle)] px-5 py-3 last:border-b-0',
        isOverdue && 'bg-red-500/[0.03]',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {item.title}
          </p>
          {isOverdue && item.scheduled_at && (
            <p className="text-[11px] text-red-400">
              Was scheduled for{' '}
              {format(new Date(item.scheduled_at), 'MMM d')}
            </p>
          )}
        </div>

        {!showDatePicker ? (
          <button
            onClick={() => setShowDatePicker(true)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]',
              'transition-all duration-200 hover:border-[var(--accent-base)]/30 hover:bg-[var(--accent-glow)] hover:text-[var(--accent-base)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
            )}
          >
            <Calendar className="h-3 w-3" />
            Schedule
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="date"
              value={dateValue || defaultDate}
              onChange={(e) => setDateValue(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className={cn(
                'h-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] px-2 text-[11px] text-[var(--text-primary)]',
                'focus:border-[var(--accent-base)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-base)]/40',
              )}
            />
            <button
              onClick={handleSchedule}
              className={cn(
                'inline-flex items-center rounded-lg bg-[var(--accent-base)] px-2.5 py-1 text-[11px] font-medium text-white',
                'transition-all duration-200 hover:bg-[var(--accent-active)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]/40',
              )}
            >
              Set
            </button>
            <button
              onClick={() => {
                setShowDatePicker(false);
                setDateValue('');
              }}
              className="rounded-lg px-1.5 py-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
