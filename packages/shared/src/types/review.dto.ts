import type { Sentiment } from "./auth.dto";

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
