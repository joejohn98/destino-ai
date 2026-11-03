import { redisClient } from "../config/redis";

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
  try {
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch {
    // Non-fatal — stale data will expire on its own TTL
  }
};
