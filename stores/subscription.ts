'use client';

import { create } from 'zustand';
import type { SubscriptionStatus } from '@/types';

interface SubscriptionState {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  setSubscription: (subscription: SubscriptionStatus | null) => void;
  setLoading: (loading: boolean) => void;

  // Computed helpers
  isActive: () => boolean;
  isTrial: () => boolean;
  isExpired: () => boolean;
  canUseFeature: (feature: string) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  isLoading: true,

  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),

  isActive: () => {
    const { subscription } = get();
    if (!subscription) return false;
    return subscription.active;
  },

  isTrial: () => {
    const { subscription } = get();
    if (!subscription) return false;
    return subscription.type === 'trial';
  },

  isExpired: () => {
    const { subscription } = get();
    if (!subscription) return false;
    return subscription.type === 'expired_trial' || !subscription.active;
  },

  canUseFeature: (feature: string) => {
    const { subscription } = get();
    if (!subscription) return false;

    // All features available during trial or active subscription
    if (subscription.active) return true;

    // Limited features for expired users
    const freeFeatures = ['view_items', 'view_pages'];
    return freeFeatures.includes(feature);
  },
}));
