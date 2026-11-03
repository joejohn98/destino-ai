import z from "zod";

const positiveIntegerQuery = z
  .string()
  .regex(/^[1-9]\d*$/, "Must be a positive integer")
  .transform(Number)
  .refine(Number.isSafeInteger, "Must be a safe integer");

const reviewPaginationSchema = z.object({
  page: positiveIntegerQuery.optional().transform((page) => page ?? 1),
  limit: positiveIntegerQuery
    .optional()
    .transform((limit) => limit ?? 12)
    .pipe(z.number().max(50, "Limit cannot exceed 50")),
});

const createReviewSchema = z.object({
  rating: z.coerce
    .number("Rating must be a number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  reviewText: z
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
export type ReviewPaginationInput = z.infer<typeof reviewPaginationSchema>;

export { createReviewSchema, reviewPaginationSchema, updateReviewSchema };
