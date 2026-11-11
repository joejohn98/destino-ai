import type { ApiError, ItineraryOutput, PlanItineraryResponse } from "@/lib/api";

export const examples = [
  "Plan a 3-day budget trip to Hampi for 2 travellers under ₹15,000",
  "I want a 5-day cultural trip in Rajasthan under ₹30,000",
  "Plan a 7-day moderate trip for 2 people in Kerala",
];

export type PlannerState =
  | { kind: "success"; query: string; itinerary: ItineraryOutput }
  | {
      kind: "unavailable" | "invalid_request";
      message: string;
      result?: ItineraryOutput;
    }
  | { kind: "error"; message: string }
  | null;

export type PlannerErrorPayload = {
  message?: string;
  data?: {
    result?: ItineraryOutput;
  };
};

export function asFailureState(
  response: PlanItineraryResponse,
): Exclude<PlannerState, null | { kind: "success" }> {
  if (response.status === "fail") {
    const result = response.data?.result;
    const kind =
      result?.status === "invalid_request" ? "invalid_request" : "unavailable";
    return {
      kind,
      message: result?.message || response.message,
      result,
    };
  }

  const result = response.data.itinerary;
  return {
    kind: result.status === "invalid_request" ? "invalid_request" : "unavailable",
    message:
      result.message ||
      "We couldn’t create an itinerary from that request. Try another destination or adjust the trip details.",
    result,
  };
}

export function getApiFailure(error: ApiError): PlannerState {
  const payload = error.payload as PlannerErrorPayload | null;
  const result = payload?.data?.result;

  if (result?.status === "unavailable" || result?.status === "invalid_request") {
    return {
      kind: result.status,
      message: result.message || payload?.message || error.message,
      result,
    };
  }

  return {
    kind: "error",
    message: payload?.message || error.message,
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatStyle(style?: ItineraryOutput["travelStyle"]): string | null {
  switch (style) {
    case "budget":
      return "Budget";
    case "moderate":
      return "Moderate";
    case "luxury":
      return "Luxury";
    default:
      return null;
  }
}

