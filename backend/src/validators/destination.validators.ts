import z from "zod";
import { CATEGORIES } from "../models/Destination.model";

const createDestinationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").trim(),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be at most 2000 characters").trim(),
  location: z.object({
    city: z.string().min(1, "City is required").trim(),
    country: z.string().min(1, "Country is required").trim(),
  }),
  continent: z.string().min(1, "Continent is required").trim(),
  category: z.enum(CATEGORIES, {
    message: `Category must be one of: ${CATEGORIES.join(", ")}`,
  }),
  bestTimeToVisit: z.string().trim().optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
});

const updateDestinationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().min(10).max(2000).trim().optional(),
  location: z.object({
    city: z.string().min(1).trim().optional(),
    country: z.string().min(1).trim().optional(),
  }).optional(),
  continent: z.string().trim().optional(),
  category: z.enum(CATEGORIES).optional(),
  bestTimeToVisit: z.string().trim().optional(),
  images: z.array(z.string().url()).optional(),
});

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;

export { createDestinationSchema, updateDestinationSchema };
