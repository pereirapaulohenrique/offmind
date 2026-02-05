'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSubscriptionStore } from '@/stores/subscription';
import type { SubscriptionStatus } from '@/types';

const getSupabase = () => createClient();

export function useSubscription() {
  const { subscription, isLoading, setSubscription, setLoading, isActive, isTrial, isExpired, canUseFeature } =
    useSubscriptionStore();

  // Fetch subscription status
  const fetchSubscription = useCallback(async () => {
    const supabase = getSupabase();

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        return;
      }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!sub) {
        setSubscription({ active: false, type: 'expired_trial' });
        return;
      }

      // Calculate subscription status
      const now = new Date();
      let active = false;
      let type: SubscriptionStatus['type'] = 'expired_trial';
      let daysRemaining: number | undefined;

      if (sub.status === 'active' || sub.plan === 'lifetime') {
        active = true;
        type = sub.plan as SubscriptionStatus['type'];
      } else if (sub.status === 'trialing' && sub.trial_ends_at) {
        const trialEnd = new Date(sub.trial_ends_at);
        if (trialEnd > now) {
          active = true;
          type = 'trial';
          daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          active = false;
          type = 'expired_trial';
        }
      } else if (sub.status === 'past_due') {
        active = false;
        type = 'past_due' as any;
      }

      setSubscription({ active, type, daysRemaining });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription({ active: false, type: 'expired_trial' });
    } finally {
      setLoading(false);
    }
  }, [setSubscription, setLoading]);

  // Create checkout session
  const createCheckout = useCallback(async (plan: 'monthly' | 'annual' | 'lifetime') => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }, []);

  // Open customer portal
  const openPortal = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open portal');
      }

      // Redirect to Stripe Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      throw error;
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    isLoading,
    isActive: isActive(),
    isTrial: isTrial(),
    isExpired: isExpired(),
    canUseFeature,
    createCheckout,
    openPortal,
    refresh: fetchSubscription,
  };
}
