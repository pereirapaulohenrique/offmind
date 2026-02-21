import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { resend } from '@/lib/email/resend';
import { getWaitlistWelcomeEmail } from '@/lib/email/templates';
import { waitlistSchema } from '@/lib/validations/schemas';
import { validateBody } from '@/lib/validations/validate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(waitlistSchema, body);
    if (!validation.success) return validation.response;
    const { email } = validation.data;

    const supabase = await createClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { message: 'You are already on the waitlist!' },
        { status: 200 }
      );
    }

    // Insert into waitlist
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.toLowerCase() });

    if (error) {
      // Handle unique constraint violation gracefully
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'You are already on the waitlist!' },
          { status: 200 }
        );
      }

      console.error('Waitlist insert error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    // Send welcome email (non-blocking — don't fail signup if email fails)
    try {
      await resend.emails.send({
        from: 'OffMind <hello@getoffmind.com>',
        to: email.toLowerCase(),
        subject: "You're in — welcome to OffMind",
        html: getWaitlistWelcomeEmail(email.toLowerCase()),
      });
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    return NextResponse.json(
      { success: true, message: 'Successfully joined the waitlist!' },
      { status: 201 }
    );
  } catch (error: any) {
    Sentry.captureException(error);
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
