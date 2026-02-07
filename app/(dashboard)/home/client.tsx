'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/dates';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { createClient } from '@/lib/supabase/client';
import type { Item, Profile } from '@/types/database';

interface HomePageClientProps {
  profile: Profile | null;
  showOnboarding?: boolean;
  stats: {
    inboxCount: number;
    processingCount: number;
    todayCount: number;
    completedTodayCount: number;
    totalItems: number;
    totalCompleted: number;
    spacesCount: number;
    projectsCount: number;
  };
  todayItems: Item[];
  recentItems: Item[];
}

export function HomePageClient({
  profile,
  showOnboarding = false,
  stats,
  todayItems,
  recentItems,
}: HomePageClientProps) {
  const greeting = getGreeting();
  const userName = profile?.full_name?.split(' ')[0] || 'there';
  const [onboardingVisible, setOnboardingVisible] = useState(showOnboarding);

  const handleOnboardingComplete = async () => {
    setOnboardingVisible(false);
    // Mark onboarding as completed in the database
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', profile?.id);
    } catch (e) {
      // Silently fail - not critical
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Onboarding overlay for first-time users */}
      {onboardingVisible && (
        <OnboardingFlow
          userName={userName}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Page header — warm, generous, no hard border */}
      <div className="px-8 py-7">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Subtle warm decorative gradient bar */}
          <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-[#c2410c] to-[#f59e0b] opacity-60" />
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {greeting}, {userName}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Let&apos;s see what&apos;s growing today
          </p>
        </motion.div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Three-Layer Flow — Bloom cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.05 }}
            className="grid gap-5 sm:grid-cols-3"
          >
            {/* Capture Card */}
            <Link href="/inbox" className="group">
              <div className="bloom-card tactile-press relative overflow-hidden rounded-2xl border border-[var(--layer-capture-border)] bg-[var(--layer-capture-bg)] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--layer-capture)] hover:bg-[rgba(96,165,250,0.08)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(96,165,250,0.12)]">
                    <Inbox className="h-6 w-6 text-[var(--layer-capture)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--layer-capture)]/70">Capture</p>
                    <p className="text-3xl font-bold tracking-tight tabular-nums text-[var(--layer-capture)]">{stats.inboxCount}</p>
                  </div>
                </div>
                <div className="mt-1 h-0.5 w-12 rounded-full bg-[var(--layer-capture)] opacity-30" />
                <p className="mt-3 text-sm text-[var(--text-muted)]">thoughts waiting in your inbox</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[var(--layer-capture)]/60 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5">
                  <span>Open inbox</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>

            {/* Process Card */}
            <Link href="/review" className="group">
              <div className="bloom-card tactile-press relative overflow-hidden rounded-2xl border border-[var(--layer-process-border)] bg-[var(--layer-process-bg)] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--layer-process)] hover:bg-[rgba(251,191,36,0.08)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(251,191,36,0.12)]">
                    <ArrowRightLeft className="h-6 w-6 text-[var(--layer-process)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--layer-process)]/70">Process</p>
                    <p className="text-3xl font-bold tracking-tight tabular-nums text-[var(--layer-process)]">{stats.processingCount}</p>
                  </div>
                </div>
                <div className="mt-1 h-0.5 w-12 rounded-full bg-[var(--layer-process)] opacity-30" />
                <p className="mt-3 text-sm text-[var(--text-muted)]">items ready to organize</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[var(--layer-process)]/60 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5">
                  <span>Start processing</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>

            {/* Commit Card */}
            <Link href="/commit" className="group">
              <div className="bloom-card tactile-press relative overflow-hidden rounded-2xl border border-[var(--layer-commit-border)] bg-[var(--layer-commit-bg)] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--layer-commit)] hover:bg-[rgba(52,211,153,0.08)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(52,211,153,0.12)]">
                    <CalendarCheck className="h-6 w-6 text-[var(--layer-commit)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--layer-commit)]/70">Commit</p>
                    <p className="text-3xl font-bold tracking-tight tabular-nums text-[var(--layer-commit)]">{stats.todayCount}</p>
                  </div>
                </div>
                <div className="mt-1 h-0.5 w-12 rounded-full bg-[var(--layer-commit)] opacity-30" />
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  today&apos;s commitments
                  {stats.completedTodayCount > 0 && (
                    <span className="ml-1.5 font-medium text-[var(--layer-commit)]">
                      ({stats.completedTodayCount} done!)
                    </span>
                  )}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[var(--layer-commit)]/60 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5">
                  <span>View schedule</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Main Content - Two column, focused */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Commitments - Primary focus */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
              className="bloom-card rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--layer-commit-bg)]">
                    <CalendarCheck className="h-4 w-4 text-[var(--layer-commit)]" />
                  </div>
                  <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">Today&apos;s Commitments</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-[#c2410c] hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.08)] h-8 text-xs font-medium rounded-xl" asChild>
                  <Link href="/commit">
                    View all
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="mx-6 h-px rounded-full bg-[var(--border-subtle)]" />
              <div className="p-5">
                {todayItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-hover)]">
                      <CalendarCheck className="h-6 w-6 text-[var(--text-disabled)]" />
                    </div>
                    <p className="mt-5 text-sm text-[var(--text-muted)]">
                      Your day is wide open. What will you commit to?
                    </p>
                    <Button variant="outline" size="sm" className="mt-5 h-9 text-sm rounded-xl border-[var(--border-default)]" asChild>
                      <Link href="/review">
                        Schedule something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {todayItems.map((item, index) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.05 }}
                        className="flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-4 transition-all duration-300 hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:shadow-sm"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-commit-bg)]">
                          <Clock className="h-4 w-4 text-[var(--layer-commit)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[var(--text-primary)]">{item.title}</p>
                          {item.scheduled_at && (
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {new Date(item.scheduled_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.15 }}
              className="bloom-card rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--layer-capture-bg)]">
                    <Inbox className="h-4 w-4 text-[var(--layer-capture)]" />
                  </div>
                  <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-[#c2410c] hover:text-[#c2410c] hover:bg-[rgba(194,65,12,0.08)] h-8 text-xs font-medium rounded-xl" asChild>
                  <Link href="/inbox">
                    View inbox
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="mx-6 h-px rounded-full bg-[var(--border-subtle)]" />
              <div className="p-5">
                {recentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-hover)]">
                      <Inbox className="h-6 w-6 text-[var(--text-disabled)]" />
                    </div>
                    <p className="mt-5 text-sm text-[var(--text-muted)]">
                      Nothing here yet. Capture your first thought!
                    </p>
                    <Button variant="outline" size="sm" className="mt-5 h-9 text-sm rounded-xl border-[var(--border-default)]" asChild>
                      <Link href="/inbox">
                        Capture something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {recentItems.map((item, index) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.05 }}
                        className="flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-4 transition-all duration-300 hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:shadow-sm"
                      >
                        <div className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl",
                          item.is_completed
                            ? "bg-[var(--layer-commit-bg)]"
                            : item.layer === 'capture'
                              ? "bg-[var(--layer-capture-bg)]"
                              : item.layer === 'process'
                                ? "bg-[var(--layer-process-bg)]"
                                : "bg-[var(--layer-commit-bg)]"
                        )}>
                          {item.is_completed ? (
                            <CheckCircle2 className="h-4 w-4 text-[var(--layer-commit)]" />
                          ) : item.layer === 'capture' ? (
                            <Inbox className="h-4 w-4 text-[var(--layer-capture)]" />
                          ) : item.layer === 'process' ? (
                            <ArrowRightLeft className="h-4 w-4 text-[var(--layer-process)]" />
                          ) : (
                            <CalendarCheck className="h-4 w-4 text-[var(--layer-commit)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            item.is_completed && "completed-text text-[var(--text-muted)] line-through decoration-[var(--text-disabled)]"
                          )}>
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {formatRelativeTime(item.created_at)}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
