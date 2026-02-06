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

const variantStyles: Record<EmptyStateVariant, string> = {
  capture: 'text-blue-500',
  process: 'text-amber-500',
  commit: 'text-green-500',
  default: 'text-muted-foreground',
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
  const iconColorClass = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className={cn('mb-4 opacity-60', iconColorClass)}>
        <Icon size={48} strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>

      {action && (
        <>
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </>
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
      description="Your mind is clear"
      variant="capture"
    />
  );
}

export function EmptyProcess() {
  return (
    <EmptyState
      icon={ArrowRightLeft}
      title="Nothing to organize"
      description="All items have been processed"
      variant="process"
    />
  );
}

export function EmptyCommit() {
  return (
    <EmptyState
      icon={CalendarCheck}
      title="No commitments today"
      description="Your schedule is clear"
      variant="commit"
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search terms"
      variant="default"
    />
  );
}

export function EmptySpace() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No items in this space"
      description="Create your first item to get started"
      variant="default"
    />
  );
}

export function EmptyProject() {
  return (
    <EmptyState
      icon={Briefcase}
      title="No items in this project"
      description="Add tasks or notes to organize your work"
      variant="default"
    />
  );
}
