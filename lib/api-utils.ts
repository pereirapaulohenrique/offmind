import { NextResponse } from 'next/server';
import { checkRateLimit, type RateLimitConfig, type RateLimitResult } from './rate-limit';

type RateLimitSuccess = {
  allowed: true;
  headers: Headers;
  result: RateLimitResult;
};

type RateLimitDenied = {
  allowed: false;
  response: NextResponse;
};

type RateLimitCheck = RateLimitSuccess | RateLimitDenied;

export function withRateLimit(
  userId: string,
  config: RateLimitConfig,
  namespace: string,
  existingHeaders?: Headers
): RateLimitCheck {
  const result = checkRateLimit(userId, config, namespace);

  const headers = existingHeaders ?? new Headers();
  headers.set('X-RateLimit-Limit', config.max.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: config.max,
          window: `${config.windowMs / 1000}s`,
          resetAt: new Date(result.resetTime).toISOString(),
        },
        { status: 429, headers }
      ),
    };
  }

  return { allowed: true, headers, result };
}
