import mongoose from "mongoose";
import z from "zod";
import { Review } from "../models/Review.model";

type PopulatedReviewUser = {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
} | null;

const getReviewerName = (
  user: PopulatedReviewUser,
  fallbackAuthorName: string,
) => {
  const username = user?.username?.trim();
  if (username) return username;

  const fullName = [user?.firstName, user?.lastName]
    .filter((name): name is string => Boolean(name?.trim()))
    .join(" ")
    .trim();
  if (fullName) return fullName;

  return fullName || fallbackAuthorName;
};

const getDestinationReviewsInput = z.object({
  destinationIds: z
    .array(z.string().min(1))
    .min(1)
    .max(3)
    .describe(
      "Array of destination IDs (MongoDB ObjectId strings) to fetch reviews for, up to 3",
    ),
  maxReviewsPerDestination: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe(
      "Maximum number of reviews to fetch per destination, defaults to 5",
    ),
});

export const reviewTools = {
  getDestinationReviews: {
    description:
      "Fetch real traveller reviews for up to three destination IDs returned by searchDestinations. Use this to understand actual visitor experiences, common praises, and complaints. Never invent review content or tips.",
    inputSchema: getDestinationReviewsInput,
    execute: async ({
      destinationIds,
      maxReviewsPerDestination,
    }: z.infer<typeof getDestinationReviewsInput>) => {
      const invalidId = destinationIds.find(
        (destinationId) => !mongoose.isValidObjectId(destinationId),
      );
      if (invalidId) {
        return {
          reviews: [],
          error: `Invalid destination ID: ${invalidId}`,
        };
      }

      const reviews = await Review.find({
        destination: { $in: destinationIds },
      })
        .select("destination user rating reviewText authorName createdAt")
        .populate<{ user: PopulatedReviewUser }>(
          "user",
          "username firstName lastName email",
        )
        .sort({ createdAt: -1 })
        .lean();

      const reviewsByDestination = destinationIds.map((destinationId) => ({
        destinationId,
        reviews: reviews
          .filter((review) => String(review.destination) === destinationId)
          .slice(0, maxReviewsPerDestination)
          .map((review) => ({
            rating: review.rating,
            reviewText: review.reviewText,
            authorName: getReviewerName(review.user, review.authorName),
            createdAt: review.createdAt,
          })),
      }));

      return { reviews: reviewsByDestination };
    },
  },
};
