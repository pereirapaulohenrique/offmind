import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, message, url } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const feedbackEmail = process.env.FEEDBACK_EMAIL || 'feedback@offmind.ai';

    const categoryLabels: Record<string, string> = {
      bug: 'Bug Report',
      feature: 'Feature Request',
      general: 'General Feedback',
    };

    const categoryLabel = categoryLabels[category] || 'General Feedback';

    await resend.emails.send({
      from: 'OffMind Feedback <noreply@offmind.ai>',
      to: feedbackEmail,
      subject: `[${categoryLabel}] Feedback from ${user.email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #1a1614;">${categoryLabel}</h2>
          <p><strong>From:</strong> ${user.email} (${user.id})</p>
          ${url ? `<p><strong>Page:</strong> ${url}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" />
          <div style="white-space: pre-wrap; color: #333;">${message}</div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to send feedback' },
      { status: 500 }
    );
  }
}
