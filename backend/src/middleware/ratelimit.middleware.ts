import rateLimit from "express-rate-limit";

/**
 * Rate limiter for AI agent endpoints (/api/ai/agents/*).
 *
 * Agent requests are expensive — each one can trigger up to 10 LLM steps
 * and multiple DB queries. 5 requests per minute per IP is a generous limit
 * that prevents accidental hammering while not blocking normal usage..
 */
export const agentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true, // Return RateLimit-* headers so the client knows its remaining quota
  legacyHeaders: false,
  message: {
    status: "failed",
    message:
      "Agent rate limit reached. Please wait before making another agent request.",
  },
});

// Auth routes — prevent brute force login attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: "failed",
    message: "Too many attempts. Try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
