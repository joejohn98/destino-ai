import mongoose from "mongoose";
import z from "zod";
import { Destination } from "../models/Destination.model";

// ─── Tool: Estimate trip budget ───────────────────────────────────────────────
// Used by: Planner Agent only
// When: Agent has decided on destinations and needs to calculate total cost

const estimateTripBudgetInput = z.object({
  destinationIds: z
    .array(z.string().min(1))
    .min(1)
    .max(10)
    .describe("Array of destination IDs (MongoDB ObjectId strings)"),
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
  budgetLimit: z
    .number()
    .nonnegative()
    .optional()
    .describe(
      "Maximum budget limit in INR (converted to INR if the user specified an international currency like USD, EUR, or GBP)",
    ),
});

const DAILY_RATES = {
  budget: {
    accommodation: 800,
    food: 700,
    localTransport: 300,
    activities: 500,
    intercityTransport: 1500,
  },
  moderate: {
    accommodation: 1800,
    food: 1400,
    localTransport: 700,
    activities: 1200,
    intercityTransport: 2500,
  },
  luxury: {
    accommodation: 5000,
    food: 3500,
    localTransport: 1800,
    activities: 3500,
    intercityTransport: 6000,
  },
} as const;

const formatInr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export const budgetTools = {
  estimateTripBudget: {
    description:
      "Estimate an INR trip budget from verified destination IDs, duration, travellers, and travel style. This is an estimate, not a booking quote.",
    inputSchema: estimateTripBudgetInput,
    execute: async ({
      destinationIds,
      durationDays,
      travellers,
      travelStyle,
      budgetLimit,
    }: z.infer<typeof estimateTripBudgetInput>) => {
      try {
        const invalidId = destinationIds.find(
          (destinationId) => !mongoose.isValidObjectId(destinationId),
        );
        if (invalidId) {
          return {
            error: `Invalid destination ID: ${invalidId}`,
          };
        }

        const destinations = await Destination.find({
          _id: { $in: destinationIds },
        })
          .select("_id name")
          .lean();

        const foundIds = new Set(
          destinations.map((destination) => String(destination._id)),
        );
        const missingIds = destinationIds.filter((id) => !foundIds.has(id));
        if (missingIds.length > 0) {
          return {
            error: "Some destination IDs were not found in the database.",
            missingIds,
          };
        }

        const rate = DAILY_RATES[travelStyle];
        const dailyPerTraveller =
          rate.accommodation +
          rate.food +
          rate.localTransport +
          rate.activities;
        const intercityTotal =
          Math.max(0, destinations.length - 1) *
          rate.intercityTransport *
          travellers;
        const dailyTotal = dailyPerTraveller * durationDays * travellers;
        const total = dailyTotal + intercityTotal;

        return {
          currency: "INR",
          travelStyle,
          destinations: destinations.map((destination) => ({
            id: String(destination._id),
            name: destination.name,
          })),
          durationDays,
          travellers,
          totalEstimatedCost: total,
          totalEstimatedCostFormatted: formatInr(total),
          perPersonCost: Math.round(total / travellers),
          perPersonCostFormatted: formatInr(Math.round(total / travellers)),
          breakdown: {
            accommodation: formatInr(
              rate.accommodation * durationDays * travellers,
            ),
            food: formatInr(rate.food * durationDays * travellers),
            localTransport: formatInr(
              rate.localTransport * durationDays * travellers,
            ),
            activities: formatInr(rate.activities * durationDays * travellers),
            intercityTransport: formatInr(intercityTotal),
          },
          budgetStatus:
            budgetLimit === undefined
              ? "not-provided"
              : total <= budgetLimit
                ? "within-budget"
                : "over-budget",
          budgetLimit:
            budgetLimit === undefined ? null : formatInr(budgetLimit),
          assumptions: [
            "Estimates are per the selected travel style and expressed in Indian rupees.",
            "Accommodation, food, local transport, activities, and intercity transport are included.",
            "Flights, visas, shopping, and unusual seasonal surcharges are not included.",
          ],
        };
      } catch (error) {
        console.error("[estimateTripBudget] Error executing tool:", error);
        return {
          error: "Failed to estimate trip budget due to a database error.",
        };
      }
    },
  },
};
