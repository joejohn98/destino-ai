import type { Destination } from "./destinations";
import type { AuthUserDTO, MyReviewDTO } from "@destino/shared";

export type AuthUser = AuthUserDTO;
export type MyReview = MyReviewDTO;

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

