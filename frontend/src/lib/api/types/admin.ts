import type { Attraction, Destination } from "./destinations";

export interface AdminDestShort {
  _id: string;
  name: string;
  location: { country: string };
}

export interface AdminCountryItem {
  _id: string;
  name: string;
  slug: string;
  continent: string | { _id: string; name: string; slug: string };
  destinations: AdminDestShort[] | Destination[];
  destinationCount?: number;
  /** Present when the country is fetched via the full /countries admin route. */
  imageUrl?: string;
  description?: string;
}

export interface AdminCountryDetail {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  continent:
    | {
        _id: string;
        name: string;
        slug: string;
      }
    | string;
  destinations: Destination[];
  destinationCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminContinent {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  countries: AdminCountryItem[];
  countryCount: number;
  destinationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminContinentsListResponse {
  status: "success";
  message?: string;
  results: number;
  data: AdminContinent[];
}

export interface AdminSingleContinentResponse {
  status: "success";
  message?: string;
  data: AdminContinent;
}

export interface AdminDestRow {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: { city: string; country: string; countrySlug?: string };
  category: string;
  imageUrls: string[];
  averageRating: number;
  ratingsCount: number;
  aiReviewSummary?: string;
  attractions?: Attraction[];
}

