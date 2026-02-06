import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';

// Rate limiting: In-memory store (simple implementation)
// In production, consider using Redis or a more robust solution
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 60; // 60 requests
const RATE_LIMIT_WINDOW = 60 * 1000; // per minute (60 seconds)

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupExpiredEntries();
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Create new window
    const resetTime = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(userId, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime };
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime };
  }

  // Increment count
  userLimit.count++;
  rateLimitStore.set(userId, userLimit);
  return { allowed: true, remaining: RATE_LIMIT_MAX - userLimit.count, resetTime: userLimit.resetTime };
}

// Clean up expired entries on each check (no interval needed in serverless)
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [userId, limit] of rateLimitStore.entries()) {
    if (now > limit.resetTime) {
      rateLimitStore.delete(userId);
    }
  }
}

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
    let authMethod: 'supabase' | 'api_key';

    // Try Supabase access token first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (user && !authError) {
      // Authenticated via Supabase access token
      userId = user.id;
      authMethod = 'supabase';
    } else {
      // Try API key authentication
      const serviceClient = await createServiceClient();
      const { data: profile, error: profileError } = await serviceClient
        .from('profiles')
        .select('id, settings')
        .eq('id', token) // First try token as direct user ID
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

    // Check rate limit
    const rateLimit = checkRateLimit(userId);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
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
          limit: RATE_LIMIT_MAX,
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
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers }
      );
    }

    const { title, notes, source } = body;

    // Validate title
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400, headers }
      );
    }

    if (title.length > 500) {
      return NextResponse.json(
        { error: 'Title must not exceed 500 characters' },
        { status: 400, headers }
      );
    }

    // Validate notes
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== 'string') {
        return NextResponse.json(
          { error: 'Notes must be a string' },
          { status: 400, headers }
        );
      }
      if (notes.length > 5000) {
        return NextResponse.json(
          { error: 'Notes must not exceed 5000 characters' },
          { status: 400, headers }
        );
      }
    }

    // Validate source
    if (source !== undefined && source !== null && typeof source !== 'string') {
      return NextResponse.json(
        { error: 'Source must be a string' },
        { status: 400, headers }
      );
    }

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
      })
      .select()
      .single();

    if (insertError) {
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
            limit: RATE_LIMIT_MAX,
            remaining: rateLimit.remaining,
            resetAt: new Date(rateLimit.resetTime).toISOString(),
          },
        },
      },
      { status: 201, headers }
    );
  } catch (error: any) {
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
    const rateLimit = checkRateLimit(userId);

    // Add headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
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
          limit: RATE_LIMIT_MAX,
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
            limit: RATE_LIMIT_MAX,
            remaining: rateLimit.remaining,
            resetAt: new Date(rateLimit.resetTime).toISOString(),
          },
        },
      },
      { status: 200, headers }
    );
  } catch (error: any) {
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
