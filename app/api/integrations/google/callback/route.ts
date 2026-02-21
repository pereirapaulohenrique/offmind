import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTokensFromCode } from '@/lib/integrations/google-calendar';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // user_id
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL('/settings?google_error=access_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings?google_error=missing_params', request.url)
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== state) {
      return NextResponse.redirect(
        new URL('/settings?google_error=unauthorized', request.url)
      );
    }

    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        new URL('/settings?google_error=no_tokens', request.url)
      );
    }

    // Store tokens
    const { error: dbError } = await supabase
      .from('google_oauth_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type || 'Bearer',
        expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : new Date(Date.now() + 3600 * 1000).toISOString(),
        scope: tokens.scope || '',
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>, {
        onConflict: 'user_id',
      });

    if (dbError) {
      console.error('Failed to store Google tokens:', dbError);
      return NextResponse.redirect(
        new URL('/settings?google_error=storage_failed', request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/settings?google_success=true', request.url)
    );
  } catch (error) {
    Sentry.captureException(error);
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      new URL('/settings?google_error=unknown', request.url)
    );
  }
}
