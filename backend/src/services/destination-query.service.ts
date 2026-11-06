import type { QueryFilter } from "mongoose";
import { CATEGORIES, Destination } from "../models/Destination.model";
import type { Category, IDestination } from "../models/Destination.model";
import { Country } from "../models/Country.model";
import { AppError } from "../utils/AppError";
import { escapeRegex } from "../utils/validation";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../validators/query.validators";
import { CACHE_KEYS, LISTING_CACHE_TTL, withCache } from "../utils/cache";
import type {
  DestinationCardDTO,
  DestinationCardRecord,
} from "../dto/destination.dto";
import { toDestinationCardDTO } from "../dto/destination.dto";
import {
  normalizeSearchValue,
  toMongoTextSearch,
} from "../utils/search-normalization";

export interface PaginatedOptions {
  page: number;
  limit: number;
  search?: string;
  location?: string;
  category?: string;
  /** Filter destinations where averageRating >= minRating (0–5) */
  minRating?: number;
}

export interface PaginatedResult {
  destinations: DestinationCardDTO[];
  totalDestinations: number;
  totalPages: number;
  currentPage: number;
}

const DESTINATION_POPULATE_CONFIG = {
  path: "location.country",
  select: "slug name",
  populate: { path: "continent", select: "slug name" },
};

/**
 * Builds the MongoDB query filter for paginated destination listings based on
 * optional text search, location prefixes, category, and minimum rating.
 */
const buildPaginatedFilter = async (params: {
  textSearch?: string | undefined;
  location?: string | undefined;
  category?: string | undefined;
  minRating?: number | undefined;
}): Promise<QueryFilter<IDestination>> => {
  const { textSearch, location, category, minRating } = params;

  const locationPrefix = location
    ? new RegExp(`^${escapeRegex(normalizeSearchValue(location))}`)
    : undefined;

  const [matchingSearchCountries, matchingLocationCountries] =
    await Promise.all([
      textSearch
        ? Country.find({ $text: { $search: textSearch } })
            .select("_id")
            .lean()
        : Promise.resolve([]),
      locationPrefix
        ? Country.find({ searchName: locationPrefix }).select("_id").lean()
        : Promise.resolve([]),
    ]);

  const filters: QueryFilter<IDestination>[] = [];

  if (textSearch) {
    const searchBranches: QueryFilter<IDestination>[] = [
      { $text: { $search: textSearch } },
    ];
    const searchCountryIds = matchingSearchCountries.map((c) => c._id);
    if (searchCountryIds.length > 0) {
      searchBranches.push({ "location.country": { $in: searchCountryIds } });
    }
    filters.push({ $or: searchBranches });
  }

  if (locationPrefix) {
    const locationBranches: QueryFilter<IDestination>[] = [
      { searchCity: locationPrefix },
    ];
    const locationCountryIds = matchingLocationCountries.map((c) => c._id);
    if (locationCountryIds.length > 0) {
      locationBranches.push({
        "location.country": { $in: locationCountryIds },
      });
    }
    filters.push({ $or: locationBranches });
  }

  if (category) {
    filters.push({ category: category as Category });
  }

  if (minRating !== undefined) {
    filters.push({ averageRating: { $gte: minRating } });
  }

  return filters.length > 0 ? { $and: filters } : {};
};

export const getPaginatedDestinations = async (
  options: PaginatedOptions,
): Promise<PaginatedResult> => {
  const limit = Math.min(
    Math.max(1, options.limit || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const pageCount = Math.max(1, options.page || 1);
  const skip = (pageCount - 1) * limit;

  const search = options.search?.trim();
  const location = options.location?.trim();
  const category = options.category?.trim().toLowerCase();
  const minRating =
    options.minRating !== undefined ? Number(options.minRating) : undefined;

  if (search && search.length < 2) {
    throw new AppError(
      "Search query 'q' must be at least 2 characters long",
      400,
    );
  }

  const textSearch = search ? toMongoTextSearch(search) : undefined;
  if (search && !textSearch) {
    throw new AppError("Search query must contain letters or numbers", 400);
  }

  if (category && !CATEGORIES.includes(category as Category)) {
    throw new AppError(
      `Invalid category. Valid categories are: ${CATEGORIES.join(", ")}`,
      400,
    );
  }

  if (
    minRating !== undefined &&
    (isNaN(minRating) || minRating < 0 || minRating > 5)
  ) {
    throw new AppError("minRating must be a number between 0 and 5", 400);
  }

  const filter = await buildPaginatedFilter({
    textSearch,
    location,
    category,
    minRating,
  });

  const loadPage = async (): Promise<PaginatedResult> => {
    const sort =
      minRating !== undefined
        ? { averageRating: -1 as const, _id: 1 as const }
        : { createdAt: -1 as const, _id: -1 as const };

    const [destinations, total] = await Promise.all([
      Destination.find(filter)
        .select("-reviews -__v -searchCity")
        .populate<{ location: DestinationCardRecord["location"] }>(
          DESTINATION_POPULATE_CONFIG,
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<DestinationCardRecord[]>(),
      Destination.countDocuments(filter),
    ]);

    const enriched = destinations.map(toDestinationCardDTO);
    const totalPages = Math.ceil(total / limit) || 0;

    return {
      destinations: enriched,
      totalDestinations: total,
      totalPages,
      currentPage: pageCount,
    };
  };

  // Skip cache when specific filters or search queries are present
  if (search || location || category || minRating !== undefined) {
    return loadPage();
  }

  return withCache(
    CACHE_KEYS.paginatedPage(pageCount, limit),
    LISTING_CACHE_TTL,
    loadPage,
  );
};

export const searchDestinations = async (
  q: string,
): Promise<DestinationCardDTO[]> => {
  const trimmedQ = q.trim();
  if (!trimmedQ || trimmedQ.length < 2) {
    throw new AppError(
      "Search query 'q' must be at least 2 characters long",
      400,
    );
  }

  const textSearch = toMongoTextSearch(trimmedQ);
  if (!textSearch) {
    throw new AppError("Search query must contain letters or numbers", 400);
  }

  const matchingCountries = await Country.find({
    $text: { $search: textSearch },
  })
    .select("_id")
    .lean();
  const countryIds = matchingCountries.map((c) => c._id);

  const branches: QueryFilter<IDestination>[] = [
    { $text: { $search: textSearch } },
  ];
  if (countryIds.length > 0) {
    branches.push({ "location.country": { $in: countryIds } });
  }

  return Destination.find({ $or: branches })
    .select("-reviews -__v -searchCity")
    .populate<{ location: DestinationCardRecord["location"] }>(
      DESTINATION_POPULATE_CONFIG,
    )
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .lean<DestinationCardRecord[]>()
    .then((destinations) => destinations.map(toDestinationCardDTO));
};

export const getDestinationsByLocation = async (
  rawLocation: string,
): Promise<DestinationCardDTO[]> => {
  const locParam = decodeURIComponent(rawLocation).trim();
  const prefix = new RegExp(`^${escapeRegex(normalizeSearchValue(locParam))}`);

  const matchingCountries = await Country.find({ searchName: prefix })
    .select("_id")
    .lean();
  const countryIds = matchingCountries.map((c) => c._id);

  const branches: QueryFilter<IDestination>[] = [{ searchCity: prefix }];
  if (countryIds.length > 0) {
    branches.push({ "location.country": { $in: countryIds } });
  }

  return Destination.find({ $or: branches })
    .select("-reviews -__v -searchCity")
    .populate<{ location: DestinationCardRecord["location"] }>(
      DESTINATION_POPULATE_CONFIG,
    )
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .lean<DestinationCardRecord[]>()
    .then((destinations) => destinations.map(toDestinationCardDTO));
};

export const getDestinationsByCategory = async (
  rawCategory: string,
): Promise<{ category: Category; destinations: DestinationCardDTO[] }> => {
  const category = rawCategory.toLowerCase() as Category;

  if (!CATEGORIES.includes(category)) {
    throw new AppError(
      `Invalid category. Valid categories are: ${CATEGORIES.join(", ")}`,
      400,
    );
  }

  const destinations = await Destination.find({ category })
    .select("-reviews -__v -searchCity")
    .populate<{ location: DestinationCardRecord["location"] }>(
      DESTINATION_POPULATE_CONFIG,
    )
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .lean<DestinationCardRecord[]>();

  return { category, destinations: destinations.map(toDestinationCardDTO) };
};
