import type {
  PublicReviewAuthorDTO,
  PublicReviewDTO,
  PaginatedReviewsDTO,
} from "@destino/shared";

export type {
  PublicReviewAuthorDTO,
  PublicReviewDTO,
  PaginatedReviewsDTO,
};

export interface ReviewListResponseDTO extends PaginatedReviewsDTO {
  status: "success";
  results: number;
}
