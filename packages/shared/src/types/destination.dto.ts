import type { Category } from "../constants/categories";

export interface AttractionDTO {
  _id?: string;
  name: string;
  description?: string;
  ticketPrice?: string;
  suggestedDuration?: string;
  openingHours?: string;
  category?: string;
}

export interface DestinationLocationDTO {
  city: string;
  state?: string;
  country: string;
  countrySlug?: string | null;
}

export interface DestinationCardDTO {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: DestinationLocationDTO;
  category: Category;
  imageUrls: string[];
  attractions: AttractionDTO[];
  bestTimeToVisit?: string;
  travelTips?: string[];
  travelTipsContextHash?: string;
  aiReviewSummary?: string;
  summaryGeneratedAtRatingCount?: number;
  openingHours?: string;
  ticketPrice?: string;
  website?: string;
  averageRating: number;
  ratingsCount: number;
  isFeatured?: boolean;
  continent?: string | null;
  continentSlug?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type DestinationDTO = DestinationCardDTO;
