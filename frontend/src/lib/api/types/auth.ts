import type { Destination } from "./destinations";

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
  bio?: string;
  favoriteDestinations?: string[];
}

export interface AuthResponse {
  status: string;
  message?: string;
  data: AuthUser;
}

export interface AuthProfileResponse {
  status: string;
  message?: string;
  data: AuthUser;
}

export interface FavoriteIdsResponse {
  status: string;
  message?: string;
  data: { favoriteDestinations: string[] };
}

export interface FavoritesResponse {
  status: string;
  results: number;
  totalFavorites: number;
  totalPages: number;
  currentPage: number;
  data: Destination[];
}

export interface MyReview {
  _id: string;
  rating: number;
  reviewText: string;
  sentiment?: "positive" | "neutral" | "negative";
  themes: string[];
  createdAt: string;
  updatedAt: string;
  destination: {
    _id: string | null;
    name: string;
    slug: string | null;
    countryName: string | null;
    countrySlug: string | null;
    continentSlug?: string | null;
  };
}

export interface MyReviewsResponse {
  status: string;
  results: number;
  totalReviews: number;
  totalPages: number;
  currentPage: number;
  data: MyReview[];
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

