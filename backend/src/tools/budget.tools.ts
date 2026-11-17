import mongoose from "mongoose";
import z from "zod";
import { Destination } from "../models/Destination.model";
import {
  calculateDestinationBudget,
  calculateTripBudget,
  type PopulatedDestination,
  type StopBreakdownItem,
} from "../services/budget-calculation.service";

// Re-export shared types for external consumers and tool type declarations
export type { PopulatedDestination, StopBreakdownItem };

// ─── Budget Limit Input Schema ────────────────────────────────────────────────
const budgetLimitInputSchema = z.union([
  z.number().nonnegative(),
  z.object({
    amount: z.number().nonnegative().describe("Budget limit amount"),
    currency: z
      .string()
      .default("INR")
      .describe("Currency code, e.g. USD, EUR, GBP, JPY, INR"),
  }),
]);

// ─── Tool 1 Schema: Estimate Destination Budget ───────────────────────────────
const estimateDestinationBudgetInput = z.object({
  destinationId: z
    .string()
    .min(1)
    .describe("MongoDB ObjectId string of the destination to estimate"),
  durationDays: z
    .number()
    .int()
    .min(1)
    .max(30)
    .describe("Trip duration in days"),
  travellers: z.number().int().min(1).max(20).describe("Number of travellers"),
  travelStyle: z
    .enum(["budget", "moderate", "luxury"])
    .describe("Travel style preference"),
  budgetLimit: budgetLimitInputSchema
    .optional()
    .describe(
      "Optional user budget limit (e.g. 50000 or { amount: 1500, currency: 'USD' })",
    ),
});

// ─── Tool 2 Schema: Estimate Trip Budget ──────────────────────────────────────
const stopInputSchema = z.object({
  destinationId: z
    .string()
    .min(1)
    .describe("MongoDB ObjectId string of the destination"),
  days: z
    .number()
    .int()
    .min(1)
    .max(30)
    .optional()
    .describe("Number of days to spend at this stop"),
});

const estimateTripBudgetInput = z.object({
  stops: z
    .array(stopInputSchema)
    .min(1)
    .max(10)
    .optional()
    .describe(
      "List of itinerary stops with destination IDs and allocated days. Highly recommended for multi-stop itineraries.",
    ),
  destinationIds: z
    .array(z.string().min(1))
    .min(1)
    .max(10)
    .optional()
    .describe(
      "Array of destination IDs (fallback when stops array is not provided)",
    ),
  durationDays: z
    .number()
    .int()
    .min(1)
    .max(30)
    .describe("Total trip duration in days"),
  travellers: z.number().int().min(1).max(20).describe("Number of travellers"),
  travelStyle: z
    .enum(["budget", "moderate", "luxury"])
    .describe("Travel style preference"),
  budgetLimit: budgetLimitInputSchema
    .optional()
    .describe(
      "Optional user budget limit (e.g. 50000 or { amount: 2000, currency: 'USD' })",
    ),
});

export const budgetTools = {
  /**
   * Estimate budget for a single destination independently.
   * Useful for comparing alternatives without intercity transit charges.
   */
  estimateDestinationBudget: {
    description:
      "Estimate travel costs for a single destination independently using verified destination-specific local rates converted to INR. Ideal for evaluating destinations and comparing alternatives (e.g. Japan vs Thailand).",
    inputSchema: estimateDestinationBudgetInput,
    execute: async ({
      destinationId,
      durationDays,
      travellers,
      travelStyle,
      budgetLimit,
    }: z.infer<typeof estimateDestinationBudgetInput>) => {
      try {
        if (!mongoose.isValidObjectId(destinationId)) {
          return { error: `Invalid destination ID: ${destinationId}` };
        }

        const destination = (await Destination.findById(destinationId)
          .select("_id name location")
          .populate("location.country", "name slug")
          .lean()) as unknown as PopulatedDestination | null;

        if (!destination) {
          return {
            error: `Destination with ID ${destinationId} was not found in the database.`,
          };
        }

        return calculateDestinationBudget({
          destination,
          durationDays,
          travellers,
          travelStyle,
          budgetLimit,
        });
      } catch (error) {
        console.error(
          "[estimateDestinationBudget] Error executing tool:",
          error,
        );
        return {
          error:
            "Failed to estimate destination budget due to an internal error.",
        };
      }
    },
  },

  /**
   * Estimate budget for an itinerary (multi-stop or single destination).
   * Allocates days per stop, computes stop-specific local costs, and estimates transit between stops.
   */
  estimateTripBudget: {
    description:
      "Estimate an INR trip budget for a planned itinerary from destination stops, duration, travellers, travel style, and budget limit. Applies destination-specific daily rates and intercity transit legs.",
    inputSchema: estimateTripBudgetInput,
    execute: async ({
      stops,
      destinationIds,
      durationDays,
      travellers,
      travelStyle,
      budgetLimit,
    }: z.infer<typeof estimateTripBudgetInput>) => {
      try {
        const rawStops: Array<{ destinationId: string; days?: number }> =
          stops && stops.length > 0
            ? stops
            : (destinationIds ?? []).map((id) => ({ destinationId: id }));

        if (rawStops.length === 0) {
          return {
            error:
              "Please provide at least one destination stop or destination ID.",
          };
        }

        const invalidId = rawStops.find(
          (s) => !mongoose.isValidObjectId(s.destinationId),
        );
        if (invalidId) {
          return {
            error: `Invalid destination ID: ${invalidId.destinationId}`,
          };
        }

        const uniqueIds = [...new Set(rawStops.map((s) => s.destinationId))];

        const destinations = (await Destination.find({
          _id: { $in: uniqueIds },
        })
          .select("_id name location")
          .populate("location.country", "name slug")
          .lean()) as unknown as PopulatedDestination[];

        const foundMap = new Map(destinations.map((d) => [String(d._id), d]));
        const missing = uniqueIds.filter((id) => !foundMap.has(id));
        if (missing.length > 0) {
          return {
            error: "Some destination IDs were not found in the database.",
            missingIds: missing,
          };
        }

        return calculateTripBudget({
          rawStops,
          destinations,
          durationDays,
          travellers,
          travelStyle,
          budgetLimit,
        });
      } catch (error) {
        console.error("[estimateTripBudget] Error executing tool:", error);
        return {
          error: "Failed to estimate trip budget due to an internal error.",
        };
      }
    },
  },
};
