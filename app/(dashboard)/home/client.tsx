'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Inbox,
  ArrowRightLeft,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  FolderOpen,
  Clock,
  Sparkles,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/dates';
import type { Item, Profile } from '@/types/database';

interface HomePageClientProps {
  profile: Profile | null;
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
  stats,
  todayItems,
  recentItems,
}: HomePageClientProps) {
  const completionRate = stats.totalItems > 0
    ? Math.round((stats.totalCompleted / stats.totalItems) * 100)
    : 0;

  const greeting = getGreeting();
  const userName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Page header */}
      <div className="border-b border-border px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}, {userName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's on your mind today
          </p>
        </motion.div>
      </div>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              icon={Inbox}
              label="Inbox"
              value={stats.inboxCount}
              description="items to process"
              href="/capture"
              color="blue"
            />
            <StatCard
              icon={ArrowRightLeft}
              label="Processing"
              value={stats.processingCount}
              description="items organized"
              href="/process"
              color="purple"
            />
            <StatCard
              icon={CalendarCheck}
              label="Today"
              value={stats.todayCount}
              description="commitments"
              href="/commit"
              color="green"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={stats.completedTodayCount}
              description="today"
              color="emerald"
            />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Commitments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-green-500" />
                  <h2 className="font-semibold">Today's Commitments</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/commit">
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="p-4">
                {todayItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarCheck className="h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No commitments for today
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link href="/process">
                        Schedule something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {todayItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                          <Clock className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {item.scheduled_at && (
                            <p className="text-xs text-muted-foreground">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-blue-500" />
                  <h2 className="font-semibold">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/capture">
                    View inbox
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="p-4">
                {recentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Inbox className="h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No recent items
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link href="/capture">
                        Capture something
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recentItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                      >
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          item.is_completed
                            ? "bg-emerald-500/10"
                            : item.layer === 'capture'
                              ? "bg-blue-500/10"
                              : item.layer === 'process'
                                ? "bg-purple-500/10"
                                : "bg-green-500/10"
                        )}>
                          {item.is_completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : item.layer === 'capture' ? (
                            <Inbox className="h-4 w-4 text-blue-500" />
                          ) : item.layer === 'process' ? (
                            <ArrowRightLeft className="h-4 w-4 text-purple-500" />
                          ) : (
                            <CalendarCheck className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            item.is_completed && "line-through text-muted-foreground"
                          )}>
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
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

          {/* Quick Actions & Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <QuickActionCard
              icon={Plus}
              label="Quick Capture"
              description="Add a new thought"
              href="/capture"
            />
            <QuickActionCard
              icon={ArrowRightLeft}
              label="Process Inbox"
              description={`${stats.inboxCount} items waiting`}
              href="/capture"
            />
            <QuickActionCard
              icon={FolderOpen}
              label="View Spaces"
              description={`${stats.spacesCount} spaces`}
              href="/spaces"
            />
            <QuickActionCard
              icon={Sparkles}
              label="AI Assistant"
              description="Press Cmd+J"
              onClick={() => {
                // Trigger AI Assistant
                window.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'j',
                  metaKey: true
                }));
              }}
            />
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Overall Progress</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.totalCompleted}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
  href?: string;
  color: 'blue' | 'purple' | 'green' | 'emerald';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    green: 'bg-green-500/10 text-green-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
  };

  const content = (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
