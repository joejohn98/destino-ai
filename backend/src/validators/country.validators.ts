import z from "zod";

const createCountrySchema = z.object({
  name: z.string().min(1, "Country name is required").trim(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

const updateCountrySchema = z.object({
  name: z.string().min(1, "Country name cannot be empty").trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>;

export { createCountrySchema, updateCountrySchema };
