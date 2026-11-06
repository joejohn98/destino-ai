import { createClient } from "redis";
import { config } from "./config";

export const redisClient = createClient({
  url: config.redisUrl,
  socket: {
    connectTimeout: 5_000, // Fail fast on startup so fallback mode kicks in quickly.
    reconnectStrategy: (retries: number) => {
      // If Redis is unreachable on startup or dev, stop after 3 attempts
      if (retries > 3) {
        return false;
      }
      return Math.min(retries * 500, 2000);
    },
  },
});

redisClient.on("connect", () => console.log("Redis client connected"));
redisClient.on("ready", () => console.log("Redis client ready"));
redisClient.on("end", () => console.log("Redis client disconnected"));
redisClient.on("error", (error) => {
  if (redisClient.isOpen) {
    console.error("Redis client error:", error);
  }
});

export const connectRedis = async (): Promise<boolean> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const pong = await redisClient.ping();
    console.log("Redis ping response:", pong);
    return true;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(
      "Redis unavailable on startup. Caching and rate limiting will operate in fallback mode.",
      reason,
    );
    return false;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) return;

  try {
    await redisClient.quit();
    console.log("Redis client disconnected");
  } catch (error) {
    console.error("Error disconnecting Redis client:", error);
  }
};
