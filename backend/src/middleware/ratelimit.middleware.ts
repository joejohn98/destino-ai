import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis";

const createStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: `rl:${prefix}:`,
  });

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
  store: createStore("agents"),
  passOnStoreError: true, // Graceful degradation: allow request if Redis is temporarily unreachable
  standardHeaders: true, // Return RateLimit-* headers so the client knows its remaining quota
  legacyHeaders: false,
  message: {
    status: "failed",
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
  store: createStore("ai"),
  passOnStoreError: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failed",
    message:
      "AI request rate limit reached. Please wait before making another request.",
  },
});

// Auth routes — prevent brute force login attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  store: createStore("auth"),
  passOnStoreError: true,
  message: {
    status: "failed",
    message: "Too many attempts. Try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
