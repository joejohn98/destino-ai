import mongoose from "mongoose";
import z from "zod";
import { Review } from "../models/Review.model";

type PopulatedReviewUser = {
  username?: string;
  firstName?: string;
  lastName?: string;
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

  return fallbackAuthorName;
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
    .default(10)
    .describe(
      "Maximum number of reviews to fetch per destination, defaults to 10",
    ),
});

export const reviewTools = {
  getDestinationReviews: {
    description:
      "Fetch real traveller reviews for all selected destination IDs in one call, up to three destinations. Call this after destination research, request up to 10 reviews per destination, and use the results to compare actual visitor experiences, common praises, and complaints. Never invent review content or tips.",
    inputSchema: getDestinationReviewsInput,
    execute: async ({
      destinationIds,
      maxReviewsPerDestination,
    }: z.infer<typeof getDestinationReviewsInput>) => {
      try {
        const invalidId = destinationIds.find(
          (destinationId) => !mongoose.isValidObjectId(destinationId),
        );
        if (invalidId) {
          return {
            reviews: [],
            error: `Invalid destination ID: ${invalidId}`,
          };
        }

        const reviewsByDestination = await Promise.all(
          destinationIds.map(async (destinationId) => {
            const reviews = await Review.find({
              destination: destinationId,
            })
              .select("destination user rating reviewText authorName createdAt")
              .populate<{ user: PopulatedReviewUser }>(
                "user",
                "username firstName lastName",
              )
              .sort({ createdAt: -1 })
              .limit(maxReviewsPerDestination)
              .lean();

            return {
              destinationId,
              reviews: reviews.map((review) => ({
                rating: review.rating,
                reviewText: review.reviewText,
                authorName: getReviewerName(review.user, review.authorName),
                createdAt: review.createdAt,
              })),
            };
          }),
        );

        return { reviews: reviewsByDestination };
      } catch (error) {
        console.error("[getDestinationReviews] Error executing tool:", error);
        return {
          reviews: [],
          error: "Failed to fetch destination reviews due to a database error.",
        };
      }
    },
  },
};
