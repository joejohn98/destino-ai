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

export interface ReviewPayload {
  rating: number;
  reviewText: string;
}

