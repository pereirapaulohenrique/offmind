import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { generateConnectionCode } from '@/lib/telegram/bot';

// Generate a connection code for the current user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a new connection code
    const code = generateConnectionCode();

    // Store it in user's settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    const newSettings = {
      ...(profile?.settings || {}),
      telegram_connection_code: code,
      telegram_connection_code_created_at: new Date().toISOString(),
    };

    await supabase
      .from('profiles')
      .update({ settings: newSettings } as any)
      .eq('id', user.id);

    return NextResponse.json({ code });
  } catch (error: any) {
    Sentry.captureException(error);
    console.error('Telegram connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate code' },
      { status: 500 }
    );
  }
}

// Check connection status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if connected
    const { data: connection } = await supabase
      .from('telegram_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (connection) {
      return NextResponse.json({
        connected: true,
        username: connection.telegram_username,
        firstName: connection.telegram_first_name,
      });
    }

    return NextResponse.json({ connected: false });
  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: error.message || 'Failed to check connection' },
      { status: 500 }
    );
  }
}

// Disconnect Telegram
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Deactivate connection
    await supabase
      .from('telegram_connections')
      .update({ is_active: false } as any)
      .eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
