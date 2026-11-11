import { fetchApi } from "../core";
import type {
  ContinentStatsResponse,
  CountryContinentStatsResponse,
  CountryDestinationsResponse,
  Destination,
  PaginatedDestinationsResponse,
  SingleDestinationResponse,
} from "../types";

export const destinationEndpoints = {
  async getDestinations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    category?: string;
    minRating?: number;
  }): Promise<PaginatedDestinationsResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 12),
    });
    if (params?.search) query.set("q", params.search);
    if (params?.location) query.set("location", params.location);
    if (params?.category) query.set("category", params.category);
    if (params?.minRating !== undefined && params.minRating > 0)
      query.set("minRating", String(params.minRating));

    return fetchApi<PaginatedDestinationsResponse>(
      `/api/destinations?${query.toString()}`,
    );
  },

  async searchDestinations(
    query: string,
  ): Promise<{ status: string; results: number; data: Destination[] }> {
    return fetchApi<{ status: string; results: number; data: Destination[] }>(
      `/api/destinations/search?q=${encodeURIComponent(query)}`,
      { cache: "no-store" },
    );
  },

  async getDestinationsByCategory(
    category: string,
  ): Promise<{ status: string; results: number; data: Destination[] }> {
    return fetchApi<{ status: string; results: number; data: Destination[] }>(
      `/api/destinations/category/${encodeURIComponent(category.toLowerCase())}`,
    );
  },

  async getDestinationsByLocation(
    location: string,
  ): Promise<{ status: string; results: number; data: Destination[] }> {
    return fetchApi<{ status: string; results: number; data: Destination[] }>(
      `/api/destinations/location/${encodeURIComponent(location)}`,
    );
  },

  async getDestinationByNameOrSlug(
    nameOrSlug: string,
  ): Promise<SingleDestinationResponse> {
    return fetchApi<SingleDestinationResponse>(
      `/api/destinations/${encodeURIComponent(nameOrSlug)}`,
    );
  },

  async getDestinationById(id: string): Promise<SingleDestinationResponse> {
    return fetchApi<SingleDestinationResponse>(
      `/api/destinations/${encodeURIComponent(id)}`,
    );
  },

  async getCountryDestinations(
    countrySlug: string,
  ): Promise<CountryDestinationsResponse> {
    return fetchApi<CountryDestinationsResponse>(
      `/api/countries/${encodeURIComponent(countrySlug)}/destinations`,
    );
  },

  async getCanonicalDestination(
    countrySlug: string,
    destinationSlug: string,
  ): Promise<SingleDestinationResponse> {
    return fetchApi<SingleDestinationResponse>(
      `/api/countries/${encodeURIComponent(countrySlug)}/destinations/${encodeURIComponent(destinationSlug)}`,
    );
  },

  async getContinentStats(): Promise<ContinentStatsResponse> {
    return fetchApi<ContinentStatsResponse>("/api/destinations/continents");
  },

  async getCountriesByContinent(
    continent: string,
  ): Promise<CountryContinentStatsResponse> {
    return fetchApi<CountryContinentStatsResponse>(
      `/api/destinations/continents/${encodeURIComponent(continent)}/countries`,
    );
  },
};

