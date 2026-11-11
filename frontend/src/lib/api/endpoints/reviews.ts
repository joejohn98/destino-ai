import { fetchApi } from "../core";
import type {
  FavoriteIdsResponse,
  FavoritesResponse,
  ReviewPayload,
  ReviewsResponse,
} from "../types";

export const reviewEndpoints = {
  async getDestinationReviews(
    countrySlug: string,
    destinationSlug: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<ReviewsResponse> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    const queryString = query.size > 0 ? `?${query.toString()}` : "";

    return fetchApi<ReviewsResponse>(
      `/api/countries/${encodeURIComponent(countrySlug)}/destinations/${encodeURIComponent(destinationSlug)}/reviews${queryString}`,
    );
  },

  async createReview(
    countrySlug: string,
    destinationSlug: string,
    payload: ReviewPayload,
  ): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(
      `/api/countries/${encodeURIComponent(countrySlug)}/destinations/${encodeURIComponent(destinationSlug)}/reviews`,
      { method: "POST", body: JSON.stringify(payload), credentials: "include" },
    );
  },

  async updateReview(
    reviewId: string,
    payload: Partial<ReviewPayload>,
  ): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(
      `/api/reviews/${encodeURIComponent(reviewId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        credentials: "include",
      },
    );
  },

  async deleteReview(
    reviewId: string,
  ): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(
      `/api/reviews/${encodeURIComponent(reviewId)}`,
      { method: "DELETE", credentials: "include" },
    );
  },

  async getFavorites(params?: {
    page?: number;
    limit?: number;
  }): Promise<FavoritesResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 12),
    });
    return fetchApi<FavoritesResponse>(
      `/api/users/favorites?${query.toString()}`,
      { credentials: "include" },
    );
  },

  async addFavorite(destinationId: string): Promise<FavoriteIdsResponse> {
    return fetchApi<FavoriteIdsResponse>(
      `/api/users/favorites/${encodeURIComponent(destinationId)}`,
      { method: "POST", credentials: "include" },
    );
  },

  async removeFavorite(destinationId: string): Promise<FavoriteIdsResponse> {
    return fetchApi<FavoriteIdsResponse>(
      `/api/users/favorites/${encodeURIComponent(destinationId)}`,
      { method: "DELETE", credentials: "include" },
    );
  },
};

