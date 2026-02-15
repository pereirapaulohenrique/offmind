import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resend } from '@/lib/email/resend';
import { getWaitlistWelcomeEmail } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

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
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
