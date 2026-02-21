import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCalendarEvents } from '@/lib/integrations/google-calendar';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const timeMin = url.searchParams.get('timeMin');
    const timeMax = url.searchParams.get('timeMax');

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: 'timeMin and timeMax query params required' },
        { status: 400 }
      );
    }

    // Get stored tokens
    const { data: tokenData } = await supabase
      .from('google_oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Google Calendar not connected', connected: false },
        { status: 404 }
      );
    }

    const { events, newAccessToken, newExpiry } = await getCalendarEvents(
      tokenData.access_token,
      tokenData.refresh_token,
      timeMin,
      timeMax
    );

    // Update tokens if refreshed
    if (newAccessToken) {
      await supabase
        .from('google_oauth_tokens')
        .update({
          access_token: newAccessToken,
          ...(newExpiry ? { expires_at: newExpiry } : {}),
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ events, connected: true });
  } catch (error: any) {
    // If token is invalid/revoked, return a specific error
    if (error?.code === 401 || error?.response?.status === 401) {
      return NextResponse.json(
        { error: 'Google Calendar authorization expired', connected: false },
        { status: 401 }
      );
    }

    Sentry.captureException(error);
    console.error('Google events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
