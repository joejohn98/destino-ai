import jwt from "jsonwebtoken";
import { Response } from "express";
import ms, { type StringValue } from "ms";

import { config } from "../config/config";
import { IUser } from "../models/User.model";

const generateToken = (userId: string, res: Response): string => {
  const payload = { id: userId };

  const JWT_SECRET = config.jwtSecret;
  const expiresIn = (config.jwtExpiration) as StringValue;
  const maxAgeMs = typeof expiresIn === "string" ? ms(expiresIn) : expiresIn * 1000;

  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: maxAgeMs,
  });

  return token;
};

export const createSendToken = (user: IUser, res: Response): string => {
  return generateToken(user._id.toString(), res);
};
