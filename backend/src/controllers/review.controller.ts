import { catchAsync, catchAsyncBody } from "../utils/catchAsync";
import reviewService from "../services/review.service";
import { AppError } from "../utils/AppError";
import type { ReviewListResponseDTO } from "../dto/review.dto";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "../validators/review.validators";
import { isValidObjectId } from "../utils/validation";
import { reviewPaginationSchema } from "../validators/review.validators";

export const getDestinationReviews = catchAsync(async (req, res) => {
  const { countrySlug, destinationSlug } = req.params as { countrySlug?: string; destinationSlug?: string };

  if (!countrySlug || !destinationSlug) {
    throw new AppError("Country and Destination slugs are required", 400);
  }

  const pagination = reviewPaginationSchema.safeParse(req.query);
  if (!pagination.success) {
    throw new AppError(
      pagination.error.issues[0]?.message || "Invalid pagination parameters",
      400,
    );
  }

  const result = await reviewService.getDestinationReviews(
    countrySlug,
    destinationSlug,
    pagination.data,
  );
  const response: ReviewListResponseDTO = {
    status: "success",
    results: result.data.length,
    totalReviews: result.totalReviews,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: result.data,
  };
  res.status(200).json(response);
});

export const createReview = catchAsyncBody<CreateReviewInput>(async (req, res) => {
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

export const updateReview = catchAsyncBody<UpdateReviewInput>(async (req, res) => {
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
