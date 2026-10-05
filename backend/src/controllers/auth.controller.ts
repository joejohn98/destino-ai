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
    res
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


