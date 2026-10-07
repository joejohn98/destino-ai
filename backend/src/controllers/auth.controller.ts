import type { RequestHandler, Request, Response } from "express";
import z from "zod";

import { catchAsync } from "../utils/catchAsync";
import authService from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.validators";

export const register: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: "fail",
        message: parsed.error.issues[0]?.message || "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      });
      return;
    }

    const { firstName, lastName, email, username, password } = parsed.data;

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
      data: {
        user,
      },
    });
  },
);

export const login: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: "fail",
        message: parsed.error.issues[0]?.message || "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      });
      return;
    }

    const { email, password } = parsed.data;

    const { user } = await authService.login(email, password, res);

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        user,
      },
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
