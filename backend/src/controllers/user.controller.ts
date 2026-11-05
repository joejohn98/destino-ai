import type { RequestHandler } from "express";

import userService from "../services/user.service";
import { AppError } from "../utils/AppError";
import { catchAsync, catchAsyncBody } from "../utils/catchAsync";
import type { UpdateProfileInput } from "../validators/user.validators";
import { paginationQuerySchema } from "../validators/query.validators";
import type {
  FavoritesResponseDTO,
  MyReviewsResponseDTO,
} from "../dto/user.dto";

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

export const updateProfile = catchAsyncBody<UpdateProfileInput>(
  async (req, res) => {
    const user = await userService.updateProfile(
      getAuthenticatedUserId(req.user?._id.toString()),
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: user,
    });
  },
);

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
  const query = paginationQuerySchema.safeParse(req.query);
  if (!query.success) {
    throw new AppError(query.error.issues[0]?.message || "Invalid pagination parameters", 400);
  }

  const result = await userService.getMyReviews(
    getAuthenticatedUserId(req.user?._id.toString()),
    query.data,
  );

  const response: MyReviewsResponseDTO = {
    status: "success",
    results: result.data.length,
    totalReviews: result.totalReviews,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: result.data,
  };
  res.status(200).json(response);
});

export const getFavorites: RequestHandler = catchAsync(async (req, res) => {
  const query = paginationQuerySchema.safeParse(req.query);
  if (!query.success) {
    throw new AppError(query.error.issues[0]?.message || "Invalid pagination parameters", 400);
  }

  const result = await userService.getFavorites(
    getAuthenticatedUserId(req.user?._id.toString()),
    query.data,
  );

  const response: FavoritesResponseDTO = {
    status: "success",
    results: result.data.length,
    totalFavorites: result.totalFavorites,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: result.data,
  };
  res.status(200).json(response);
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
