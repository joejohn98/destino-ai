import { Router } from "express";
import {
  createReview,
  deleteReview,
  getDestinationReviews,
  updateReview,
} from "../controllers/review.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

export const destinationReviewRoutes = Router({ mergeParams: true });

destinationReviewRoutes.get("/", getDestinationReviews);
destinationReviewRoutes.post("/", protect, restrictTo("user"), createReview);

export const reviewRoutes = Router({ mergeParams: true });
reviewRoutes.patch("/:reviewId", protect, restrictTo("user"), updateReview);
reviewRoutes.delete("/:reviewId", protect, deleteReview);
