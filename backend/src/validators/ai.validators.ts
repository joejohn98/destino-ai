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

export type PlanRequestInput = z.infer<typeof planRequestSchema>;
export type CompareRequestInput = z.infer<typeof compareRequestSchema>;

export { planRequestSchema, compareRequestSchema };
