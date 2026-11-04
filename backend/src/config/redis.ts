import { createClient } from "redis";
import { config } from "./config";

const redisUrl = config.redisUrl;

export const redisClient = createClient({ url: redisUrl });

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

redisClient.on("ready", () => {
  console.log("Redis client ready");
});

redisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

redisClient.on("end", () => {
  console.log("Redis client disconnected");
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
    console.warn(
      "WARNING: Unable to connect to Redis on startup. Caching and rate limiting will operate in fallback mode.",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    try {
      await redisClient.quit();
      console.log("Redis client disconnected");
    } catch (error) {
      console.error("Error disconnecting Redis client:", error);
    }
  }
};
