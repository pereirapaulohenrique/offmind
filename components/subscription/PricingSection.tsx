'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { PricingCard } from './PricingCard';
import { PLANS } from '@/lib/stripe/client';
import { toast } from 'sonner';

export function PricingSection() {
  const { subscription, createCheckout } = useSubscription();

  const handleSelectPlan = async (plan: 'monthly' | 'annual' | 'lifetime') => {
    try {
      await createCheckout(plan);
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  const currentPlan = subscription?.type;

  return (
    <div className="py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="mt-2 text-[var(--text-muted)]">
          Upgrade to unlock all features and support development
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <PricingCard
          name={PLANS.monthly.name}
          price={PLANS.monthly.price}
          features={PLANS.monthly.features}
          plan="monthly"
          isCurrentPlan={currentPlan === 'monthly'}
          onSelect={handleSelectPlan}
        />

        <PricingCard
          name={PLANS.annual.name}
          price={PLANS.annual.price}
          features={PLANS.annual.features}
          plan="annual"
          isPopular
          isCurrentPlan={currentPlan === 'annual'}
          onSelect={handleSelectPlan}
        />

        <PricingCard
          name={PLANS.lifetime.name}
          price={PLANS.lifetime.price}
          features={PLANS.lifetime.features}
          plan="lifetime"
          isCurrentPlan={currentPlan === 'lifetime'}
          onSelect={handleSelectPlan}
        />
      </div>
    </div>
  );
}
