const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "http://localhost:5000"
    : "http://127.0.0.1:5000");

export interface Attraction {
  _id?: string;
  name: string;
  description?: string;
  ticketPrice?: string;
  suggestedDuration?: string;
  openingHours?: string;
  category?: string;
}

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: {
    city: string;
    state?: string;
    country: string;
    countrySlug?: string;
  };
  category:
    | "beach"
    | "mountain"
    | "city"
    | "historical"
    | "adventure"
    | "wildlife"
    | string;
  imageUrls: string[];
  attractions?: Attraction[];
  bestTimeToVisit?: string;
  travelTips?: string[];
  travelTipsContextHash?: string;
  aiReviewSummary?: string;
  summaryGeneratedAtRatingCount?: number;
  openingHours?: string;
  ticketPrice?: string;
  website?: string;
  averageRating: number;
  ratingsCount: number;
  isFeatured?: boolean;
  continent?: string;
  continentSlug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  destination: string;
  user?: {
    _id: string;
    username: string;
    avatarUrl?: string;
  } | null;
  authorName: string;
  rating: number;
  reviewText: string;
  sentiment?: "positive" | "neutral" | "negative";
  themes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Continent {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  countryCount?: number;
  destinationCount?: number;
  countries?: {
    _id: string;
    name: string;
    slug: string;
    continent: string;
  }[];
}

export interface ContinentStat {
  continent: string;
  destinationCount: number;
  countryCount: number;
}

export interface CountryContinentStat {
  country: string;
  destinationCount: number;
  averageRating: number;
}

export interface PaginatedDestinationsResponse {
  status: string;
  results: number;
  totalDestinations: number;
  totalPages: number;
  currentPage: number;
  data: Destination[];
}

export interface SingleDestinationResponse {
  status: string;
  data: Destination;
}

export interface ReviewsResponse {
  status: string;
  results: number;
  data: Review[];
}

export interface ContinentsResponse {
  status: string;
  results: number;
  data: Continent[];
}

export interface ContinentStatsResponse {
  status: string;
  results: number;
  data: ContinentStat[];
}

export interface CountryContinentStatsResponse {
  status: string;
  continent: string;
  results: number;
  data: CountryContinentStat[];
}

export interface DestinationTipsResponse {
  status: string;
  data: {
    tips: string[];
  };
}

export interface DestinationSummaryResponse {
  status: string;
  data: {
    summary: string | null;
    message?: string;
    ratingsCount?: number;
  };
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
  bio?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  status: string;
  message?: string;
  data: AuthUser;
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

// Fetch helper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store", // Ensure we don't cache API responses
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(
        errorBody?.message ||
          `API error: ${res.status} ${res.statusText} at ${endpoint}`,
      );
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`Fetch failure at ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
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

  // Destinations
  async getDestinations(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedDestinationsResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 12;
    return fetchApi<PaginatedDestinationsResponse>(
      `/api/destinations?page=${page}&limit=${limit}`,
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

  async getCanonicalDestination(
    countrySlug: string,
    destinationSlug: string,
  ): Promise<SingleDestinationResponse> {
    return fetchApi<SingleDestinationResponse>(
      `/api/countries/${encodeURIComponent(countrySlug)}/destinations/${encodeURIComponent(destinationSlug)}`,
    );
  },

  async getDestinationReviews(
    countrySlug: string,
    destinationSlug: string,
  ): Promise<ReviewsResponse> {
    return fetchApi<ReviewsResponse>(
      `/api/countries/${encodeURIComponent(countrySlug)}/destinations/${encodeURIComponent(destinationSlug)}/reviews`,
    );
  },

  // Continents & Countries
  async getAdminContinents(): Promise<ContinentsResponse> {
    return fetchApi<ContinentsResponse>("/api/admin/continents");
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

  // AI enrichments
  async getDestinationTips(
    destinationId: string,
  ): Promise<DestinationTipsResponse> {
    return fetchApi<DestinationTipsResponse>(
      `/api/ai/destinations/${destinationId}/tips`,
    );
  },

  async getDestinationSummary(
    destinationId: string,
  ): Promise<DestinationSummaryResponse> {
    return fetchApi<DestinationSummaryResponse>(
      `/api/ai/destinations/${destinationId}/summary`,
    );
  },

  // Agents
  async planItinerary(query: string) {
    return fetchApi<{ status: string; data: unknown }>(
      "/api/ai/agents/plan-itinerary",
      {
        method: "POST",
        body: JSON.stringify({ query }),
        cache: "no-store",
      },
    );
  },

  async compareDestinations(query: string) {
    return fetchApi<{ status: string; data: unknown }>(
      "/api/ai/agents/compare",
      {
        method: "POST",
        body: JSON.stringify({ query }),
        cache: "no-store",
      },
    );
  },
};
