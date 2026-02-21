import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { checkRateLimit, CAPTURE_RATE_LIMIT } from '@/lib/rate-limit';
import { validateBody } from '@/lib/validations/validate';
import { captureSchema } from '@/lib/validations/schemas';

/**
 * POST /api/capture
 *
 * Public API endpoint to capture items into user's inbox.
 *
 * Authentication:
 * - Bearer token with Supabase access token, OR
 * - Bearer token with API key (stored in profile settings as api_key)
 *
 * Body:
 * - title: string (required, max 500 chars)
 * - notes?: string (optional, max 5000 chars)
 * - source?: string (optional, e.g., "browser-extension", "siri-shortcut")
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header. Use: Authorization: Bearer <token>' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    let userId: string;
    let authMethod: 'supabase' | 'api_key' | 'quick_capture';

    // Try static quick-capture key first (for iOS Shortcuts, Siri, etc.)
    const quickCaptureKey = process.env.QUICK_CAPTURE_KEY;
    const quickCaptureUserId = process.env.QUICK_CAPTURE_USER_ID;

    if (quickCaptureKey && quickCaptureUserId && token === quickCaptureKey) {
      userId = quickCaptureUserId;
      authMethod = 'quick_capture';
    } else {
      // Try Supabase access token
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (user && !authError) {
        userId = user.id;
        authMethod = 'supabase';
      } else {
        // Try API key authentication
        const serviceClient = await createServiceClient();
        const { data: profile, error: profileError } = await serviceClient
          .from('profiles')
          .select('id, settings')
          .eq('id', token)
          .single();

        if (profile) {
          userId = profile.id;
          authMethod = 'api_key';
        } else {
          // Try finding by api_key in settings
          const { data: profiles, error: searchError } = await serviceClient
            .from('profiles')
            .select('id, settings')
            .filter('settings->>api_key', 'eq', token)
            .limit(1);

          if (!profiles || profiles.length === 0) {
            return NextResponse.json(
              { error: 'Invalid authentication token' },
              { status: 401 }
            );
          }

          userId = profiles[0].id;
          authMethod = 'api_key';
        }
      }
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId, CAPTURE_RATE_LIMIT, 'capture');

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', CAPTURE_RATE_LIMIT.max.toString());
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    // CORS headers for browser extension support
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: CAPTURE_RATE_LIMIT.max,
          window: '60s',
          resetAt: new Date(rateLimit.resetTime).toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers });
    }
    const validation = validateBody(captureSchema, body, headers);
    if (!validation.success) return validation.response;
    const { title, notes, source, project_id, space_id, page_id } = validation.data;

    // Create the item using service client (bypasses RLS)
    const serviceClient = await createServiceClient();
    const { data: item, error: insertError } = await serviceClient
      .from('items')
      .insert({
        user_id: userId,
        title: title.trim(),
        notes: notes ? notes.trim() : null,
        layer: 'capture',
        source: source || 'api',
        ...(project_id ? { project_id } : {}),
        ...(space_id ? { space_id } : {}),
        ...(page_id ? { page_id } : {}),
      })
      .select()
      .single();

    if (insertError) {
      Sentry.captureException(insertError);
      console.error('Error creating item:', insertError);
      return NextResponse.json(
        { error: 'Failed to create item', details: insertError.message },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        item,
        meta: {
          authMethod,
          rateLimit: {
            limit: CAPTURE_RATE_LIMIT.max,
            remaining: rateLimit.remaining,
            resetAt: new Date(rateLimit.resetTime).toISOString(),
          },
        },
      },
      { status: 201, headers }
    );
  } catch (error: any) {
    Sentry.captureException(error);
    console.error('Capture API error:', error);

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500, headers }
    );
  }
}

/**
 * GET /api/capture
 *
 * Retrieve recent capture items (last 10).
 *
 * Authentication: Same as POST (Bearer token)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header. Use: Authorization: Bearer <token>' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    let userId: string;

    // Try Supabase access token first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (user && !authError) {
      // Authenticated via Supabase access token
      userId = user.id;
    } else {
      // Try API key authentication
      const serviceClient = await createServiceClient();
      const { data: profiles, error: searchError } = await serviceClient
        .from('profiles')
        .select('id, settings')
        .filter('settings->>api_key', 'eq', token)
        .limit(1);

      if (!profiles || profiles.length === 0) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      userId = profiles[0].id;
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId, CAPTURE_RATE_LIMIT, 'capture');

    // Add headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', CAPTURE_RATE_LIMIT.max.toString());
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: CAPTURE_RATE_LIMIT.max,
          window: '60s',
          resetAt: new Date(rateLimit.resetTime).toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Fetch recent capture items
    const serviceClient = await createServiceClient();
    const { data: items, error: fetchError } = await serviceClient
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .eq('layer', 'capture')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      Sentry.captureException(fetchError);
      console.error('Error fetching items:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch items', details: fetchError.message },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        items: items || [],
        count: items?.length || 0,
        meta: {
          rateLimit: {
            limit: CAPTURE_RATE_LIMIT.max,
            remaining: rateLimit.remaining,
            resetAt: new Date(rateLimit.resetTime).toISOString(),
          },
        },
      },
      { status: 200, headers }
    );
  } catch (error: any) {
    Sentry.captureException(error);
    console.error('Capture GET API error:', error);

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/capture
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return new NextResponse(null, { status: 204, headers });
}
