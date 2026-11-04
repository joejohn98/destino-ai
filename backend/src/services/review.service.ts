import { Country, Destination, Review, User } from "../models";
import aiService from "./ai.service";
import { AppError } from "../utils/AppError";
import { CACHE_KEYS, invalidateKeys, invalidatePattern } from "../utils/cache";
import type { PaginatedReviewsDTO, PublicReviewAuthorDTO } from "../dto/review.dto";
import {
  DEFAULT_REVIEW_PAGE_SIZE,
  MAX_REVIEW_PAGE_SIZE,
  CreateReviewInput,
  ReviewPaginationInput,
  UpdateReviewInput,
} from "../validators/review.validators";

const getDestinationReviews = async (
  countrySlug: string,
  destinationSlug: string,
  pagination: ReviewPaginationInput,
): Promise<PaginatedReviewsDTO> => {
  const page =
    Number.isSafeInteger(pagination.page) && pagination.page > 0
      ? pagination.page
      : 1;
  const limit =
    Number.isSafeInteger(pagination.limit) && pagination.limit > 0
      ? Math.min(pagination.limit, MAX_REVIEW_PAGE_SIZE)
      : DEFAULT_REVIEW_PAGE_SIZE;
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) {
    throw new AppError("Requested review page is too large", 400);
  }

  const country = await Country.findOne({ slug: countrySlug });
  if (!country) throw new AppError("Country not found", 404);

  const destination = await Destination.findOne({
    slug: destinationSlug,
    "location.country": country._id,
  });

  if (!destination)
    throw new AppError("Destination not found in this country", 404);

  const filter = { destination: destination._id };
  type PopulatedAuthor = {
    _id: { toString(): string };
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };

  const [totalReviews, reviews] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .select(
        "destination user authorName rating reviewText sentiment themes createdAt updatedAt",
      )
      .populate<{ user: PopulatedAuthor | null }>(
        "user",
        "firstName lastName avatarUrl",
      )
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    data: reviews.map((review) => {
      const author: PublicReviewAuthorDTO | null = review.user
        ? {
            _id: review.user._id.toString(),
            firstName: review.user.firstName,
            lastName: review.user.lastName,
            ...(review.user.avatarUrl
              ? { avatarUrl: review.user.avatarUrl }
              : {}),
          }
        : null;

      return {
        _id: review._id.toString(),
        destination: review.destination.toString(),
        user: author,
        authorName: review.authorName,
        rating: review.rating,
        reviewText: review.reviewText,
        ...(review.sentiment ? { sentiment: review.sentiment } : {}),
        themes: review.themes ?? [],
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      };
    }),
    totalReviews,
    totalPages: Math.ceil(totalReviews / limit),
    currentPage: page,
  };
};

const createReview = async (
  countrySlug: string,
  destinationSlug: string,
  userId: string,
  authorName: string,
  reviewData: CreateReviewInput,
) => {
  const country = await Country.findOne({ slug: countrySlug });
  if (!country) throw new AppError("Country not found", 404);

  const destination = await Destination.findOne({
    slug: destinationSlug,
    "location.country": country._id,
  });

  if (!destination)
    throw new AppError("Destination not found in this country", 404);

  const existingReview = await Review.findOne({
    destination: destination._id,
    user: userId,
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this destination", 400);
  }

  const { rating, reviewText } = reviewData;

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  let themes: string[] = [];

  const sanitizedText = reviewText.replace(/[\x00-\x1F\x7F]/g, " ").trim();
  try {
    const aiResult = await aiService.analyzeSentiment(sanitizedText);
    sentiment = aiResult.sentiment;
    themes = aiResult.themes;
  } catch (error) {
    console.warn(
      "[createReview] Sentiment analysis skipped due to AI error:",
      error,
    );
  }

  const review = await Review.create({
    rating,
    reviewText: sanitizedText,
    destination: destination._id,
    user: userId,
    authorName,
    sentiment,
    themes,
  });

  await User.findByIdAndUpdate(userId, { $inc: { reviewCount: 1 } });

  await invalidateKeys(CACHE_KEYS.destBySlug(countrySlug, destinationSlug));
  await invalidatePattern("api:dest:paginated:*");

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
  if (!review.user || review.user.toString() !== userId)
    throw new AppError("You do not have permission to update this review", 403);

  if (updateData.rating !== undefined) review.rating = updateData.rating;
  if (updateData.reviewText !== undefined) {
    const sanitizedText = updateData.reviewText
      .replace(/[\x00-\x1F\x7F]/g, " ")
      .trim();
    review.reviewText = sanitizedText;
    try {
      const aiResult = await aiService.analyzeSentiment(sanitizedText);
      review.sentiment = aiResult.sentiment;
      review.themes = aiResult.themes;
    } catch (error) {
      console.warn(
        "[updateReview] Sentiment analysis skipped due to AI error:",
        error,
      );
    }
  }

  // post("save") hook on Review.model.ts will automatically recalculate destination averageRating
  await review.save();

  const dest = await Destination.findById(review.destination)
    .populate<{ location: { country: { slug: string } } }>("location.country", "slug")
    .lean();
  if (dest?.slug && dest.location?.country?.slug) {
    await invalidateKeys(
      CACHE_KEYS.destBySlug(dest.location.country.slug, dest.slug),
    );
  }
  await invalidatePattern("api:dest:paginated:*");

  return review;
};

const deleteReview = async (reviewId: string, userId: string, role: string) => {
  const review = await Review.findById(reviewId);

  if (!review) throw new AppError("No review found with that ID", 404);

  // Only the owner or admin can delete a review
  if ((!review.user || review.user.toString() !== userId) && role !== "admin")
    throw new AppError("You do not have permission to delete this review", 403);

  // Use findByIdAndDelete so the findOneAnd* hooks in Review.model.ts are triggered and the average rating is updated
  const deletedReview = await Review.findByIdAndDelete(reviewId);

  if (deletedReview?.user) {
    await User.findByIdAndUpdate(deletedReview.user, {
      $inc: { reviewCount: -1 },
    });
  }

  if (deletedReview?.destination) {
    const dest = await Destination.findById(deletedReview.destination)
      .populate<{ location: { country: { slug: string } } }>("location.country", "slug")
      .lean();
    if (dest?.slug && dest.location?.country?.slug) {
      await invalidateKeys(
        CACHE_KEYS.destBySlug(dest.location.country.slug, dest.slug),
      );
    }
    await invalidatePattern("api:dest:paginated:*");
  }

  return deletedReview;
};

export default {
  getDestinationReviews,
  createReview,
  deleteReview,
  updateReview,
};
