import { z } from "zod";
import { budgetTools } from "../tools/budget.tools";
import { destinationTools } from "../tools/destination.tools";
import { reviewTools } from "../tools/review.tools";

// ─── System Prompt ────────────────────────────────────────────────────────────
// This is the agent's "personality and rules".
// Gemini reads this before every step.

export const PLANNER_SYSTEM = `
You are an expert AI travel planner specialising in Indian and international destinations.
Your goal is to create detailed, realistic, and personalised travel itineraries.

WORKFLOW — follow this order strictly:
1. Call searchDestinations to find destinations matching the user's request.
2. Call getDestinationReviews for the top 2–3 results to understand real traveller experiences.
3. Call estimateTripBudget with the selected destinations, trip duration, and travellers.
4. Produce a complete day-by-day itinerary using everything gathered.

RULES:
- Never use destination IDs you did not receive from a tool call.
- If the user's budget is insufficient, say so clearly in the warnings field.
- Extract real tips from the reviews you fetch — do not invent them.
- Be honest about remote locations, seasonal restrictions, or limited amenities.
- Use only destination IDs returned by searchDestinations in later tool calls.
- Follow the tool workflow before producing the final itinerary.
- Return only the structured itinerary; do not return markdown or commentary.
`;

export const plannerTools = {
  ...destinationTools,
  ...reviewTools,
  ...budgetTools,
};

export const PLANNER_TOOL_ORDER = [
  "searchDestinations",
  "getDestinationReviews",
  "estimateTripBudget",
] as const;


// ─── Output Schema ────────────────────────────────────────────────────────────
// Zod schema that enforces the exact JSON shape Gemini must return.
// If Gemini's output doesn't match, the SDK automatically retries.

export const itinerarySchema = z.object({
  title: z.string().describe("Name of the trip plan"),
  summary: z.string().describe("2–3 sentence overview of the trip"),
  totalEstimatedCost: z.string().describe("e.g. ₹24,500"),
  perPersonCost: z.string().describe("Cost per person e.g. ₹12,250"),
  travelStyle: z.enum(["budget", "moderate", "luxury"]),
  days: z.array(
    z.object({
      day: z.number(),
      destination: z.string(),
      theme: z.string().describe("e.g. Historical Exploration, Beach Day"),
      activities: z.array(z.string()),
      accommodation: z.string().describe("Type and estimated name"),
      estimatedDailyCost: z.string(),
      tips: z.array(z.string()).describe("Practical tips from real reviews"),
    }),
  ),
  budgetBreakdown: z.object({
    accommodation: z.string(),
    food: z.string(),
    localTransport: z.string(),
    activities: z.string(),
    intercityTransport: z.string(),
  }),
  bestTimeToVisit: z.string(),
  warnings: z
    .array(z.string())
    .describe("Budget gaps, seasonal issues, or safety notes"),
  reviewHighlights: z
    .array(z.string())
    .describe("Key takeaways from real traveller reviews"),
});

export type ItineraryOutput = z.infer<typeof itinerarySchema>;
