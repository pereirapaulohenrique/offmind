'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Inbox, ArrowRightLeft, CalendarCheck, Search, FolderOpen, Briefcase, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ICON_MAP } from '@/components/icons';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'capture' | 'process' | 'commit' | 'default';

interface EmptyStateProps {
  icon?: LucideIcon;
  iconName?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: EmptyStateVariant;
}

const variantStyles: Record<EmptyStateVariant, { text: string; bg: string }> = {
  capture: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  process: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  commit: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  default: { text: 'text-[var(--text-muted)]', bg: 'bg-[var(--bg-hover)]' },
};

export function EmptyState({
  icon,
  iconName,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const Icon = icon || (iconName ? ICON_MAP[iconName] : null) || FolderOpen;
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl mb-5', styles.bg)}>
        <Icon className={cn('h-6 w-6', styles.text)} strokeWidth={1.5} />
      </div>

      <h3 className="text-base font-semibold mb-1.5">{title}</h3>

      <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
        {description}
      </p>

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button asChild size="sm" variant="outline" className="h-8 text-xs">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick} size="sm" variant="outline" className="h-8 text-xs">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Pre-configured empty states
export function EmptyInbox() {
  return (
    <EmptyState
      icon={Inbox}
      title="Inbox zero!"
      description="Your mind is clear. Capture something new when inspiration strikes."
      variant="capture"
    />
  );
}

export function EmptyProcess() {
  return (
    <EmptyState
      icon={ArrowRightLeft}
      title="Nothing to organize"
      description="All items have been processed. Nice work keeping things tidy."
      variant="process"
    />
  );
}

export function EmptyCommit() {
  return (
    <EmptyState
      icon={CalendarCheck}
      title="No commitments today"
      description="Your schedule is clear. A perfect day to focus on what matters."
      variant="commit"
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search terms or filters."
      variant="default"
    />
  );
}

export function EmptySpace() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No items in this space"
      description="Create your first item to get started."
      variant="default"
    />
  );
}

export function EmptyProject() {
  return (
    <EmptyState
      icon={Briefcase}
      title="No items in this project"
      description="Add tasks or notes to organize your work."
      variant="default"
    />
  );
}
