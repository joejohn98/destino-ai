import type { DestinationCardDTO } from "./destination.dto";
import type { Sentiment } from "../models/Destination.model";

export interface FavoritesPageDTO {
  data: DestinationCardDTO[];
  totalFavorites: number;
  totalPages: number;
  currentPage: number;
}

export interface MyReviewDTO {
  _id: string;
  rating: number;
  reviewText: string;
  sentiment?: Sentiment;
  themes: string[];
  createdAt: string;
  updatedAt: string;
  destination: {
    _id: string | null;
    name: string;
    slug: string | null;
    countryName: string | null;
    countrySlug: string | null;
  };
}

export interface MyReviewsPageDTO {
  data: MyReviewDTO[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
}

export interface FavoritesResponseDTO extends FavoritesPageDTO {
  status: "success";
  results: number;
}

export interface MyReviewsResponseDTO extends MyReviewsPageDTO {
  status: "success";
  results: number;
}
