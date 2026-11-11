import { fetchApi } from "../core";
import type {
  CompareDestinationsResponse,
  DestinationSummaryResponse,
  DestinationTipsResponse,
  PlanItineraryResponse,
} from "../types";

export const aiEndpoints = {
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

  async planItinerary(query: string): Promise<PlanItineraryResponse> {
    return fetchApi<PlanItineraryResponse>("/api/ai/agents/plan-itinerary", {
      method: "POST",
      body: JSON.stringify({ query }),
      credentials: "include",
      cache: "no-store",
    });
  },

  async compareDestinations(
    query: string,
  ): Promise<CompareDestinationsResponse> {
    return fetchApi<CompareDestinationsResponse>("/api/ai/agents/compare", {
      method: "POST",
      body: JSON.stringify({ query }),
      credentials: "include",
      cache: "no-store",
    });
  },
};

