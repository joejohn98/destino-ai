import mongoose from "mongoose";
import z from "zod";
import { Destination } from "../models/Destination.model";

const estimateTripBudgetInput = z.object({
  destinationIds: z.array(z.string().min(1)).min(1).max(10),
  durationDays: z.number().int().min(1).max(30),
  travellers: z.number().int().min(1).max(20),
  travelStyle: z.enum(["budget", "moderate", "luxury"]),
  budgetLimit: z.number().nonnegative().optional(),
});

const rates = {
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

      const foundIds = new Set(destinations.map((destination) => String(destination._id)));
      const missingIds = destinationIds.filter((id) => !foundIds.has(id));
      if (missingIds.length > 0) {
        return {
          error: "Some destination IDs were not found in the database.",
          missingIds,
        };
      }

      const rate = rates[travelStyle];
      const dailyPerTraveller =
        rate.accommodation + rate.food + rate.localTransport + rate.activities;
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
        budgetLimit: budgetLimit === undefined ? null : formatInr(budgetLimit),
        assumptions: [
          "Estimates are per the selected travel style and expressed in Indian rupees.",
          "Accommodation, food, local transport, activities, and intercity transport are included.",
          "Flights, visas, shopping, and unusual seasonal surcharges are not included.",
        ],
      };
    },
  },
};
