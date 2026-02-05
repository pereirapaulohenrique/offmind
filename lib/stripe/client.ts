import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});

// Price IDs from environment
export const PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
  annual: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || '',
  lifetime: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID || '',
};

// Plan details for display
export const PLANS = {
  trial: {
    name: 'Trial',
    description: '14-day free trial',
    features: ['Unlimited captures', 'AI suggestions', 'All views'],
  },
  monthly: {
    name: 'Monthly',
    price: '$9/month',
    priceId: PRICES.monthly,
    features: ['Everything in trial', 'Unlimited items', 'Priority support'],
  },
  annual: {
    name: 'Annual',
    price: '$79/year',
    priceId: PRICES.annual,
    features: ['Everything in monthly', 'Save 27%', '2 months free'],
  },
  lifetime: {
    name: 'Lifetime',
    price: '$199 once',
    priceId: PRICES.lifetime,
    features: ['Everything forever', 'All future updates', 'Founding member'],
  },
};
