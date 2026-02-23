import { Redis } from "@upstash/redis";

// Singleton Redis client – re-used across warm lambda invocations
let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set",
    );
  }

  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return _redis;
}

// ─── Typed cache helpers ───────────────────────────────────────────────────

/**
 * Read a JSON value from the cache. Returns null on cache-miss or Redis errors.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const raw = await redis.get<T>(key);
    return raw ?? null;
  } catch {
    // Never let a Redis failure break the request
    return null;
  }
}

/**
 * Write a JSON value to the cache with an optional TTL (seconds).
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300,
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Non-fatal
  }
}

/**
 * Delete one or more cache keys.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    const redis = getRedis();
    await redis.del(...keys);
  } catch {
    // Non-fatal
  }
}
