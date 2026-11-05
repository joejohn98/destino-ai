import { redisClient } from "../config/redis";

// ─── Cache keys & TTL constants ───────────────────────────────────────────────
export const CACHE_KEYS = {
  continentStats: "agg:continent:stats",
  continentCountries: (slug: string) => `agg:continent:${slug}:countries`,
  paginatedPage: (page: number, limit: number) =>
    `api:dest:paginated:p${page}:l${limit}`,
  destBySlug: (countrySlug: string, destSlug: string) =>
    `api:dest:slug:${countrySlug}:${destSlug}`,
  destByCountryPattern: (countrySlug: string) =>
    `api:dest:slug:${countrySlug}:*`,
  countryDestinations: (countrySlug: string) =>
    `api:dest:country:${countrySlug}`,
} as const;

export const AGG_CACHE_TTL = 30 * 60; // 30 minutes
export const LISTING_CACHE_TTL = 3 * 60; // 3 minutes
export const DETAIL_CACHE_TTL = 10 * 60; // 10 minutes

/**
 * Read-through cache wrapper.
 * - On a cache hit: returns the parsed value immediately.
 * - On a cache miss: runs `fn`, stores the result, then returns it.
 * - If Redis is unavailable: falls through to `fn` so the app keeps working.
 */

export const withCache = async <T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> => {
  if (!redisClient.isOpen) {
    return fn();
  }

  let result: T | undefined;

  try {
    const cached = await redisClient.get(key);

    if (cached) return JSON.parse(cached) as T;

    result = await fn();

    await redisClient.setEx(key, ttlSeconds, JSON.stringify(result));

    return result;
  } catch {
    return result ?? fn();
  }
};

/**
 * Delete one or more exact cache keys.
 * Failures are silently swallowed so a Redis hiccup never breaks a write path.
 */
export const invalidateKeys = async (...keys: string[]): Promise<void> => {
  if (!redisClient.isOpen || keys.length === 0) return;

  try {
    await redisClient.del(keys);
  } catch {
    // Non-fatal — stale data will expire on its own TTL
  }
};

/**
 * Delete all keys matching a pattern (e.g. "api:dest:paginated:*").
 */
export const invalidatePattern = async (pattern: string): Promise<void> => {
  if (!redisClient.isOpen) return;

  try {
    const keys: string[] = [];
    for await (const batch of redisClient.scanIterator({ MATCH: pattern })) {
      keys.push(...batch);
    }
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch {
    // Non-fatal — stale data will expire on its own TTL
  }
};
