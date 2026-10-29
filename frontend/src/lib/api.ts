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

export function destinationHref(
  destination: Destination,
  countrySlug = destination.location?.countrySlug,
): string {
  const href = `/destinations/${encodeURIComponent(destination.slug || destination._id)}`;
  return countrySlug && destination.slug
    ? `${href}?country=${encodeURIComponent(countrySlug)}`
    : href;
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

export interface ItineraryDay {
  day: number;
  destinationId: string;
  destination: string;
  theme: string;
  activities: string[];
  accommodation: string;
  estimatedDailyCost: string;
  tips: string[];
}

export interface ItineraryOutput {
  status: "success" | "unavailable" | "invalid_request";
  message?: string;
  unresolvedDestinations?: string[];
  suggestedDestinations?: string[];
  durationDays?: number;
  travellers?: number;
  travelStyle?: "budget" | "moderate" | "luxury";
  budgetLimit?: number | null;
  assumptions?: string[];
  title?: string;
  summary?: string;
  totalEstimatedCost?: string;
  perPersonCost?: string;
  days?: ItineraryDay[];
  budgetBreakdown?: {
    accommodation: string;
    food: string;
    localTransport: string;
    activities: string;
    intercityTransport: string;
  };
  bestTimeToVisit?: string;
  warnings?: string[];
  reviewHighlights?: string[];
}

export interface ItineraryMeta {
  stepsUsed?: number;
  totalTokens?: number | string;
}

export type PlanItineraryResponse =
  | {
      status: "success";
      message?: string;
      data: {
        query: string;
        itinerary: ItineraryOutput;
        meta?: ItineraryMeta;
      };
    }
  | {
      status: "fail";
      message: string;
      data?: {
        query?: string;
        result?: ItineraryOutput;
        meta?: ItineraryMeta;
      };
    };

export interface ComparedDestination {
  name: string;
  location: string;
  category: string;
  averageRating: number;
  pros: string[];
  cons: string[];
  bestFor: string;
  reviewSentiment:
    | "overwhelmingly positive"
    | "mostly positive"
    | "mixed"
    | "mostly negative"
    | "no reviews yet";
  standoutFact: string;
}

export interface ComparisonOutput {
  status: "success" | "partial" | "unavailable" | "invalid_request";
  message?: string;
  unresolvedDestinations?: string[];
  userContext?: string;
  destinations?: ComparedDestination[];
  comparisonTable?: {
    criterion: string;
    winner: string;
    reason: string;
  }[];
  recommendation?: string;
  recommendationReason?: string;
  alternativeAdvice?: string;
}

export interface CompareDestinationsResponse {
  status?: "success" | "fail" | "error";
  message?: string;
  data?: {
    query?: string;
    comparison?: ComparisonOutput;
    result?: ComparisonOutput;
    meta?: ItineraryMeta;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
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
      throw new ApiError(
        errorBody?.message ||
          `API error: ${res.status} ${res.statusText} at ${endpoint}`,
        res.status,
        errorBody,
      );
    }

    return (await res.json()) as T;
  } catch (error) {
    // A 4xx response is a handled API outcome (for example, an invalid
    // comparison request), not a network failure. Keep the payload available
    // to the page without reporting it as an unexpected fetch error.
    if (!(error instanceof ApiError) || error.statusCode >= 500) {
      console.error(`Fetch failure at ${url}:`, error);
    }
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
  async planItinerary(query: string): Promise<PlanItineraryResponse> {
    return fetchApi<PlanItineraryResponse>(
      "/api/ai/agents/plan-itinerary",
      {
        method: "POST",
        body: JSON.stringify({ query }),
        cache: "no-store",
      },
    );
  },

  async compareDestinations(query: string): Promise<CompareDestinationsResponse> {
    return fetchApi<CompareDestinationsResponse>(
      "/api/ai/agents/compare",
      {
        method: "POST",
        body: JSON.stringify({ query }),
        cache: "no-store",
      },
    );
  },
};
