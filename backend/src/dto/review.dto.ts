import type { Sentiment } from "../models/Destination.model";

export interface PublicReviewAuthorDTO {
  _id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface PublicReviewDTO {
  _id: string;
  destination: string;
  user: PublicReviewAuthorDTO | null;
  authorName: string;
  rating: number;
  reviewText: string;
  sentiment?: Sentiment;
  themes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReviewsDTO {
  data: PublicReviewDTO[];
  totalReviews: number;
  totalPages: number;
  currentPage: number;
}

export interface ReviewListResponseDTO extends PaginatedReviewsDTO {
  status: "success";
  results: number;
}
