import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import "./models";
import destinationRouter from "./routes/destination.routes";
import { authRoutes } from "./routes/auth.routes";
import { continentRoutes } from "./routes/continent.routes";
import {
  continentCountryRoutes,
  countryRoutes,
} from "./routes/country.routes";
import { reviewRoutes } from "./routes/review.routes";

const app = express();

app.use(cors({ credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRouter);
app.use("/api/destinations/:slug/reviews", reviewRoutes);

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
