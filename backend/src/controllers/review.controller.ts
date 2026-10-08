import { catchAsync } from "../utils/catchAsync";
import z from "zod";
import reviewService from "../services/review.service";
import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/review.validators";

export const getDestinationReviews = catchAsync(async (req, res) => {
  const { countrySlug, destinationSlug } = req.params as { countrySlug?: string; destinationSlug?: string };

  if (!countrySlug || !destinationSlug) {
    throw new AppError("Country and Destination slugs are required", 400);
  }

  const reviews = await reviewService.getDestinationReviews(countrySlug, destinationSlug);
  res.status(200).json({
    status: "success",
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

export const createReview = catchAsync(async (req, res) => {
  const { countrySlug, destinationSlug } = req.params as { countrySlug?: string; destinationSlug?: string };

  if (!countrySlug || !destinationSlug) throw new AppError("Country and Destination slugs are required", 400);

  const parsed = createReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      status: "fail",
      message: parsed.error.issues[0]?.message || "Validation failed",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }

  const userId = req.user!._id.toString();
  const review = await reviewService.createReview(countrySlug, destinationSlug, userId, parsed.data);

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: {
      review,
    },
  });
});


export const updateReview = catchAsync(async (req, res) => {
  const reviewId = req.params.reviewId as string;

  if (!isValidObjectId(reviewId)) throw new AppError("Invalid review ID", 400);

  const parsed = updateReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      status: "fail",
      message: parsed.error.issues[0]?.message || "Validation failed",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
    return;
  }

  const userId = req.user!._id.toString();
  const _review = await reviewService.updateReview(reviewId, userId, parsed.data);

  res.status(200).json({
    status: "success",
    message: "Review updated successfully",
  });
});

export const deleteReview = catchAsync(async (req, res) => {
  const reviewId = req.params.reviewId as string;

  if (!isValidObjectId(reviewId)) throw new AppError("Invalid review ID", 400);

  const userId = req.user!._id.toString();
  const role = req.user!.role;
  const _review = await reviewService.deleteReview(reviewId, userId, role);

  res.status(201).json({
    status: "success",
    message: "Review deleted successfully",
  });
});




