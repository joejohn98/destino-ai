import z from "zod";

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

const positiveIntegerQuery = z
  .string()
  .regex(/^[1-9]\d*$/, "Must be a positive integer")
  .transform(Number)
  .refine(Number.isSafeInteger, "Must be a safe integer");

export const paginationQuerySchema = z.object({
  page: positiveIntegerQuery.optional().transform((page) => page ?? 1),
  limit: positiveIntegerQuery
    .optional()
    .transform((limit) => limit ?? DEFAULT_PAGE_SIZE)
    .pipe(
      z.number().max(MAX_PAGE_SIZE, `Limit cannot exceed ${MAX_PAGE_SIZE}`),
    ),
});

export const destinationListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  location: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minRating: z
    .string()
    .regex(/^\d+(?:\.\d+)?$/, "minRating must be a number between 0 and 5")
    .transform(Number)
    .pipe(z.number().min(0).max(5))
    .optional(),
});

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters long"),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type DestinationListQuery = z.infer<typeof destinationListQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
