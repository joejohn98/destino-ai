import mongoose, { Document } from "mongoose";
import { Destination, SENTIMENTS, type Sentiment } from "./Destination.model";

// Review.model.ts
export interface IReview extends Document {
  destination: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId | null;
  authorName: string;
  rating: number;
  reviewText: string;
  sentiment?: Sentiment;
  themes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      default: "Anonymous",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    sentiment: {
      type: String,
      enum: {
        values: SENTIMENTS,
        message: `Sentiment must be one of: ${SENTIMENTS.join(", ")}`,
      },
      default: undefined,
    },
    themes: { type: [String], default: [] },
  },
  { timestamps: true },
);

reviewSchema.index(
  { destination: 1, user: 1 },
  {
    name: "destination_user_active_unique",
    unique: true,
    partialFilterExpression: { user: { $type: "objectId" } },
  },
);
reviewSchema.index({ destination: 1, createdAt: -1, _id: -1 });

async function refreshDestinationRatings(
  destinationId: mongoose.Types.ObjectId,
) {
  const [stats] = await Review.aggregate<{
    averageRating: number;
    ratingsCount: number;
  }>([
    { $match: { destination: destinationId } },
    {
      $group: {
        _id: "$destination",
        averageRating: { $avg: "$rating" },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  await Destination.findByIdAndUpdate(destinationId, {
    $set: {
      averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
      ratingsCount: stats?.ratingsCount ?? 0,
    },
    $inc: { reviewContentVersion: 1 },
    $unset: {
      aiReviewSummary: 1,
      summaryGeneratedAtRatingCount: 1,
    },
  });
}

reviewSchema.post("save", async function (review) {
  await refreshDestinationRatings(review.destination);
});

reviewSchema.post("findOneAndDelete", async function (review) {
  if (review) {
    await refreshDestinationRatings(review.destination);
  }
});

export const Review = mongoose.model<IReview>("Review", reviewSchema);
