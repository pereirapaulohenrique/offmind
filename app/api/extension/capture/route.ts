import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@supabase/supabase-js';
import { extensionCaptureSchema } from '@/lib/validations/schemas';
import { validateBody } from '@/lib/validations/validate';

// Use service role for API key auth (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    // Validate API key and get user
    // API keys are stored in profile settings as: extension_api_key
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .filter('settings->extension_api_key', 'eq', apiKey)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Get and validate request body
    const body = await request.json();
    const validation = validateBody(extensionCaptureSchema, body);
    if (!validation.success) return validation.response;
    const { title, notes, source, project_id, space_id, page_id } = validation.data;

    // Accept source from extension or desktop clients
    const itemSource = source === 'desktop' ? 'desktop' : 'extension';

    // Create item
    const { data, error } = await supabaseAdmin.from('items').insert({
      user_id: profile.id,
      title,
      notes: notes || null,
      layer: 'capture',
      source: itemSource,
      ...(project_id ? { project_id } : {}),
      ...(space_id ? { space_id } : {}),
      ...(page_id ? { page_id } : {}),
    } as any).select().single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error: any) {
    Sentry.captureException(error);
    console.error('Extension capture error:', error);
    return NextResponse.json(
      { error: error.message || 'Capture failed' },
      { status: 500 }
    );
  }
}
