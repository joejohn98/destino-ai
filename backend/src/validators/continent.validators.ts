import z from "zod";

const createContinentSchema = z.object({
  name: z.string().min(1, "Continent name is required").trim(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

const updateContinentSchema = z.object({
  name: z.string().min(1, "Continent name cannot be empty").trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

export type CreateContinentInput = z.infer<typeof createContinentSchema>;
export type UpdateContinentInput = z.infer<typeof updateContinentSchema>;

export { createContinentSchema, updateContinentSchema };
