import z from "zod";

export const imageUrlSchema = z
  .string()
  .trim()
  .url("Image URL must be a valid URL (e.g. https://…/photo.jpg)")
  .max(2000, "Image URL must be at most 2000 characters")
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "Image URL must start with http:// or https://",
  });

const createContinentSchema = z.object({
  name: z.string().min(1, "Continent name is required").trim(),
  description: z.string().trim().optional(),
  imageUrl: imageUrlSchema.optional(),
});

const updateContinentSchema = z.object({
  name: z.string().min(1, "Continent name cannot be empty").trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: imageUrlSchema.optional(),
});

export type CreateContinentInput = z.infer<typeof createContinentSchema>;
export type UpdateContinentInput = z.infer<typeof updateContinentSchema>;

export { createContinentSchema, updateContinentSchema };
