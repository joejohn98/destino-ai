import { Country, Destination, Review } from "../models";
import { AppError } from "../utils/AppError";
import {
  CreateReviewInput,
  UpdateReviewInput,
} from "../validators/review.validators";

const getDestinationReviews = async (countrySlug: string, destinationSlug: string) => {
  const country = await Country.findOne({ slug: countrySlug });
  if (!country) throw new AppError("Country not found", 404);

  const destination = await Destination.findOne({ slug: destinationSlug, "location.country": country._id });

  if (!destination) {
    throw new AppError("Destination not found in this country", 404);
  }

  const reviews = await Review.find({ destination: destination._id }).populate({
    path: "user",
    select: "username _id",
  });

  return reviews;
};

const createReview = async (
  countrySlug: string,
  destinationSlug: string,
  userId: string,
  reviewData: CreateReviewInput,
) => {
  const country = await Country.findOne({ slug: countrySlug });
  if (!country) throw new AppError("Country not found", 404);

  const destination = await Destination.findOne({ slug: destinationSlug, "location.country": country._id });

  if (!destination) throw new AppError("Destination not found in this country", 404);

  const existingReview = await Review.findOne({
    destination: destination._id,
    user: userId,
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this destination", 400);
  }

  const { rating, comment } = reviewData;

  const review = await Review.create({
    rating,
    reviewText: comment,
    destination: destination._id,
    user: userId,
  });

  return review;
};

const updateReview = async (
  reviewId: string,
  userId: string,
  updateData: UpdateReviewInput,
) => {
  const review = await Review.findById(reviewId);

  if (!review) throw new AppError("No review found with that ID", 404);

  // Only the owner can update their own review
  if (review.user.toString() !== userId)
    throw new AppError("You do not have permission to update this review", 403);

  if (updateData.rating !== undefined) review.rating = updateData.rating;
  if (updateData.reviewText !== undefined)
    review.reviewText = updateData.reviewText;

  // post("save") hook on Review.model.ts will automatically recalculate destination averageRating
  await review.save();

  return review;
};

const deleteReview = async (reviewId: string, userId: string, role: string) => {
  const review = await Review.findById(reviewId);

  if (!review) throw new AppError("No review found with that ID", 404);

  // Only the owner or admin can delete a review
  if (review.user.toString() !== userId && role !== "admin")
    throw new AppError("You do not have permission to delete this review", 403);

  // Use findByIdAndDelete so the findOneAnd* hooks in Review.model.ts are triggered and the average rating is updated
  const deletedReview = await Review.findByIdAndDelete(reviewId);

  return deletedReview;
};

export default {
  getDestinationReviews,
  createReview,
  deleteReview,
  updateReview,
};
