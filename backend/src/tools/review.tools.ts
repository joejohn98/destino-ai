import mongoose from "mongoose";
import z from "zod";
import { Review } from "../models/Review.model";

const getDestinationReviewsInput = z.object({
  destinationIds: z.array(z.string().min(1)).min(1).max(3),
  maxReviewsPerDestination: z.number().int().min(1).max(10).default(5),
});

export const reviewTools = {
  getDestinationReviews: {
    description:
      "Fetch real traveller reviews for up to three destination IDs returned by searchDestinations. Never invent review content or tips.",
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
            authorName: review.authorName,
            createdAt: review.createdAt,
          })),
      }));

      return { reviews: reviewsByDestination };
    },
  },
};
