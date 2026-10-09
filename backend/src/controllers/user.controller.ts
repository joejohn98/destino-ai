import type { RequestHandler } from "express";

import userService from "../services/user.service";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

const getAuthenticatedUserId = (userId: string | undefined) => {
  if (!userId) {
    throw new AppError("Unauthorized, user not found", 401);
  }

  return userId;
};

export const getProfile: RequestHandler = catchAsync(async (req, res) => {
  const user = await userService.getProfile(
    getAuthenticatedUserId(req.user?._id.toString()),
  );

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateProfile: RequestHandler = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(
    getAuthenticatedUserId(req.user?._id.toString()),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: { user },
  });
});

export const deleteProfile: RequestHandler = catchAsync(async (req, res) => {
  await userService.deleteProfile(
    getAuthenticatedUserId(req.user?._id.toString()),
  );

  res.status(200).json({
    status: "success",
    message: "Account deleted successfully",
  });
});
