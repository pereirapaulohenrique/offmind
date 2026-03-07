import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility - use getStripe() in new code
export const stripe = {
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
} as unknown as Stripe;

// Founding Member Price IDs from environment
export const PRICES = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '',
  builder: process.env.NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID || '',
  believer: process.env.NEXT_PUBLIC_STRIPE_BELIEVER_PRICE_ID || '',
};

// All founding member plans are one-time payments (mode: 'payment')
export const PLANS = {
  starter: {
    name: 'Starter',
    price: '$49',
    priceId: PRICES.starter,
    mode: 'payment' as const,
    features: ['Everything included', '1 year of updates', 'Community access'],
    spots: 50,
  },
  builder: {
    name: 'Builder',
    price: '$79',
    priceId: PRICES.builder,
    mode: 'payment' as const,
    features: ['Everything included', 'Lifetime updates', 'Priority support', 'Direct access to Paulo'],
    spots: 100,
    recommended: true,
  },
  believer: {
    name: 'Believer',
    price: '$149',
    priceId: PRICES.believer,
    mode: 'payment' as const,
    features: ['Everything in Builder', 'Lifetime updates + all future products', 'Private Discord channel', 'Shape the roadmap'],
    spots: 50,
  },
};
