import { z } from "zod";

export const REVIEW_MAX_LENGTH = 500;

export const reviewSchema = z.object({
  rating: z
    .number("Choose a rating")
    .int("Choose a rating")
    .min(1, "Choose a rating from 1 to 5")
    .max(5, "Choose a rating from 1 to 5"),
  reviewText: z
    .string()
    .trim()
    .min(1, "Write a few words about your visit")
    .max(
      REVIEW_MAX_LENGTH,
      `Reviews can be at most ${REVIEW_MAX_LENGTH} characters`,
    ),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
