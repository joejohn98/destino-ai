import type { RequestHandler } from "express";

import userService from "../services/user.service";
import { catchAsync, catchAsyncBody } from "../utils/catchAsync";
import type { UpdateProfileInput } from "../validators/user.validators";
import { paginationQuerySchema } from "../validators/query.validators";
import type {
  FavoritesResponseDTO,
  MyReviewsResponseDTO,
} from "../dto/user.dto";
import { parseQuery } from "../middleware/validation.middleware";
import { getAuthenticatedUser } from "../middleware/auth.middleware";

const parsePagination = parseQuery(paginationQuerySchema);

export const getProfile: RequestHandler = catchAsync(async (req, res) => {
  const userId = getAuthenticatedUser(req)._id.toString();
  const user = await userService.getProfile(userId);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

export const updateProfile = catchAsyncBody<UpdateProfileInput>(
  async (req, res) => {
    const userId = getAuthenticatedUser(req)._id.toString();
    const user = await userService.updateProfile(userId, req.body);

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: user,
    });
  },
);

export const deleteProfile: RequestHandler = catchAsync(async (req, res) => {
  const userId = getAuthenticatedUser(req)._id.toString();
  await userService.deleteProfile(userId);

  res.status(200).json({
    status: "success",
    message: "Account deleted successfully",
  });
});

export const getMyReviews: RequestHandler = catchAsync(async (req, res) => {
  const userId = getAuthenticatedUser(req)._id.toString();
  const query = parsePagination(req.query);

  const result = await userService.getMyReviews(userId, query);

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
  const userId = getAuthenticatedUser(req)._id.toString();
  const query = parsePagination(req.query);

  const result = await userService.getFavorites(userId, query);

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
  const userId = getAuthenticatedUser(req)._id.toString();
  const favoriteDestinations = await userService.addFavorite(
    userId,
    String(req.params.destinationId),
  );

  res.status(200).json({
    status: "success",
    message: "Destination added to favorites",
    data: { favoriteDestinations },
  });
});

export const removeFavorite: RequestHandler = catchAsync(async (req, res) => {
  const userId = getAuthenticatedUser(req)._id.toString();
  const favoriteDestinations = await userService.removeFavorite(
    userId,
    String(req.params.destinationId),
  );

  res.status(200).json({
    status: "success",
    message: "Destination removed from favorites",
    data: { favoriteDestinations },
  });
});
