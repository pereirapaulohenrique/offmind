// Generalized in-memory rate limiter (extracted from capture route)
// In production, consider replacing with Redis for multi-instance deployments

const stores = new Map<string, Map<string, { count: number; resetTime: number }>>();

function getStore(namespace: string): Map<string, { count: number; resetTime: number }> {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  return stores.get(namespace)!;
}

function cleanupExpired(store: Map<string, { count: number; resetTime: number }>) {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export const AI_RATE_LIMIT: RateLimitConfig = {
  max: 30,
  windowMs: 60 * 1000, // 30 requests per minute
};

export const CAPTURE_RATE_LIMIT: RateLimitConfig = {
  max: 60,
  windowMs: 60 * 1000, // 60 requests per minute
};

export function checkRateLimit(
  userId: string,
  config: RateLimitConfig,
  namespace: string
): RateLimitResult {
  const store = getStore(namespace);
  cleanupExpired(store);

  const now = Date.now();
  const entry = store.get(userId);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    store.set(userId, { count: 1, resetTime });
    return { allowed: true, remaining: config.max - 1, resetTime };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  store.set(userId, entry);
  return { allowed: true, remaining: config.max - entry.count, resetTime: entry.resetTime };
}
