import { API_BASE, fetchApi } from "../core";
import type {
  AuthProfileResponse,
  AuthResponse,
  AuthUser,
  LoginPayload,
  MyReviewsResponse,
  RegisterPayload,
} from "../types";

export const authEndpoints = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return fetchApi<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "include",
    });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return fetchApi<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "include",
    });
  },

  async logout(): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  },

  /** Full-page redirect target for Google/GitHub sign-in. */
  oauthUrl(provider: "google" | "github"): string {
    return `${API_BASE}/api/auth/${provider}`;
  },

  async getProfile(): Promise<AuthProfileResponse> {
    return fetchApi<AuthProfileResponse>("/api/users/profile", {
      credentials: "include",
    });
  },

  async updateProfile(
    payload: Partial<Pick<AuthUser, "firstName" | "lastName" | "email">>,
  ): Promise<AuthProfileResponse> {
    return fetchApi<AuthProfileResponse>("/api/users/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
      credentials: "include",
    });
  },

  async deleteProfile(): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(
      "/api/users/profile",
      {
        method: "DELETE",
        credentials: "include",
      },
    );
  },

  async getMyReviews(params?: {
    page?: number;
    limit?: number;
  }): Promise<MyReviewsResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 12),
    });
    return fetchApi<MyReviewsResponse>(
      `/api/users/reviews?${query.toString()}`,
      {
        credentials: "include",
      },
    );
  },
};

