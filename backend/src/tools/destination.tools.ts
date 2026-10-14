import z from "zod";
import { Destination } from "../models/Destination.model";

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

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const destinationTools = {
  searchDestinations: {
    description:
      "Find destinations in the database matching a travel request. Use only IDs returned by this tool in later calls.",
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
        ],
      };

      const destinations = await Destination.find(destinationFilter)
        .select(
          "_id name location category description averageRating ratingsCount bestTimeToVisit travelTips",
        )
        .sort({ isFeatured: -1, averageRating: -1, ratingsCount: -1 })
        .limit(maxResults)
        .populate<{
          location: {
            city: string;
            country: { name: string; slug: string };
          };
        }>("location.country", "name slug")
        .lean();

      if (destinations.length === 0) {
        return {
          error:
            "No destinations found matching the search criteria. Try relaxing your filters or using different keywords.",
        };
      }

      return {
        matches: destinations.map((destination) => ({
          id: String(destination._id),
          name: destination.name,
          city: destination.location.city,
          country: destination.location.country.name,
          category: destination.category,
          description: destination.description,
          averageRating: destination.averageRating,
          ratingsCount: destination.ratingsCount,
          bestTimeToVisit: destination.bestTimeToVisit ?? "Not specified",
          travelTips: destination.travelTips ?? [],
        })),
      };
    },
  },
};
