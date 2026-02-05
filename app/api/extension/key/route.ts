import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

// Generate a new extension API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a random API key
    const apiKey = `mb_${randomBytes(24).toString('hex')}`;

    // Store it in user's settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    const newSettings = {
      ...(profile?.settings || {}),
      extension_api_key: apiKey,
    };

    await supabase
      .from('profiles')
      .update({ settings: newSettings } as any)
      .eq('id', user.id);

    return NextResponse.json({ apiKey });
  } catch (error: any) {
    console.error('Extension key error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate key' },
      { status: 500 }
    );
  }
}

// Get current API key
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    const apiKey = profile?.settings?.extension_api_key;

    return NextResponse.json({ hasKey: !!apiKey, apiKey: apiKey || null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get key' },
      { status: 500 }
    );
  }
}

// Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    const newSettings = { ...(profile?.settings || {}) };
    delete newSettings.extension_api_key;

    await supabase
      .from('profiles')
      .update({ settings: newSettings } as any)
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete key' },
      { status: 500 }
    );
  }
}
