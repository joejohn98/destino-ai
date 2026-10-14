import { z } from "zod";

import { destinationTools } from "../tools/destination.tools";
import { reviewTools } from "../tools/review.tools";
import { budgetTools } from "../tools/budget.tools";

// ─── System Prompt ────────────────────────────────────────────────────────────
// This is the agent's "personality and rules".
// Gemini reads this before every step.

export const COMPARISON_SYSTEM = `
You are an expert travel destination comparison analyst.
Your goal is to help travellers make confident, informed decisions.

WORKFLOW:
1. Use searchDestinations or getDestinationDetails to fetch each destination mentioned.
2. Call getDestinationReviews for each to understand real visitor sentiment.
3. Compare them fairly across criteria relevant to the user's specific travel goal.
4. Give a clear, honest recommendation with your reasoning.

RULES:
- Fetch data for EVERY destination mentioned before writing the comparison.
- A higher rating does not always mean a better fit — context matters.
- Acknowledge when the non-recommended destination is better for a different traveller type.
- If a destination has no reviews, note that honestly.
`;

// ─── Tools ────────────────────────────────────────────────────────────────────

export const comparisonTools = {
  ...destinationTools,
  ...reviewTools,
  ...budgetTools,
};

export const COMPARISON_TOOLS_ORDER = [
  "searchDestinations",
  "getDestinationDetails",
  "getDestinationReviews",
  "estimateTripBudget",
] as const;

// ─── Output Schema ────────────────────────────────────────────────────────────
// Zod schema that enforces the exact JSON shape Gemini must return.
// If Gemini's output doesn't match, the SDK automatically retries.

export const comparisonSchema = z.object({
  userContext: z.string().describe("What the user is looking for"),
  destinations: z.array(
    z.object({
      name: z.string(),
      location: z.string().describe("e.g. Hampi, Karnataka, India"),
      category: z.string(),
      averageRating: z.number(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      bestFor: z.string().describe("Type of traveller this suits best"),
      reviewSentiment: z.enum([
        "overwhelmingly positive",
        "mostly positive",
        "mixed",
        "mostly negative",
        "no reviews yet",
      ]),
      standoutFact: z
        .string()
        .describe("One unique fact that sets this destination apart"),
    }),
  ),
  comparisonTable: z.array(
    z.object({
      criterion: z
        .string()
        .describe("e.g. Budget Friendliness, Transport Access"),
      winner: z
        .string()
        .describe("Name of the winning destination for this criterion"),
      reason: z.string(),
    }),
  ),
  recommendation: z.string().describe("Name of the recommended destination"),
  recommendationReason: z.string().describe("2–3 sentences explaining why"),
  alternativeAdvice: z
    .string()
    .describe("When the other destination would actually be a better pick"),
});

export type ComparisonOutput = z.infer<typeof comparisonSchema>;
