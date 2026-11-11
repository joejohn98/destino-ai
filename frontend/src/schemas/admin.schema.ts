import { z } from "zod";

export const CATEGORIES = [
  "beach",
  "mountain",
  "city",
  "historical",
  "adventure",
  "wildlife",
] as const;

export const ATTRACTION_CATEGORIES = [
  "monument",
  "museum",
  "market",
  "nature",
  "viewpoint",
  "day-trip",
  "activity",
  "religious",
  "entertainment",
] as const;

/** Shared schema for the continent and country "single-image entity" forms. */
export const entitySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

export type EntityFormData = z.infer<typeof entitySchema>;

export const destinationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  category: z.enum(CATEGORIES),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().optional(),
  country: z.string().trim().min(1, "Country is required"),
  bestTimeToVisit: z.string().trim().optional(),
  openingHours: z.string().trim().optional(),
  ticketPrice: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

export type DestinationFormData = z.infer<typeof destinationSchema>;
