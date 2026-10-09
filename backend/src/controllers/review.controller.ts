import { catchAsync } from "../utils/catchAsync";
import reviewService from "../services/review.service";
import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";

export const getDestinationReviews = catchAsync(async (req, res) => {
  const { countrySlug, destinationSlug } = req.params as { countrySlug?: string; destinationSlug?: string };

  if (!countrySlug || !destinationSlug) {
    throw new AppError("Country and Destination slugs are required", 400);
  }

  const reviews = await reviewService.getDestinationReviews(countrySlug, destinationSlug);
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: reviews,
  });
});

export const createReview = catchAsync(async (req, res) => {
  const { countrySlug, destinationSlug } = req.params as { countrySlug?: string; destinationSlug?: string };

  if (!countrySlug || !destinationSlug) throw new AppError("Country and Destination slugs are required", 400);

  const userId = req.user!._id.toString();
  const review = await reviewService.createReview(
    countrySlug,
    destinationSlug,
    userId,
    req.user!.username,
    req.body,
  );

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: review,
  });
});


export const updateReview = catchAsync(async (req, res) => {
  const reviewId = req.params.reviewId as string;

  if (!isValidObjectId(reviewId)) throw new AppError("Invalid review ID", 400);

  const userId = req.user!._id.toString();
  const updatedReview = await reviewService.updateReview(reviewId, userId, req.body);

  res.status(200).json({
    status: "success",
    message: "Review updated successfully",
    data: updatedReview,
  });
});

export const deleteReview = catchAsync(async (req, res) => {
  const reviewId = req.params.reviewId as string;

  if (!isValidObjectId(reviewId)) throw new AppError("Invalid review ID", 400);

  const userId = req.user!._id.toString();
  const role = req.user!.role;
  await reviewService.deleteReview(reviewId, userId, role);

  res.status(200).json({
    status: "success",
    message: "Review deleted successfully",
  });
});




