import type { UserRole } from "../constants/roles";
import type { Sentiment } from "../constants/categories";
import type { DestinationCardDTO } from "./destination.dto";

export type { Sentiment };

export interface AuthUserDTO {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  favoriteDestinations?: string[];
}

export interface MyReviewDestinationDTO {
  _id: string | null;
  name: string;
  slug: string | null;
  countryName: string | null;
  countrySlug: string | null;
  continentSlug?: string | null;
}

export interface MyReviewDTO {
  _id: string;
  rating: number;
  reviewText: string;
  sentiment?: Sentiment;
  themes: string[];
  createdAt: string;
  updatedAt: string;
  destination: MyReviewDestinationDTO;
}

export interface MyReviewsPageDTO {
  data: MyReviewDTO[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
}

export interface FavoritesPageDTO {
  data: DestinationCardDTO[];
  totalFavorites: number;
  totalPages: number;
  currentPage: number;
}
