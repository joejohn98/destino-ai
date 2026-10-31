import z from "zod";
import { imageUrlSchema } from "./continent.validators";

const createCountrySchema = z.object({
  name: z.string().min(1, "Country name is required").trim(),
  description: z.string().trim().optional(),
  imageUrl: imageUrlSchema.optional(),
});

const updateCountrySchema = z.object({
  name: z.string().min(1, "Country name cannot be empty").trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: imageUrlSchema.optional(),
});

export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>;

export { createCountrySchema, updateCountrySchema };
