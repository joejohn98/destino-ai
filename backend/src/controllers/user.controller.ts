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
    data: user,
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
    data: user,
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

export const getMyReviews: RequestHandler = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit || "12"), 10) || 12, 1),
    50,
  );

  const result = await userService.getMyReviews(
    getAuthenticatedUserId(req.user?._id.toString()),
    page,
    limit,
  );

  res.status(200).json({
    status: "success",
    results: result.data.length,
    totalReviews: result.totalReviews,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: result.data,
  });
});

export const getFavorites: RequestHandler = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit || "12"), 10) || 12, 1),
    50,
  );

  const result = await userService.getFavorites(
    getAuthenticatedUserId(req.user?._id.toString()),
    page,
    limit,
  );

  res.status(200).json({
    status: "success",
    results: result.data.length,
    totalFavorites: result.totalFavorites,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: result.data,
  });
});

export const addFavorite: RequestHandler = catchAsync(async (req, res) => {
  const favoriteDestinations = await userService.addFavorite(
    getAuthenticatedUserId(req.user?._id.toString()),
    String(req.params.destinationId),
  );

  res.status(200).json({
    status: "success",
    message: "Destination added to favorites",
    data: { favoriteDestinations },
  });
});

export const removeFavorite: RequestHandler = catchAsync(async (req, res) => {
  const favoriteDestinations = await userService.removeFavorite(
    getAuthenticatedUserId(req.user?._id.toString()),
    String(req.params.destinationId),
  );

  res.status(200).json({
    status: "success",
    message: "Destination removed from favorites",
    data: { favoriteDestinations },
  });
});
