import { Destination } from "../models/Destination.model";
import { Country } from "../models/Country.model";
import { AppError } from "../utils/AppError";
import { escapeRegex, isValidObjectId } from "../utils/validation";
import { CACHE_KEYS, DETAIL_CACHE_TTL, withCache } from "../utils/cache";
import type {
  DestinationCardDTO,
  DestinationCardRecord,
} from "../dto/destination.dto";
import { toDestinationCardDTO } from "../dto/destination.dto";

// Sub-services
import {
  getPaginatedDestinations,
  searchDestinations,
  getDestinationsByLocation,
  getDestinationsByCategory,
  type PaginatedOptions,
  type PaginatedResult,
} from "./destination-query.service";
import {
  getContinentStats,
  getCountriesByContinent,
  type ContinentStat,
  type CountryStat,
} from "./destination-stats.service";
import {
  createDestination,
  updateDestination,
  deleteDestination,
} from "./destination-mutation.service";

// Re-export public types
export type { PaginatedOptions, PaginatedResult, ContinentStat, CountryStat };

const DESTINATION_POPULATE_CONFIG = {
  path: "location.country",
  select: "name slug",
  populate: { path: "continent", select: "name slug" },
};

/**
 * Get a single destination by name, slug, or MongoDB ObjectId.
 * (Preserved for backwards-compatibility and search result shortcuts).
 */
export const getDestinationByName = async (
  rawIdentifier: string,
): Promise<DestinationCardDTO> => {
  const param = decodeURIComponent(rawIdentifier).trim();

  const query = isValidObjectId(param)
    ? { _id: param }
    : {
        $or: [
          { name: new RegExp(`^${escapeRegex(param)}$`, "i") },
          { slug: param.toLowerCase() },
        ],
      };

  const destination = await Destination.findOne(query)
    .populate<{ location: DestinationCardRecord["location"] }>(
      DESTINATION_POPULATE_CONFIG,
    )
    .lean<DestinationCardRecord>();

  if (!destination) {
    throw new AppError("Destination not found", 404);
  }

  return toDestinationCardDTO(destination);
};

/**
 * Canonical destination detail lookup.
 * Uses the compound unique index { "location.country": 1, slug: 1 } so it is
 * always unambiguous — even if two countries share an identically-named destination.
 */
export const getDestinationBySlug = async (
  countrySlug: string,
  destinationSlug: string,
): Promise<DestinationCardDTO> => {
  return withCache(
    CACHE_KEYS.destBySlug(countrySlug, destinationSlug),
    DETAIL_CACHE_TTL,
    async () => {
      const country = await Country.findOne({
        slug: countrySlug.toLowerCase(),
      })
        .select("_id name slug")
        .lean();

      if (!country) {
        throw new AppError(`Country '${countrySlug}' not found`, 404);
      }

      const destination = await Destination.findOne({
        slug: destinationSlug.toLowerCase(),
        "location.country": country._id,
      })
        .select("-__v")
        .populate<{ location: DestinationCardRecord["location"] }>(
          DESTINATION_POPULATE_CONFIG,
        )
        .lean<DestinationCardRecord>();

      if (!destination) {
        throw new AppError(
          `Destination '${destinationSlug}' not found in '${country.name}'`,
          404,
        );
      }

      return toDestinationCardDTO(destination);
    },
  );
};

/**
 * Resolves all verified destinations belonging to a given country slug.
 */
export const getDestinationsByCountrySlug = async (rawCountrySlug: string) => {
  const countrySlug = decodeURIComponent(rawCountrySlug).trim().toLowerCase();

  return withCache(
    CACHE_KEYS.countryDestinations(countrySlug),
    DETAIL_CACHE_TTL,
    async () => {
      const country = await Country.findOne({ slug: countrySlug })
        .populate({
          path: "continent",
          select: "name slug",
        })
        .lean();

      if (!country) {
        throw new AppError(`Country '${countrySlug}' not found`, 404);
      }

      const destinations = await Destination.find({
        "location.country": country._id,
      })
        .select("-reviews -__v")
        .sort({ averageRating: -1, name: 1 })
        .limit(100)
        .lean();

      const continentObj = country.continent as {
        name?: string;
        slug?: string;
      } | null;
      const continentName = continentObj?.name ?? "";
      const continentSlug = continentObj?.slug ?? "";

      return {
        country: {
          _id: country._id,
          name: country.name,
          slug: country.slug,
          description: country.description,
          imageUrl: country.imageUrl,
          continent: continentName,
          continentSlug,
        },
        destinations: destinations.map((dest) => ({
          ...dest,
          location: {
            city: dest.location?.city,
            state: dest.location?.state,
            country: country.name,
            countrySlug: country.slug,
          },
          continent: continentName,
          continentSlug,
        })),
        totalDestinations: destinations.length,
      };
    },
  );
};

export default {
  getPaginatedDestinations,
  searchDestinations,
  getDestinationsByLocation,
  getDestinationsByCategory,
  getContinentStats,
  getCountriesByContinent,
  getDestinationByName,
  getDestinationBySlug,
  getDestinationsByCountrySlug,
  createDestination,
  updateDestination,
  deleteDestination,
};
