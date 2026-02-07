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
      {/* Page header */}
      <div className="border-b border-[var(--border-subtle)] px-6 py-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {greeting}, {userName}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Here&apos;s what&apos;s on your mind today
          </p>
        </motion.div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Three-Layer Flow - The signature visual */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <Link href="/inbox" className="group">
              <div className="relative overflow-hidden rounded-xl border border-[var(--layer-capture-border)] bg-[var(--layer-capture-bg)] p-5 transition-all duration-200 hover:border-[var(--layer-capture)] hover:bg-[rgba(96,165,250,0.08)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(96,165,250,0.10)]">
                    <Inbox className="h-5 w-5 text-[var(--layer-capture)]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--layer-capture)]/70">Capture</p>
                    <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{stats.inboxCount}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">items in inbox</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-[var(--layer-capture)]/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span>Open inbox</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
            <Link href="/review" className="group">
              <div className="relative overflow-hidden rounded-xl border border-[var(--layer-process-border)] bg-[var(--layer-process-bg)] p-5 transition-all duration-200 hover:border-[var(--layer-process)] hover:bg-[rgba(251,191,36,0.08)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(251,191,36,0.10)]">
                    <ArrowRightLeft className="h-5 w-5 text-[var(--layer-process)]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--layer-process)]/70">Process</p>
                    <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{stats.processingCount}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">items to organize</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-[var(--layer-process)]/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span>Start processing</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
            <Link href="/commit" className="group">
              <div className="relative overflow-hidden rounded-xl border border-[var(--layer-commit-border)] bg-[var(--layer-commit-bg)] p-5 transition-all duration-200 hover:border-[var(--layer-commit)] hover:bg-[rgba(52,211,153,0.08)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(52,211,153,0.10)]">
                    <CalendarCheck className="h-5 w-5 text-[var(--layer-commit)]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--layer-commit)]/70">Commit</p>
                    <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{stats.todayCount}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  today&apos;s commitments
                  {stats.completedTodayCount > 0 && (
                    <span className="ml-1 text-[var(--layer-commit)]">
                      ({stats.completedTodayCount} done)
                    </span>
                  )}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs text-[var(--layer-commit)]/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span>View schedule</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Main Content - Two column, focused */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Commitments - Primary focus */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="h-4 w-4 text-[var(--layer-commit)]" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Today&apos;s Commitments</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] h-7 text-xs" asChild>
                  <Link href="/commit">
                    View all
                    <ChevronRight className="ml-0.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>
              <div className="p-4">
                {todayItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
                      <CalendarCheck className="h-5 w-5 text-[var(--text-disabled)]" />
                    </div>
                    <p className="mt-4 text-sm text-[var(--text-muted)]">
                      No commitments for today
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 h-8 text-xs" asChild>
                      <Link href="/review">
                        Schedule something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {todayItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3.5 transition-colors hover:border-[var(--border-default)]"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--layer-commit-bg)]">
                          <Clock className="h-3.5 w-3.5 text-[var(--layer-commit)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {item.scheduled_at && (
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {new Date(item.scheduled_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>

            {/* Recent Captures */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Inbox className="h-4 w-4 text-[var(--layer-capture)]" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] h-7 text-xs" asChild>
                  <Link href="/inbox">
                    View inbox
                    <ChevronRight className="ml-0.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>
              <div className="p-4">
                {recentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
                      <Inbox className="h-5 w-5 text-[var(--text-disabled)]" />
                    </div>
                    <p className="mt-4 text-sm text-[var(--text-muted)]">
                      No recent items
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 h-8 text-xs" asChild>
                      <Link href="/inbox">
                        Capture something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recentItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3.5 transition-colors hover:border-[var(--border-default)]"
                      >
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          item.is_completed
                            ? "bg-[var(--layer-commit-bg)]"
                            : item.layer === 'capture'
                              ? "bg-[var(--layer-capture-bg)]"
                              : item.layer === 'process'
                                ? "bg-[var(--layer-process-bg)]"
                                : "bg-[var(--layer-commit-bg)]"
                        )}>
                          {item.is_completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--layer-commit)]" />
                          ) : item.layer === 'capture' ? (
                            <Inbox className="h-3.5 w-3.5 text-[var(--layer-capture)]" />
                          ) : item.layer === 'process' ? (
                            <ArrowRightLeft className="h-3.5 w-3.5 text-[var(--layer-process)]" />
                          ) : (
                            <CalendarCheck className="h-3.5 w-3.5 text-[var(--layer-commit)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            item.is_completed && "completed-text"
                          )}>
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {formatRelativeTime(item.created_at)}
                          </p>
                        </div>
                      </li>
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
