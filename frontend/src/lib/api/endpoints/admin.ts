import { fetchApi } from "../core";
import type {
  AdminContinentsListResponse,
  AdminCountryDetail,
  AdminCountryItem,
  AdminSingleContinentResponse,
  Continent,
  Destination,
} from "../types";

export const adminEndpoints = {
  async createDestination(
    formData: FormData,
  ): Promise<{ status: string; data: Destination }> {
    return fetchApi<{ status: string; data: Destination }>(
      "/api/destinations",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );
  },

  async updateDestination(
    id: string,
    formData: FormData,
  ): Promise<{ status: string; data: Destination }> {
    return fetchApi<{ status: string; data: Destination }>(
      `/api/destinations/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      },
    );
  },

  async deleteDestination(
    id: string,
  ): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(
      `/api/destinations/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
  },

  async regenerateAiSummary(
    destinationId: string,
  ): Promise<{
    status: string;
    data: {
      summary?: string | null;
      message?: string;
      ratingsCount?: number;
    };
  }> {
    return fetchApi<{
      status: string;
      data: {
        summary?: string | null;
        message?: string;
        ratingsCount?: number;
      };
    }>(
      `/api/ai/destinations/${encodeURIComponent(destinationId)}/summary/regenerate`,
      {
        method: "POST",
        credentials: "include",
      },
    );
  },

  async regenerateAiTips(
    destinationId: string,
  ): Promise<{ status: string; data: { tips: string[] } }> {
    return fetchApi<{ status: string; data: { tips: string[] } }>(
      `/api/ai/destinations/${encodeURIComponent(destinationId)}/tips/regenerate`,
      {
        method: "POST",
        credentials: "include",
      },
    );
  },

  async getAdminContinents(): Promise<AdminContinentsListResponse> {
    return fetchApi<AdminContinentsListResponse>("/api/admin/continents", {
      credentials: "include",
    });
  },

  async getAdminContinent(slug: string): Promise<AdminSingleContinentResponse> {
    return fetchApi<AdminSingleContinentResponse>(
      `/api/admin/continents/${encodeURIComponent(slug)}`,
      { credentials: "include" },
    );
  },

  async createContinent(
    formData: FormData,
  ): Promise<{ status: string; data: Continent }> {
    return fetchApi<{ status: string; data: Continent }>(
      "/api/admin/continents",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );
  },

  async updateContinent(
    id: string,
    formData: FormData,
  ): Promise<{ status: string; data: Continent }> {
    return fetchApi<{ status: string; data: Continent }>(
      `/api/admin/continents/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      },
    );
  },

  async deleteContinent(
    id: string,
  ): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(
      `/api/admin/continents/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
  },

  async getAdminCountry(
    continentIdOrSlug: string,
    countrySlug: string,
  ): Promise<{ status: string; data: AdminCountryDetail }> {
    return fetchApi<{ status: string; data: AdminCountryDetail }>(
      `/api/admin/continents/${encodeURIComponent(continentIdOrSlug)}/countries/${encodeURIComponent(countrySlug)}`,
      { credentials: "include" },
    );
  },

  async getAdminCountries(
    continentId: string,
  ): Promise<{ status: string; results?: number; data: AdminCountryItem[] }> {
    return fetchApi<{
      status: string;
      results?: number;
      data: AdminCountryItem[];
    }>(`/api/admin/continents/${encodeURIComponent(continentId)}/countries`, {
      credentials: "include",
    });
  },

  async createCountry(
    continentId: string,
    formData: FormData,
  ): Promise<{ status: string; data: AdminCountryItem }> {
    return fetchApi<{ status: string; data: AdminCountryItem }>(
      `/api/admin/continents/${encodeURIComponent(continentId)}/countries`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );
  },

  async updateCountry(
    id: string,
    formData: FormData,
  ): Promise<{ status: string; data: AdminCountryItem }> {
    return fetchApi<{ status: string; data: AdminCountryItem }>(
      `/api/admin/countries/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      },
    );
  },

  async deleteCountry(
    id: string,
  ): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(
      `/api/admin/countries/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
  },
};

