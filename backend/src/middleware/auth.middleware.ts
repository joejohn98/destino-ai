import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { User } from "../models";
import { config } from "../config/config";
import { IUser } from "../models/User.model";
import { AppError } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  // Get token from header or cookie
  const authHeader = req.headers.authorization;

  const JWT_SECRET = config.jwtSecret;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const extracted = authHeader.split(" ")[1];
    if (extracted) {
      token = extracted;
    }
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("Unauthorized, no token provided", 401));
  }

  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Runtime-validate the decoded payload
    if (typeof decoded === "string" || !decoded.id) {
      return next(new AppError("Invalid token payload", 401));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("Unauthorized, user not found", 401));
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token has expired, please login again", 401));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }

    console.error("Error in auth middleware:", error);
    return next(new AppError("Internal server error", 500));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError(
          "Unauthorized: You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "Forbidden: You do not have permission to perform this action",
          403,
        ),
      );
    }
    next();
  };
};
