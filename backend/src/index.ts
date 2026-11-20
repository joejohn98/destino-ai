import { Server } from "http";

// An uncaught exception leaves the process in an unknown state; log it and exit.
process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught exception. Exiting process.", error);
  process.exit(1);
});

import connectDB, { disconnectDB } from "./config/db";
import { connectRedis, disconnectRedis } from "./config/redis";
import { config } from "./config/config";
import { createApp } from "./app";

const PORT = config.port || 3000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

let server: Server | null = null;
let isShuttingDown = false;

const closeHttpServer = async () => {
  if (!server) return;

  const runningServer = server;
  server = null;

  await new Promise<void>((resolve, reject) => {
    runningServer.close((error) => {
      if (error) return reject(error);
      console.log("HTTP server closed.");
      resolve();
    });
  });
};

const disconnectResources = async () => {
  const results = await Promise.allSettled([disconnectDB(), disconnectRedis()]);
  const failures = results
    .filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    )
    .map((result) => result.reason);

  for (const error of failures) {
    console.error("Resource disconnection failed:", error);
  }

  return failures.length === 0;
};

const gracefulShutdown = async (reason: string, exitCode = 0) => {
  if (isShuttingDown) {
    console.warn(`Shutdown already in progress; ignoring: ${reason}`);
    return;
  }

  isShuttingDown = true;
  console.log(`${reason} received. Starting graceful shutdown...`);

  const forceExitTimeout = setTimeout(() => {
    console.error(
      "Graceful shutdown timed out. Closing remaining HTTP connections.",
    );
    server?.closeAllConnections();
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimeout.unref();

  try {
    await closeHttpServer();
  } catch (error) {
    console.error("Failed to close the HTTP server:", error);
    exitCode = 1;
  }

  const resourcesClosed = await disconnectResources();
  if (!resourcesClosed) exitCode = 1;

  clearTimeout(forceExitTimeout);
  console.log(`Shutdown finished with exit code ${exitCode}.`);
  process.exit(exitCode);
};

process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled promise rejection:", reason);
  void gracefulShutdown("unhandledRejection", 1);
});

const startServer = async () => {
  try {
    await connectDB();
    const redisConnected = await connectRedis();
    if (!redisConnected) {
      console.warn(
        "Starting server with Redis fallback mode (no Redis cache; in-memory rate limiting).",
      );
    }

    // Create the Express application with all routes and middleware
    // after database and Redis connection attempts have finished.
    const app = createApp();

    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Ensure keep-alive timeout is higher than upstream ALB idle timeout (default 60s)
    // to prevent spurious 502 Bad Gateway errors on AWS ECS.
    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000;
  } catch (error) {
    console.error("Error starting the server:", error);
    await disconnectResources();
    process.exit(1);
  }
};

void startServer();
