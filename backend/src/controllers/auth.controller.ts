import type { RequestHandler, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import authService from "../services/auth.service";

export const register: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, username, password } = req.body;

    const { user } = await authService.register(
      firstName,
      lastName,
      email,
      username,
      password,
      res,
    );

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: user,
    });
  },
);

export const login: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user } = await authService.login(email, password, res);

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: user,
    });
  },
);

export const logout: RequestHandler = catchAsync(async (_req, res) => {
  const { message } = await authService.logout(res);

  res.status(200).json({
    status: "success",
    message,
  });
});
