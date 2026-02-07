'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SubscriptionStatus() {
  const { subscription, isLoading, isActive, isTrial, isExpired, openPortal } = useSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-md bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
        <div className="h-6 w-32 rounded bg-[var(--bg-hover)]" />
        <div className="mt-2 h-4 w-48 rounded bg-[var(--bg-hover)]" />
      </div>
    );
  }

  const handleManageSubscription = async () => {
    try {
      await openPortal();
    } catch (error) {
      toast.error('Failed to open subscription portal');
    }
  };

  const getStatusDisplay = () => {
    if (!subscription) return { label: 'Unknown', color: 'text-[var(--text-muted)]', bg: 'bg-[var(--bg-hover)]' };

    if (subscription.type === 'lifetime') {
      return { label: 'Lifetime', color: 'text-[var(--accent-base)]', bg: 'bg-[var(--accent-subtle)]' };
    }
    if (subscription.type === 'annual') {
      return { label: 'Annual', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    }
    if (subscription.type === 'monthly') {
      return { label: 'Monthly', color: 'text-green-500', bg: 'bg-green-500/10' };
    }
    if (subscription.type === 'trial') {
      return { label: 'Trial', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    }
    return { label: 'Expired', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const status = getStatusDisplay();

  return (
    <div className="rounded-md bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Subscription</h3>
            <span className={cn('rounded-full px-3 py-1 text-xs font-medium', status.bg, status.color)}>
              {status.label}
            </span>
          </div>

          {isTrial && subscription?.daysRemaining !== undefined && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {subscription.daysRemaining} days remaining in your trial
            </p>
          )}

          {isExpired && (
            <p className="mt-1 text-sm text-red-500">
              Your trial has expired. Upgrade to continue using all features.
            </p>
          )}

          {isActive && !isTrial && subscription?.type !== 'lifetime' && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Your subscription is active
            </p>
          )}

          {subscription?.type === 'lifetime' && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              You have lifetime access. Thank you for your support!
            </p>
          )}
        </div>

        {isActive && !isTrial && subscription?.type !== 'lifetime' && (
          <Button variant="outline" onClick={handleManageSubscription}>
            Manage
          </Button>
        )}
      </div>
    </div>
  );
}
