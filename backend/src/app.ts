import express, { type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import "./models";
import { redisClient } from "./config/redis";
import destinationRouter from "./routes/destination.routes";
import { authRoutes } from "./routes/auth.routes";
import { continentRoutes } from "./routes/continent.routes";
import { continentCountryRoutes, countryRoutes } from "./routes/country.routes";
import { destinationReviewRoutes, reviewRoutes } from "./routes/review.routes";
import { adminRoutes } from "./routes/admin.routes";
import {
  getDestinationBySlug,
  getDestinationsByCountrySlug,
} from "./controllers/destination.controller";
import { userRoutes } from "./routes/user.routes";
import aiRoutes from "./routes/ai.routes";
import agentRoutes from "./routes/agent.routes";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/error.middleware";
import { config } from "./config/config";
import passport from "./config/passport";

export function createApp(): express.Express {
  const app = express();
  app.set("trust proxy", config.trustProxy);

  app.use(
    cors({
      credentials: true,
      origin: config.clientUrl,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(passport.initialize());

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/destinations", destinationRouter);

  // Canonical country destinations: resolves all destinations belonging to a country.
  app.get(
    "/api/countries/:countrySlug/destinations",
    getDestinationsByCountrySlug,
  );

  // Canonical destination detail: resolves unambiguously via the compound unique index.
  app.get(
    "/api/countries/:countrySlug/destinations/:destinationSlug",
    getDestinationBySlug,
  );

  // Reviews are nested under the same country/destination hierarchy.
  app.use(
    "/api/countries/:countrySlug/destinations/:destinationSlug/reviews",
    destinationReviewRoutes,
  );
  app.use("/api/reviews", reviewRoutes);

  // Admin routes
  app.use("/api/admin/continents", continentRoutes);
  app.use("/api/admin/continents/:continentId/countries", continentCountryRoutes);
  app.use("/api/admin/countries", countryRoutes);
  app.use("/api/admin", adminRoutes);

  // AI routes
  app.use("/api/ai/agents", agentRoutes);
  app.use("/api/ai", aiRoutes);

  const healthHandler = (_req: Request, res: Response) => {
    const isMongoReady = mongoose.connection.readyState === 1;
    const isRedisReady = redisClient.isOpen;

    const status = isMongoReady
      ? isRedisReady
        ? "healthy"
        : "degraded"
      : "unhealthy";

    res.status(isMongoReady ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: isMongoReady ? "connected" : "disconnected",
        redis: isRedisReady ? "connected" : "disconnected",
      },
    });
  };

  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      message: "Welcome to the API",
    });
  });

  // Catch unhandled routes
  app.use(notFoundHandler);

  // Global error handling middleware
  app.use(globalErrorHandler);

  return app;
}

export default createApp;
