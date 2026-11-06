import { Destination } from "../models/Destination.model";
import { AppError } from "../utils/AppError";
import { escapeRegex } from "../utils/validation";
import { AGG_CACHE_TTL, CACHE_KEYS, withCache } from "../utils/cache";

export interface ContinentStat {
  continent: string;
  countryCount: number;
  destinationCount: number;
}

export interface CountryStat {
  country: string;
  slug: string;
  destinationCount: number;
  averageRating: number;
}

export const getContinentStats = async (): Promise<ContinentStat[]> => {
  return withCache(CACHE_KEYS.continentStats, AGG_CACHE_TTL, () =>
    Destination.aggregate([
      {
        $lookup: {
          from: "countries",
          localField: "location.country",
          foreignField: "_id",
          as: "countryDoc",
        },
      },
      { $unwind: "$countryDoc" },
      {
        $lookup: {
          from: "continents",
          localField: "countryDoc.continent",
          foreignField: "_id",
          as: "continentDoc",
        },
      },
      { $unwind: "$continentDoc" },
      {
        $group: {
          _id: "$continentDoc.name",
          countrySet: { $addToSet: "$countryDoc._id" },
          destinationCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          continent: "$_id",
          countryCount: { $size: "$countrySet" },
          destinationCount: 1,
        },
      },
      { $sort: { continent: 1 } },
    ]),
  );
};

export const getCountriesByContinent = async (
  rawContinent: string,
): Promise<{ continent: string; countries: CountryStat[] }> => {
  const continentParam = decodeURIComponent(rawContinent).trim();
  const continentSlug = continentParam.toLowerCase();
  const continentRegex = new RegExp(`^${escapeRegex(continentParam)}$`, "i");

  return withCache(
    CACHE_KEYS.continentCountries(continentSlug),
    AGG_CACHE_TTL,
    async () => {
      const stats = await Destination.aggregate([
        {
          $lookup: {
            from: "countries",
            localField: "location.country",
            foreignField: "_id",
            as: "countryDoc",
          },
        },
        { $unwind: "$countryDoc" },
        {
          $lookup: {
            from: "continents",
            localField: "countryDoc.continent",
            foreignField: "_id",
            as: "continentDoc",
          },
        },
        { $unwind: "$continentDoc" },
        {
          $match: {
            "continentDoc.name": continentRegex,
          },
        },
        {
          $group: {
            _id: {
              country: "$countryDoc.name",
              slug: "$countryDoc.slug",
              continent: "$continentDoc.name",
            },
            destinationCount: { $sum: 1 },
            avgRating: { $avg: "$averageRating" },
          },
        },
        {
          $project: {
            _id: 0,
            country: "$_id.country",
            slug: "$_id.slug",
            continent: "$_id.continent",
            destinationCount: 1,
            averageRating: { $round: ["$avgRating", 1] },
          },
        },
        { $sort: { country: 1 } },
      ]);

      if (!stats || stats.length === 0) {
        throw new AppError(
          `No destinations found for continent: ${continentParam}`,
          404,
        );
      }

      const canonicalContinent = stats[0].continent;
      const countries: CountryStat[] = stats.map(
        ({ country, slug, destinationCount, averageRating }) => ({
          country,
          slug: slug || country.toLowerCase().replace(/\s+/g, "-"),
          destinationCount,
          averageRating: averageRating || 0,
        }),
      );

      return { continent: canonicalContinent, countries };
    },
  );
};
