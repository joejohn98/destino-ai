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
  continentSlug = destination.continentSlug ||
    (destination.continent
      ? destination.continent.toLowerCase().replace(/\s+/g, "-")
      : undefined),
): string {
  if (continentSlug && countrySlug && destination.slug) {
    return `/continents/${encodeURIComponent(continentSlug)}/countries/${encodeURIComponent(countrySlug)}/${encodeURIComponent(destination.slug)}`;
  }
  return "/destinations";
}

const nextOptimizedImageHosts = new Set([
  "images.unsplash.com",
  "i.postimg.cc",
  "hebbkx1anhila5yf.public.blob.vercel-storage.com",
  "res.cloudinary.com",
]);

/** Bypass Next's image proxy for administrator-supplied hosts. */
export function shouldBypassImageOptimization(source: string): boolean {
  try {
    const url = new URL(source);
    return (
      url.protocol !== "https:" ||
      url.port !== "" ||
      !nextOptimizedImageHosts.has(url.hostname)
    );
  } catch {
    return false;
  }
}

export interface Review {
  _id: string;
  destination: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
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
  slug?: string;
  destinationCount: number;
  averageRating: number;
}

export interface CountryDestinationsData {
  country: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    continent: string;
    continentSlug: string;
  };
  destinations: Destination[];
  totalDestinations: number;
}

export interface CountryDestinationsResponse {
  status: string;
  data: CountryDestinationsData;
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
  totalReviews: number;
  totalPages: number;
  currentPage: number;
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
  favoriteDestinations?: string[];
}

export interface AuthResponse {
  status: string;
  message?: string;
  data: AuthUser;
}

export interface AuthProfileResponse {
  status: string;
  message?: string;
  data: AuthUser;
}

export interface FavoriteIdsResponse {
  status: string;
  message?: string;
  data: { favoriteDestinations: string[] };
}

export interface FavoritesResponse {
  status: string;
  results: number;
  totalFavorites: number;
  totalPages: number;
  currentPage: number;
  data: Destination[];
}

export interface AdminDestShort {
  _id: string;
  name: string;
  location: { country: string };
}

export interface AdminCountryItem {
  _id: string;
  name: string;
  slug: string;
  continent: string | { _id: string; name: string; slug: string };
  destinations: AdminDestShort[] | Destination[];
  destinationCount?: number;
  /** Present when the country is fetched via the full /countries admin route. */
  imageUrl?: string;
  description?: string;
}

export interface AdminCountryDetail {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  continent: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  destinations: Destination[];
  destinationCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminContinent {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  countries: AdminCountryItem[];
  countryCount: number;
  destinationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminContinentsListResponse {
  status: "success";
  message?: string;
  results: number;
  data: AdminContinent[];
}

export interface AdminSingleContinentResponse {
  status: "success";
  message?: string;
  data: AdminContinent;
}

export interface AdminDestRow {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: { city: string; country: string; countrySlug?: string };
  category: string;
  imageUrls: string[];
  averageRating: number;
  ratingsCount: number;
  aiReviewSummary?: string;
  attractions?: Attraction[];
}


export interface MyReview {
  _id: string;
  rating: number;
  reviewText: string;
  sentiment?: "positive" | "neutral" | "negative";
  themes: string[];
  createdAt: string;
  updatedAt: string;
  destination: {
    _id: string | null;
    name: string;
    slug: string | null;
    countryName: string | null;
    countrySlug: string | null;
  };
}

export interface MyReviewsResponse {
  status: string;
  results: number;
  totalReviews: number;
  totalPages: number;
  currentPage: number;
  data: MyReview[];
}

export interface ReviewPayload {
  rating: number;
  reviewText: string;
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
    // Multipart payloads must let the browser set the boundary + Content-Type.
    // Only inject the JSON header for non-FormData bodies.
    const isFormData = options?.body instanceof FormData;

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

  // Current user
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
    return fetchApi<{ status: string; message?: string }>("/api/users/profile", {
      method: "DELETE",
      credentials: "include",
    });
  },

  async getMyReviews(params?: {
    page?: number;
    limit?: number;
  }): Promise<MyReviewsResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 12),
    });
    return fetchApi<MyReviewsResponse>(`/api/users/reviews?${query.toString()}`, {
      credentials: "include",
    });
  },

  // ─── Destination Admin Endpoints ─────────────────────────────────────────────
  async createDestination(formData: FormData): Promise<{ status: string; data: Destination }> {
    return fetchApi<{ status: string; data: Destination }>("/api/destinations", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
  },

  async updateDestination(id: string, formData: FormData): Promise<{ status: string; data: Destination }> {
    return fetchApi<{ status: string; data: Destination }>(`/api/destinations/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });
  },

  async deleteDestination(id: string): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(`/api/destinations/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  async regenerateAiSummary(destinationId: string): Promise<{ status: string; data: { summary?: string | null } }> {
    return fetchApi<{ status: string; data: { summary?: string | null } }>(
      `/api/ai/destinations/${encodeURIComponent(destinationId)}/summary/regenerate`,
      {
        method: "POST",
        credentials: "include",
      },
    );
  },

  // ─── Continent Admin Endpoints ──────────────────────────────────────────────
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

  async createContinent(formData: FormData): Promise<{ status: string; data: Continent }> {
    return fetchApi<{ status: string; data: Continent }>("/api/admin/continents", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
  },

  async updateContinent(id: string, formData: FormData): Promise<{ status: string; data: Continent }> {
    return fetchApi<{ status: string; data: Continent }>(`/api/admin/continents/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });
  },

  async deleteContinent(id: string): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(`/api/admin/continents/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  // ─── Country Admin Endpoints ────────────────────────────────────────────────
  async getAdminCountry(
    continentIdOrSlug: string,
    countrySlug: string,
  ): Promise<{ status: string; data: AdminCountryDetail }> {
    return fetchApi<{ status: string; data: AdminCountryDetail }>(
      `/api/admin/continents/${encodeURIComponent(continentIdOrSlug)}/countries/${encodeURIComponent(countrySlug)}`,
      { credentials: "include" },
    );
  },

  async getAdminCountries(continentId: string): Promise<{ status: string; results?: number; data: AdminCountryItem[] }> {
    return fetchApi<{ status: string; results?: number; data: AdminCountryItem[] }>(
      `/api/admin/continents/${encodeURIComponent(continentId)}/countries`,
      { credentials: "include" },
    );
  },

  async createCountry(continentId: string, formData: FormData): Promise<{ status: string; data: AdminCountryItem }> {
    return fetchApi<{ status: string; data: AdminCountryItem }>(
      `/api/admin/continents/${encodeURIComponent(continentId)}/countries`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );
  },

  async updateCountry(id: string, formData: FormData): Promise<{ status: string; data: AdminCountryItem }> {
    return fetchApi<{ status: string; data: AdminCountryItem }>(`/api/admin/countries/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });
  },

  async deleteCountry(id: string): Promise<{ status: string; message?: string }> {
    return fetchApi<{ status: string; message?: string }>(`/api/admin/countries/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  // Favorites
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

  async getDestinationById(
    id: string,
  ): Promise<SingleDestinationResponse> {
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
      { method: "PATCH", body: JSON.stringify(payload), credentials: "include" },
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

  // Continents & Countries (public)
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
        credentials: "include",
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
        credentials: "include",
        cache: "no-store",
      },
    );
  },
};
