import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis";

const createStore = (prefix: string) => {
  if (!redisClient.isReady) {
    console.warn(
      `Redis is unavailable; using the in-memory rate-limit store for ${prefix}.`,
    );
    return undefined;
  }

  return new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: `rl:${prefix}:`,
  });
};

const storeOption = (prefix: string) => {
  const store = createStore(prefix);
  return store ? { store } : {};
};

/**
 * Rate limiter for AI agent endpoints (/api/ai/agents/*).
 *
 * Agent requests are expensive — each one can trigger up to 10 LLM steps
 * and multiple DB queries. 5 requests per minute per IP is a generous limit
 * that prevents accidental hammering while not blocking normal usage.
 */
export const agentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  ...storeOption("agents"),
  passOnStoreError: true, // Graceful degradation: allow request if Redis is temporarily unreachable
  standardHeaders: true, // Return RateLimit-* headers so the client knows its remaining quota
  legacyHeaders: false,
  message: {
    status: "fail",
    message:
      "Agent rate limit reached. Please wait before making another agent request.",
  },
});

/**
 * Rate limiter for general AI endpoints (/api/ai/* tips and summaries).
 * 20 requests per minute per IP protects Gemini quota from exhaustion.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  ...storeOption("ai"),
  passOnStoreError: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message:
      "AI request rate limit reached. Please wait before making another request.",
  },
});

// Auth routes — prevent brute force login attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  ...storeOption("auth"),
  passOnStoreError: true,
  message: {
    status: "fail",
    message: "Too many attempts. Try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
