import { Router } from "express";
import {
  createReview,
  deleteReview,
  getDestinationReviews,
  updateReview,
} from "../controllers/review.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/review.validators";

export const destinationReviewRoutes = Router({ mergeParams: true });

destinationReviewRoutes.get("/", getDestinationReviews);
destinationReviewRoutes.post(
  "/",
  protect,
  restrictTo("user"),
  validate(createReviewSchema),
  createReview,
);

export const reviewRoutes = Router({ mergeParams: true });
reviewRoutes.patch(
  "/:reviewId",
  protect,
  restrictTo("user"),
  validate(updateReviewSchema),
  updateReview,
);
reviewRoutes.delete("/:reviewId", protect, deleteReview);
