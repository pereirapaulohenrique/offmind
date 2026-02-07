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

const neuralEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

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
    <div className="flex h-full flex-col relative" style={{ background: 'linear-gradient(180deg, #060a14 0%, #0a0f1a 100%)' }}>
      {/* HUD grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Onboarding overlay for first-time users */}
      {onboardingVisible && (
        <OnboardingFlow
          userName={userName}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Page header */}
      <div className="px-6 py-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: neuralEase }}
        >
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {greeting}, {userName}
          </h1>
          <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.15em] text-[#00d4ff]/60">
            System Status: Online
          </p>

          {/* Metric badges row */}
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.04)] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#00d4ff]/70">Uptime: 100%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.04)] px-2.5 py-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Items: <span className="text-[#00d4ff]/80">{stats.totalItems}</span></span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.04)] px-2.5 py-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Processed: <span className="text-[#00d4ff]/80">{stats.totalCompleted}</span></span>
            </span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 overflow-auto p-6 relative z-10">
        <div className="mx-auto max-w-5xl space-y-4">
          {/* Three-Layer Flow - Neural panels */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05, ease: neuralEase }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {/* Capture card */}
            <Link href="/inbox" className="group">
              <div className="relative overflow-hidden rounded-lg border border-[rgba(96,165,250,0.12)] bg-[rgba(96,165,250,0.03)] p-5 transition-all duration-150 hover:border-[rgba(96,165,250,0.25)] hover:shadow-[0_0_20px_rgba(96,165,250,0.06)]">
                <div className="mb-1">
                  <p className="text-4xl font-mono font-bold tabular-nums text-[var(--layer-capture)]">{stats.inboxCount}</p>
                  <div className="mt-2 h-px w-10" style={{ background: 'var(--layer-capture)' }} />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--layer-capture)]/50">Capture</p>
                <p className="mt-1 font-mono text-xs text-[#00d4ff]/50">items in inbox</p>
                <div className="mt-3 flex items-center gap-1 font-mono text-xs text-[var(--layer-capture)]/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <span className="text-[var(--layer-capture)]/60">&gt;</span>
                  <span>Open inbox</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* Process card */}
            <Link href="/review" className="group">
              <div className="relative overflow-hidden rounded-lg border border-[rgba(251,191,36,0.12)] bg-[rgba(251,191,36,0.03)] p-5 transition-all duration-150 hover:border-[rgba(251,191,36,0.25)] hover:shadow-[0_0_20px_rgba(251,191,36,0.06)]">
                <div className="mb-1">
                  <p className="text-4xl font-mono font-bold tabular-nums text-[var(--layer-process)]">{stats.processingCount}</p>
                  <div className="mt-2 h-px w-10" style={{ background: 'var(--layer-process)' }} />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--layer-process)]/50">Process</p>
                <p className="mt-1 font-mono text-xs text-[#00d4ff]/50">items to organize</p>
                <div className="mt-3 flex items-center gap-1 font-mono text-xs text-[var(--layer-process)]/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <span className="text-[var(--layer-process)]/60">&gt;</span>
                  <span>Start processing</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* Commit card */}
            <Link href="/commit" className="group">
              <div className="relative overflow-hidden rounded-lg border border-[rgba(52,211,153,0.12)] bg-[rgba(52,211,153,0.03)] p-5 transition-all duration-150 hover:border-[rgba(52,211,153,0.25)] hover:shadow-[0_0_20px_rgba(52,211,153,0.06)]">
                <div className="mb-1">
                  <p className="text-4xl font-mono font-bold tabular-nums text-[var(--layer-commit)]">{stats.todayCount}</p>
                  <div className="mt-2 h-px w-10" style={{ background: 'var(--layer-commit)' }} />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--layer-commit)]/50">Commit</p>
                <p className="mt-1 font-mono text-xs text-[#00d4ff]/50">
                  today&apos;s commitments
                  {stats.completedTodayCount > 0 && (
                    <span className="ml-1 text-[var(--layer-commit)]/70">
                      ({stats.completedTodayCount} done)
                    </span>
                  )}
                </p>
                <div className="mt-3 flex items-center gap-1 font-mono text-xs text-[var(--layer-commit)]/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <span className="text-[var(--layer-commit)]/60">&gt;</span>
                  <span>View schedule</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Main Content - Two column, focused */}
          <div className="grid gap-3 lg:grid-cols-2">
            {/* Today's Commitments - Primary focus */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: 0.1, ease: neuralEase }}
              className="neural-card rounded-lg border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.02)]"
            >
              <div className="flex items-center justify-between border-b border-[rgba(0,212,255,0.08)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00d4ff]" />
                  <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-primary)]">Today&apos;s Commitments</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-[var(--text-muted)] hover:text-[#00d4ff] h-6 font-mono text-[10px] uppercase tracking-wider" asChild>
                  <Link href="/commit">
                    View all <span className="ml-1">&rarr;</span>
                  </Link>
                </Button>
              </div>
              <div className="p-3">
                {todayItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="font-mono text-xs text-[var(--text-muted)]/60 tracking-wide">
                      &gt; No tasks scheduled. System idle.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 h-7 font-mono text-[10px] uppercase tracking-wider border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.3)] hover:bg-[rgba(0,212,255,0.05)]" asChild>
                      <Link href="/review">
                        Schedule something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {todayItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-md border border-[rgba(0,212,255,0.06)] bg-[rgba(0,212,255,0.02)] p-3 transition-colors duration-150 hover:border-[rgba(0,212,255,0.15)] border-l-2 border-l-[var(--layer-commit)]"
                      >
                        <Clock className="h-3 w-3 flex-shrink-0 text-[var(--layer-commit)]/60" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[var(--text-primary)]">{item.title}</p>
                          {item.scheduled_at && (
                            <p className="font-mono text-[10px] text-[var(--text-muted)]/70 mt-0.5 tabular-nums">
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

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: 0.15, ease: neuralEase }}
              className="neural-card rounded-lg border border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.02)]"
            >
              <div className="flex items-center justify-between border-b border-[rgba(0,212,255,0.08)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00d4ff]" />
                  <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-primary)]">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-[var(--text-muted)] hover:text-[#00d4ff] h-6 font-mono text-[10px] uppercase tracking-wider" asChild>
                  <Link href="/inbox">
                    View inbox <span className="ml-1">&rarr;</span>
                  </Link>
                </Button>
              </div>
              <div className="p-3">
                {recentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="font-mono text-xs text-[var(--text-muted)]/60 tracking-wide">
                      &gt; No recent activity detected.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 h-7 font-mono text-[10px] uppercase tracking-wider border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.3)] hover:bg-[rgba(0,212,255,0.05)]" asChild>
                      <Link href="/inbox">
                        Capture something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {recentItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-md border border-[rgba(0,212,255,0.06)] bg-[rgba(0,212,255,0.02)] p-3 transition-colors duration-150 hover:border-[rgba(0,212,255,0.15)]"
                      >
                        <div className={cn(
                          "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md",
                          item.is_completed
                            ? "bg-[rgba(52,211,153,0.08)]"
                            : item.layer === 'capture'
                              ? "bg-[rgba(96,165,250,0.08)]"
                              : item.layer === 'process'
                                ? "bg-[rgba(251,191,36,0.08)]"
                                : "bg-[rgba(52,211,153,0.08)]"
                        )}>
                          {item.is_completed ? (
                            <CheckCircle2 className="h-3 w-3 text-[var(--layer-commit)]" />
                          ) : item.layer === 'capture' ? (
                            <Inbox className="h-3 w-3 text-[var(--layer-capture)]" />
                          ) : item.layer === 'process' ? (
                            <ArrowRightLeft className="h-3 w-3 text-[var(--layer-process)]" />
                          ) : (
                            <CalendarCheck className="h-3 w-3 text-[var(--layer-commit)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            item.is_completed && "line-through text-[var(--text-muted)]/50"
                          )}>
                            {item.title}
                          </p>
                          <p className="font-mono text-[10px] text-[var(--text-muted)]/60 mt-0.5 tabular-nums">
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
