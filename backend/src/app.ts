import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "./models";
import destinationRouter from "./routes/destination.routes";
import { authRoutes } from "./routes/auth.routes";
import { continentRoutes } from "./routes/continent.routes";
import { continentCountryRoutes, countryRoutes } from "./routes/country.routes";
import { destinationReviewRoutes, reviewRoutes } from "./routes/review.routes";
import { getDestinationBySlug } from "./controllers/destination.controller";
import { userRoutes } from "./routes/user.routes";

const app = express();

app.use(cors({ credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/destinations", destinationRouter);

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

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

// Global Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  res.status(statusCode).json({
    status,
    message: err.message || "Internal Server Error",
  });
});

export default app;
