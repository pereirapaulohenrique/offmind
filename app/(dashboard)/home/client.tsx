'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Circle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/dates';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useUIStore } from '@/stores/ui';
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

type SurfaceView = 'surface' | 'agenda' | 'flow';

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
  const { surfaceViewType, setSurfaceViewType } = useUIStore();

  const handleOnboardingComplete = async () => {
    setOnboardingVisible(false);
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', profile?.id);
    } catch (e) {
      // Silently fail
    }
  };

  // Current commitment (first uncompleted today item)
  const currentCommitment = todayItems.find(item => !item.is_completed);
  const remainingCount = todayItems.filter(item => !item.is_completed).length;

  return (
    <div className="flex h-full flex-col overflow-auto">
      {onboardingVisible && (
        <OnboardingFlow
          userName={userName}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* View toggle (top right) */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <div />
        <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-card/50 p-0.5">
          {(['surface', 'agenda', 'flow'] as SurfaceView[]).map((view) => (
            <button
              key={view}
              onClick={() => setSurfaceViewType(view)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                surfaceViewType === view
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {surfaceViewType === 'surface' ? (
          <SurfaceView
            key="surface"
            greeting={greeting}
            userName={userName}
            currentCommitment={currentCommitment}
            remainingCount={remainingCount}
            stats={stats}
          />
        ) : surfaceViewType === 'agenda' ? (
          <AgendaHomeView
            key="agenda"
            greeting={greeting}
            userName={userName}
            stats={stats}
            todayItems={todayItems}
            recentItems={recentItems}
          />
        ) : (
          <FlowView
            key="flow"
            stats={stats}
            todayItems={todayItems}
            recentItems={recentItems}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Surface view — zen, one commitment at a time
function SurfaceView({
  greeting,
  userName,
  currentCommitment,
  remainingCount,
  stats,
}: {
  greeting: string;
  userName: string;
  currentCommitment: Item | undefined;
  remainingCount: number;
  stats: HomePageClientProps['stats'];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-1 flex-col items-center justify-center px-6"
    >
      <div className="w-full max-w-md text-center">
        {/* Greeting */}
        <p className="text-sm text-muted-foreground mb-1">
          {greeting}, {userName}
        </p>

        {currentCommitment ? (
          <>
            {/* Current commitment — big, focused */}
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-6 mb-3">
              {currentCommitment.title}
            </h1>

            {currentCommitment.scheduled_at && (
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-8">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {new Date(currentCommitment.scheduled_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {currentCommitment.duration_minutes && (
                  <span className="text-muted-foreground/50">
                    · {currentCommitment.duration_minutes}m
                  </span>
                )}
              </div>
            )}

            {/* Progress ring / remaining */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary/60" />
                <span>{remainingCount} remaining today</span>
              </div>
              {stats.completedTodayCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/60" />
                  <span>{stats.completedTodayCount} done</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Empty state — calm, inviting */}
            <div className="mt-8 mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
                <Sparkles className="h-7 w-7 text-primary/40" />
              </div>
            </div>

            {stats.todayCount === 0 && stats.completedTodayCount === 0 ? (
              <div>
                <h2 className="text-lg font-medium text-foreground/80">
                  No commitments for today
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Process your inbox or schedule items from your backlog
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-foreground/80">
                  All done for today
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stats.completedTodayCount} item{stats.completedTodayCount !== 1 ? 's' : ''} completed
                </p>
              </div>
            )}
          </>
        )}

        {/* Quick stats row */}
        <div className="mt-12 flex items-center justify-center gap-8">
          <Link href="/capture" className="group flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/[0.06] transition-colors group-hover:bg-blue-500/[0.12]">
              <Inbox className="h-4 w-4 text-blue-400/70" />
            </div>
            <span className="text-xs text-muted-foreground">
              {stats.inboxCount > 0 ? `${stats.inboxCount} inbox` : 'Inbox'}
            </span>
          </Link>

          <Link href="/process" className="group flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.06] transition-colors group-hover:bg-primary/[0.12]">
              <ArrowRightLeft className="h-4 w-4 text-primary/70" />
            </div>
            <span className="text-xs text-muted-foreground">
              {stats.processingCount > 0 ? `${stats.processingCount} process` : 'Process'}
            </span>
          </Link>

          <Link href="/commit" className="group flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/[0.06] transition-colors group-hover:bg-emerald-500/[0.12]">
              <CalendarCheck className="h-4 w-4 text-emerald-400/70" />
            </div>
            <span className="text-xs text-muted-foreground">
              {stats.todayCount > 0 ? `${stats.todayCount} today` : 'Calendar'}
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Agenda view — today's list + recent activity (similar to old home but cleaner)
function AgendaHomeView({
  greeting,
  userName,
  stats,
  todayItems,
  recentItems,
}: {
  greeting: string;
  userName: string;
  stats: HomePageClientProps['stats'];
  todayItems: Item[];
  recentItems: Item[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex-1 p-6"
    >
      <div className="mx-auto max-w-2xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {greeting}, {userName}
          </h1>
          {stats.completedTodayCount > 0 && (
            <p className="mt-1.5 text-sm text-emerald-400/70">
              {stats.completedTodayCount} completed today
            </p>
          )}
        </div>

        {/* Today's commitments */}
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarCheck className="h-3.5 w-3.5" />
            Today
          </h2>
          {todayItems.length === 0 ? (
            <p className="text-sm text-muted-foreground/50 pl-5">No commitments scheduled</p>
          ) : (
            <ul className="space-y-1.5">
              {todayItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
                >
                  <Circle
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      item.is_completed ? 'text-emerald-400 fill-emerald-400' : 'text-border'
                    )}
                  />
                  <span className={cn(
                    'flex-1 text-sm',
                    item.is_completed && 'completed-text'
                  )}>
                    {item.title}
                  </span>
                  {item.scheduled_at && !item.is_all_day && (
                    <span className="text-xs text-muted-foreground/50">
                      {new Date(item.scheduled_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Inbox className="h-3.5 w-3.5" />
            Recent
          </h2>
          {recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground/50 pl-5">No recent activity</p>
          ) : (
            <ul className="space-y-1.5">
              {recentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
                >
                  <div className={cn(
                    'h-1.5 w-1.5 rounded-full flex-shrink-0',
                    item.layer === 'capture' ? 'bg-blue-400/50' :
                    item.layer === 'process' ? 'bg-primary/50' :
                    'bg-emerald-400/50'
                  )} />
                  <span className={cn(
                    'flex-1 text-sm truncate',
                    item.is_completed && 'completed-text'
                  )}>
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground/40">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Flow view — vertical stream showing inbox → process → commit pipeline
function FlowView({
  stats,
  todayItems,
  recentItems,
}: {
  stats: HomePageClientProps['stats'];
  todayItems: Item[];
  recentItems: Item[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex-1 p-6"
    >
      <div className="mx-auto max-w-md space-y-4">
        {/* Capture lane */}
        <Link href="/capture" className="group block">
          <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.02] p-5 transition-all hover:border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-blue-400/60" />
                <span className="text-xs font-medium uppercase tracking-wide text-blue-400/60">Capture</span>
              </div>
              <span className="text-xl font-bold text-foreground">{stats.inboxCount}</span>
            </div>
            {recentItems.filter(i => i.layer === 'capture').slice(0, 2).map((item) => (
              <p key={item.id} className="text-sm text-muted-foreground truncate pl-6">
                {item.title}
              </p>
            ))}
          </div>
        </Link>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="h-4 w-px bg-border/40" />
        </div>

        {/* Process lane */}
        <Link href="/process" className="group block">
          <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-5 transition-all hover:border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary/60" />
                <span className="text-xs font-medium uppercase tracking-wide text-primary/60">Process</span>
              </div>
              <span className="text-xl font-bold text-foreground">{stats.processingCount}</span>
            </div>
          </div>
        </Link>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="h-4 w-px bg-border/40" />
        </div>

        {/* Commit lane */}
        <Link href="/commit" className="group block">
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-5 transition-all hover:border-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-emerald-400/60" />
                <span className="text-xs font-medium uppercase tracking-wide text-emerald-400/60">Commit</span>
              </div>
              <span className="text-xl font-bold text-foreground">{stats.todayCount}</span>
            </div>
            {todayItems.filter(i => !i.is_completed).slice(0, 2).map((item) => (
              <p key={item.id} className="text-sm text-muted-foreground truncate pl-6">
                {item.title}
              </p>
            ))}
            {stats.completedTodayCount > 0 && (
              <p className="text-xs text-emerald-400/40 pl-6 mt-1">
                {stats.completedTodayCount} completed
              </p>
            )}
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
