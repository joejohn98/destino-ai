import z from "zod";
import { Destination } from "../models/Destination.model";
import mongoose from "mongoose";

const searchDestinationsInput = z.object({
  query: z.string().trim().min(2).max(200),
  category: z
    .enum(["beach", "mountain", "city", "historical", "adventure", "wildlife"])
    .optional()
    .describe("Type of destination to filter by"),
  location: z
    .string()
    .optional()
    .describe("City or country name to filter destinations by location"),
  minRating: z
    .number()
    .min(0)
    .max(5)
    .optional()
    .describe("Minimum average rating for destinations (0-5)"),
  maxResults: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe("Maximum number of results to return, defaults to 5"),
});

const getDestinationDetailsInput = z.object({
  destinationId: z.string().describe("The MongoDB ObjectId of the destination"),
});

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const destinationTools = {
  // ─── Tool 1: Search destinations ───────────────────────────────────────────
  searchDestinations: {
    description:
      "Find one requested destination in the database. Returns verified destination details and its complete list of verified local attractions (including ticket prices, duration, opening hours, and categories) to be used when building daily itineraries. Call this separately for each destination name in a comparison, using the destination's exact or commonly used name. Use only IDs returned by this tool in later calls. Do not use one broad query containing multiple destination names.",
    inputSchema: searchDestinationsInput,
    execute: async ({
      query,
      category,
      location,
      minRating,
      maxResults,
    }: z.infer<typeof searchDestinationsInput>) => {
      const search = new RegExp(escapeRegex(query), "i");
      const destinationFilter = {
        ...(category ? { category } : {}),
        ...(location
          ? { "location.city": new RegExp(escapeRegex(location), "i") }
          : {}),
        ...(minRating !== undefined
          ? { averageRating: { $gte: minRating } }
          : {}),
        $or: [
          { name: search },
          { description: search },
          { "location.city": search },
          { "location.state": search },
        ],
      };

      try {
        const destinations = await Destination.find(destinationFilter)
          .select(
            "_id name location category description averageRating ratingsCount bestTimeToVisit travelTips aiReviewSummary attractions",
          )
          .sort({ isFeatured: -1, averageRating: -1, ratingsCount: -1 })
          .limit(maxResults)
          .populate<{
            location: {
              city: string;
              state?: string;
              country: { name: string; slug: string };
            };
          }>("location.country", "name slug")
          .lean();

        if (destinations.length === 0) {
          return {
            status: "not_found" as const,
            requestedQuery: query,
            matches: [],
            error:
              "No destinations found matching the search criteria. Try relaxing your filters or using different keywords.",
          };
        }

        return {
          matches: destinations.map((destination) => ({
            id: String(destination._id),
            name: destination.name,
            city: destination.location.city,
            state: destination.location.state,
            country: destination.location.country?.name ?? "Unknown",
            category: destination.category,
            description: destination.description,
            averageRating: destination.averageRating,
            ratingsCount: destination.ratingsCount,
            bestTimeToVisit: destination.bestTimeToVisit ?? "Not specified",
            aiReviewSummary:
              destination.aiReviewSummary ?? "No AI summary available",
            travelTips: destination.travelTips ?? [],
            attractions: (destination.attractions ?? []).map((a: any) => ({
              id: a._id ? String(a._id) : undefined,
              name: a.name,
              description: a.description ?? "",
              ticketPrice: a.ticketPrice ?? "Not specified",
              suggestedDuration: a.suggestedDuration ?? "Not specified",
              openingHours: a.openingHours ?? "Not specified",
              category: a.category ?? "activity",
            })),
          })),
        };
      } catch (error) {
        console.error("[searchDestinations] Error executing tool:", error);
        return {
          status: "database_error" as const,
          requestedQuery: query,
          error: "Failed to search destinations due to a database error.",
        };
      }
    },
  },

  // ─── Tool 2: Get destination details ───────────────────────────────────────
  // Used by: Comparison Agent
  // When: Agent already has an ID and needs full details for a specific destination
  getDestinationDetails: {
    description:
      "Get complete verified details for one selected destination using its ID. Call this once for every destination selected for comparison before making a recommendation. Use only IDs returned by searchDestinations.",
    inputSchema: getDestinationDetailsInput,
    execute: async ({
      destinationId,
    }: z.infer<typeof getDestinationDetailsInput>) => {
      try {
        if (!mongoose.isValidObjectId(destinationId)) {
          return { error: `Invalid destination ID: ${destinationId}` };
        }

        const destination = await Destination.findById(destinationId)
          .select("-reviews -__v")
          .populate<{
            location: {
              city: string;
              state?: string;
              country: { name: string; slug: string };
            };
          }>("location.country", "name slug")
          .lean();

        if (!destination) {
          return { error: `No destination found with ID: ${destinationId}` };
        }

        return {
          id: destination._id.toString(),
          name: destination.name,
          description: destination.description,
          city: destination.location.city,
          state: destination.location.state,
          country: destination.location.country?.name ?? "Unknown",
          category: destination.category,
          averageRating: destination.averageRating,
          ratingsCount: destination.ratingsCount,
          bestTimeToVisit: destination.bestTimeToVisit ?? "Not specified",
          aiReviewSummary:
            destination.aiReviewSummary ?? "No AI summary available",
          travelTips: destination.travelTips ?? [],
          attractions: (destination.attractions ?? []).map((a: any) => ({
            id: a._id ? String(a._id) : undefined,
            name: a.name,
            description: a.description ?? "",
            ticketPrice: a.ticketPrice ?? "Not specified",
            suggestedDuration: a.suggestedDuration ?? "Not specified",
            openingHours: a.openingHours ?? "Not specified",
            category: a.category ?? "activity",
          })),
        };
      } catch (error) {
        console.error("[getDestinationDetails] Error executing tool:", error);
        return {
          error: "Failed to fetch destination details due to a database error.",
        };
      }
    },
  },
};
