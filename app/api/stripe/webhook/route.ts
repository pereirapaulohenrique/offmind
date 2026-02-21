import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { trackServerEvent } from '@/lib/analytics/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    Sentry.captureException(error);
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    Sentry.captureException(error);
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  const plan = session.metadata?.plan;

  if (!userId) {
    console.error('No user ID in session metadata');
    return;
  }

  if (session.mode === 'payment') {
    // Lifetime purchase
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        plan: 'lifetime',
        stripe_customer_id: session.customer as string,
        current_period_start: new Date().toISOString(),
        current_period_end: null, // No end for lifetime
      } as any)
      .eq('user_id', userId);
  } else if (session.mode === 'subscription' && session.subscription) {
    // Recurring subscription
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as any;

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        plan: plan || 'monthly',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      } as any)
      .eq('user_id', userId);
  }

  // Track subscription started
  trackServerEvent(userId, 'subscription_started', {
    plan: plan || (session.mode === 'payment' ? 'lifetime' : 'monthly'),
    mode: session.mode,
  });
}

async function handleSubscriptionUpdate(subscription: any) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) {
    console.error('No subscription found for customer:', customerId);
    return;
  }

  // Map Stripe status to our status
  let status = subscription.status;
  if (status === 'trialing') status = 'trialing';
  else if (status === 'active') status = 'active';
  else if (status === 'past_due') status = 'past_due';
  else if (status === 'canceled' || status === 'unpaid') status = 'canceled';

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    } as any)
    .eq('user_id', sub.user_id);
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) return;

  // Revert to expired trial
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      stripe_subscription_id: null,
      cancel_at_period_end: false,
    } as any)
    .eq('user_id', sub.user_id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) return;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'past_due',
    } as any)
    .eq('user_id', sub.user_id);
}
