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

