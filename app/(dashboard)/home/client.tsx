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

      {/* ZEN FLOW: Page header with ambient glow, no border */}
      <div className="relative px-8 py-12">
        {/* Ambient gradient glow behind greeting */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-96 opacity-30 blur-3xl bg-gradient-to-r from-[var(--layer-capture)] via-[var(--layer-process)] to-[var(--layer-commit)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center"
        >
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] mb-3">
            {greeting}, {userName}
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            Here&apos;s what&apos;s on your mind today
          </p>
        </motion.div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* ZEN FLOW: Three-Layer Flow Cards - Floating islands */}
          <div className="grid gap-6 sm:grid-cols-3">
            {/* CAPTURE Layer Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href="/inbox" className="group block">
                <div className="zen-card card-hover relative overflow-hidden p-6 transition-all duration-300 group-hover:glow-capture">
                  {/* Top gradient accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--layer-capture)] to-transparent opacity-60" />

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--layer-capture)]/10 transition-transform duration-300 group-hover:scale-110">
                      <Inbox className="h-6 w-6 text-[var(--layer-capture)]" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--layer-capture)]/70 mb-3">
                        Capture
                      </p>
                      <p className="text-5xl font-bold tracking-tight tabular-nums text-[var(--text-primary)] mb-2">
                        {stats.inboxCount}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        items in inbox
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[var(--layer-capture)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span>Open inbox</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* PROCESS Layer Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href="/review" className="group block">
                <div className="zen-card card-hover relative overflow-hidden p-6 transition-all duration-300 group-hover:glow-process">
                  {/* Top gradient accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--layer-process)] to-transparent opacity-60" />

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--layer-process)]/10 transition-transform duration-300 group-hover:scale-110">
                      <ArrowRightLeft className="h-6 w-6 text-[var(--layer-process)]" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--layer-process)]/70 mb-3">
                        Process
                      </p>
                      <p className="text-5xl font-bold tracking-tight tabular-nums text-[var(--text-primary)] mb-2">
                        {stats.processingCount}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        items to organize
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[var(--layer-process)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span>Start processing</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* COMMIT Layer Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href="/commit" className="group block">
                <div className="zen-card card-hover relative overflow-hidden p-6 transition-all duration-300 group-hover:glow-commit">
                  {/* Top gradient accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--layer-commit)] to-transparent opacity-60" />

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--layer-commit)]/10 transition-transform duration-300 group-hover:scale-110">
                      <CalendarCheck className="h-6 w-6 text-[var(--layer-commit)]" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--layer-commit)]/70 mb-3">
                        Commit
                      </p>
                      <p className="text-5xl font-bold tracking-tight tabular-nums text-[var(--text-primary)] mb-2">
                        {stats.todayCount}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        today&apos;s commitments
                        {stats.completedTodayCount > 0 && (
                          <span className="ml-1 text-[var(--layer-commit)]">
                            ({stats.completedTodayCount} done)
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[var(--layer-commit)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span>View schedule</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* ZEN FLOW: Main Content Panels - Two column layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Commitments Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="zen-card overflow-hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--layer-commit)]/10">
                    <CalendarCheck className="h-4 w-4 text-[var(--layer-commit)]" />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                    Today
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] h-7 text-xs"
                  asChild
                >
                  <Link href="/commit">
                    View all
                    <ChevronRight className="ml-0.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              {/* Panel content */}
              <div className="p-6">
                {todayItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-hover)] mb-4">
                      <CalendarCheck className="h-7 w-7 text-[var(--text-disabled)]" />
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      No commitments for today
                    </p>
                    <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                      <Link href="/review">
                        Schedule something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {todayItems.map((item) => (
                      <li
                        key={item.id}
                        className="zen-card mini-zen-card p-4 transition-all duration-200 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-commit)]/10">
                            <Clock className="h-4 w-4 text-[var(--layer-commit)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {item.title}
                            </p>
                            {item.scheduled_at && (
                              <p className="text-xs text-[var(--text-muted)] mt-1">
                                {new Date(item.scheduled_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>

            {/* Recent Activity Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="zen-card overflow-hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--layer-capture)]/10">
                    <Inbox className="h-4 w-4 text-[var(--layer-capture)]" />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                    Recent Activity
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] h-7 text-xs"
                  asChild
                >
                  <Link href="/inbox">
                    View inbox
                    <ChevronRight className="ml-0.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              {/* Panel content */}
              <div className="p-6">
                {recentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-hover)] mb-4">
                      <Inbox className="h-7 w-7 text-[var(--text-disabled)]" />
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      No recent items
                    </p>
                    <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                      <Link href="/inbox">
                        Capture something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {recentItems.map((item) => (
                      <li
                        key={item.id}
                        className="zen-card mini-zen-card p-4 transition-all duration-200 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl",
                            item.is_completed
                              ? "bg-[var(--layer-commit)]/10"
                              : item.layer === 'capture'
                                ? "bg-[var(--layer-capture)]/10"
                                : item.layer === 'process'
                                  ? "bg-[var(--layer-process)]/10"
                                  : "bg-[var(--layer-commit)]/10"
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
                              item.is_completed
                                ? "completed-text"
                                : "text-[var(--text-primary)]"
                            )}>
                              {item.title}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {formatRelativeTime(item.created_at)}
                            </p>
                          </div>
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
