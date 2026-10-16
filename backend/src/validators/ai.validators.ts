import z from "zod";

const planRequestSchema = z.object({
  query: z
    .string()
    .min(10, 'Describe your trip in at least 10 characters')
    .max(500, 'Keep the query under 500 characters'),
});

const compareRequestSchema = z.object({
  query: z
    .string()
    .min(10, 'Describe what you want to compare in at least 10 characters')
    .max(500, 'Keep the query under 500 characters'),
});

export { planRequestSchema, compareRequestSchema };
