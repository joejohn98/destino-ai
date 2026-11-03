import type { RequestHandler, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import authService from "../services/auth.service";
import { createSendToken } from "../utils/utils";

export const register: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, username, password } = req.body;

    const user = await authService.register(
      firstName,
      lastName,
      email,
      username,
      password,
    );

    createSendToken(user, res);

    const { password: _, __v, ...userData } = user.toObject();

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: userData,
    });
  },
);

export const login: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    createSendToken(user, res);

    const { password: _, __v, ...userData } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: userData,
    });
  },
);

export const logout: RequestHandler = catchAsync(async (_req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});
