'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: string;
  description?: string;
  features: string[];
  plan: 'monthly' | 'annual' | 'lifetime';
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSelect: (plan: 'monthly' | 'annual' | 'lifetime') => Promise<void>;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  plan,
  isPopular,
  isCurrentPlan,
  onSelect,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async () => {
    if (isCurrentPlan) return;
    setIsLoading(true);
    try {
      await onSelect(plan);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-xl border bg-card p-6 shadow-sm',
        isPopular && 'border-primary ring-2 ring-primary/20',
        isCurrentPlan && 'border-green-500/50 bg-green-500/5'
      )}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Most Popular
        </span>
      )}

      {isCurrentPlan && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
          Current Plan
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <ul className="mb-6 space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={isPopular ? 'default' : 'outline'}
        disabled={isLoading || isCurrentPlan}
        onClick={handleSelect}
      >
        {isLoading ? 'Loading...' : isCurrentPlan ? 'Current Plan' : 'Get Started'}
      </Button>
    </motion.div>
  );
}
