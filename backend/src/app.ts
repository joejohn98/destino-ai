import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors({ credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

// Global Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

export default app;
