import type { RequestHandler } from "express";

import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import authService from "../services/auth.service";

export const register: RequestHandler = catchAsync(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    throw new AppError("Please provide email, username, and password", 400);
  }

  const { user, token } = await authService.register(
    email,
    username,
    password,
    res,
  );

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      user,
      token,
    },
  });
});

export const login: RequestHandler = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const { user, token } = await authService.login(email, password, res);

  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: {
      user,
      token
    },
  });
});

export const logout: RequestHandler = catchAsync(async (_req, res) => {
  const { message } = await authService.logout(res);

  res.status(200).json({
    status: "success",
    message,
  });
});
