import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import "./models";
import destinationRouter from "./routes/destination.routes";

const app = express();

app.use(cors({ credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/destinations", destinationRouter);

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
