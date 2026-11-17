import type {
  FavoritesPageDTO,
  MyReviewDTO,
  MyReviewsPageDTO,
} from "@destino/shared";

export type { FavoritesPageDTO, MyReviewDTO, MyReviewsPageDTO };

export interface FavoritesResponseDTO extends FavoritesPageDTO {
  status: "success";
  results: number;
}

export interface MyReviewsResponseDTO extends MyReviewsPageDTO {
  status: "success";
  results: number;
}
