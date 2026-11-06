import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { User } from "../models";
import { config } from "../config/config";
import type { IUser } from "../models/User.model";
import { AppError } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const getTokenFromRequest = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1] ?? undefined;
  }
  return req.cookies?.token;
};

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next(new AppError("Unauthorized, no token provided", 401));
  }

  try {
    const JWT_SECRET = config.jwtSecret;
    if (!JWT_SECRET) {
      return next(new AppError("Authentication is not configured", 500));
    }

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

/** Extract and guarantee the authenticated user from a protected request. */
export const getAuthenticatedUser = (req: Request): IUser => {
  if (!req.user) {
    throw new AppError("Unauthorized, user not found", 401);
  }
  return req.user;
};
