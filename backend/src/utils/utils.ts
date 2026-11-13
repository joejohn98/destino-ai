import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import ms, { type StringValue } from "ms";

import { config } from "../config/config";
import { IUser } from "../models/User.model";

export const getAuthCookieOptions = (): CookieOptions => {
  const isProduction = config.nodeEnv === "production";

  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
};

const generateToken = (userId: string, res: Response): string => {
  const jwtSecret = config.jwtSecret;
  if (!jwtSecret) throw new Error("JWT_SECRET is not configured");
  const expiresIn = config.jwtExpiration as StringValue;
  const maxAgeMs =
    typeof expiresIn === "string" ? ms(expiresIn) : expiresIn * 1000;

  const token = jwt.sign({ id: userId }, jwtSecret, {
    expiresIn,
  });

  res.cookie("token", token, {
    ...getAuthCookieOptions(),
    maxAge: maxAgeMs,
  });

  return token;
};

export const createSendToken = (user: IUser, res: Response): string => {
  return generateToken(user._id.toString(), res);
};

export const sanitizeUser = (user: IUser): Record<string, unknown> => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};
