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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2410c]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2410c]/40',
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
// Main component
// ---------------------------------------------------------------------------

export function TodayPageClient({
  profile,
  showOnboarding,
  counts,
  overdueItems,
  todayItems,
  completedToday,
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
          {/* Terracotta accent bar */}
          <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-[#c2410c] to-[#f59e0b] opacity-60" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <GreetingIcon className="h-6 w-6 text-[#c2410c] opacity-70" />
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
          {/* Everything-empty state                                           */}
          {/* ---------------------------------------------------------------- */}
          {isEverythingEmpty && (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-16 text-center shadow-[var(--shadow-card)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(194,65,12,0.08)]">
                <Sun className="h-8 w-8 text-[#c2410c] opacity-60" />
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
                    'rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2410c]/40',
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
