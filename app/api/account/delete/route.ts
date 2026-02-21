import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/client';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (body.confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm' },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS for full cascade delete
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Cancel any active Stripe subscription
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (stripeErr) {
        console.error('Failed to cancel Stripe subscription:', stripeErr);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // 2. Delete storage files
    try {
      const { data: files } = await adminClient.storage
        .from('attachments')
        .list(user.id);

      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await adminClient.storage.from('attachments').remove(paths);
      }
    } catch (storageErr) {
      console.error('Failed to delete storage files:', storageErr);
    }

    // 3. Delete all user data from tables (order matters for FK constraints)
    const tables = [
      'activity_log',
      'pages',
      'items',
      'projects',
      'spaces',
      'destinations',
      'contacts',
      'subscriptions',
      'profiles',
    ];

    for (const table of tables) {
      const column = table === 'profiles' ? 'id' : 'user_id';
      const { error } = await adminClient
        .from(table)
        .delete()
        .eq(column, user.id);

      if (error) {
        console.error(`Failed to delete from ${table}:`, error.message);
      }
    }

    // 4. Delete the auth user
    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error('Failed to delete auth user:', authError.message);
      return NextResponse.json(
        { error: 'Account data deleted but auth removal failed. Contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 });
  }
}
