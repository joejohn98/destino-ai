import z from "zod";

const createReviewSchema = z.object({
  rating: z.coerce
    .number("Rating must be a number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .min(1, "Review text cannot be empty")
    .max(500, "Review text cannot exceed 500 characters")
    .trim(),
});

const updateReviewSchema = z
  .object({
    rating: z.coerce
      .number("Rating must be a number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
      .optional(),
    reviewText: z
      .string()
      .min(1, "Review text cannot be empty")
      .max(500, "Review text cannot exceed 500 characters")
      .trim()
      .optional(),
  })
  .refine(
    (data) => data.rating !== undefined || data.reviewText !== undefined,
    {
      message: "At least one of rating or reviewText must be provided",
    },
  );

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export { createReviewSchema, updateReviewSchema };
