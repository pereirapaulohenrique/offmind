'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { PricingCard } from './PricingCard';
import { PLANS } from '@/lib/stripe/client';
import { toast } from 'sonner';

export function PricingSection() {
  const { subscription, createCheckout } = useSubscription();

  const handleSelectPlan = async (plan: 'starter' | 'builder' | 'believer') => {
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
        <h2 className="text-2xl font-bold">Founding Member Access</h2>
        <p className="mt-2 text-[var(--text-muted)]">
          One-time payment. No subscriptions. Support development from day one.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <PricingCard
          name={PLANS.starter.name}
          price={PLANS.starter.price}
          features={PLANS.starter.features}
          plan="starter"
          isCurrentPlan={currentPlan === 'starter'}
          onSelect={handleSelectPlan}
        />

        <PricingCard
          name={PLANS.builder.name}
          price={PLANS.builder.price}
          features={PLANS.builder.features}
          plan="builder"
          isPopular
          isCurrentPlan={currentPlan === 'builder'}
          onSelect={handleSelectPlan}
        />

        <PricingCard
          name={PLANS.believer.name}
          price={PLANS.believer.price}
          features={PLANS.believer.features}
          plan="believer"
          isCurrentPlan={currentPlan === 'believer'}
          onSelect={handleSelectPlan}
        />
      </div>
    </div>
  );
}
