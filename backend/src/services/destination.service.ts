import type { QueryFilter, Types } from "mongoose";
import slugify from "slugify";
import { CATEGORIES, Destination } from "../models/Destination.model";
import type { Category, IDestination } from "../models/Destination.model";
import { Country } from "../models/Country.model";
import { AppError } from "../utils/AppError";
import { escapeRegex, isValidObjectId } from "../utils/validation";
import {
  AGG_CACHE_TTL,
  CACHE_KEYS,
  DETAIL_CACHE_TTL,
  invalidateKeys,
  invalidatePattern,
  LISTING_CACHE_TTL,
  withCache,
} from "../utils/cache";
import { withMongoTransaction } from "../utils/mongo-transactions";
import type {
  CreateDestinationInput,
  UpdateDestinationInput,
} from "../validators/destination.validators";
import { Review, User } from "../models";
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

export interface ContinentStat {
  continent: string;
  countryCount: number;
  destinationCount: number;
}

export interface CountryStat {
  country: string;
  destinationCount: number;
  averageRating: number;
}

const getPaginatedDestinations = async (
  options: PaginatedOptions,
): Promise<PaginatedResult> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(Math.max(1, options.limit || 12), 50);
  const skip = (page - 1) * limit;

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
    const searchCountryIds = matchingSearchCountries.map(
      (country) => country._id,
    );
    if (searchCountryIds.length > 0) {
      searchBranches.push({ "location.country": { $in: searchCountryIds } });
    }
    filters.push({ $or: searchBranches });
  }
  if (locationPrefix) {
    const locationBranches: QueryFilter<IDestination>[] = [
      { searchCity: locationPrefix },
    ];
    const locationCountryIds = matchingLocationCountries.map(
      (country) => country._id,
    );
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

  const filter: QueryFilter<IDestination> =
    filters.length > 0 ? { $and: filters } : {};

  const loadPage = async (): Promise<PaginatedResult> => {
    const sort =
      minRating !== undefined
        ? { averageRating: -1 as const, _id: 1 as const }
        : { createdAt: -1 as const, _id: -1 as const };
    const [destinations, total] = await Promise.all([
      Destination.find(filter)
        .select("-reviews -__v -searchCity")
        .populate<{ location: DestinationCardRecord["location"] }>({
          path: "location.country",
          select: "slug name",
          populate: { path: "continent", select: "slug name" },
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<DestinationCardRecord[]>(),
      Destination.countDocuments(filter),
    ]);

    // Flatten country/continent slugs for frontend navigation and filtering.
    const enriched = destinations.map(toDestinationCardDTO);

    const totalPages = Math.ceil(total / limit) || 0;

    return {
      destinations: enriched,
      totalDestinations: total,
      totalPages,
      currentPage: page,
    };
  };

  if (search || location || category || minRating !== undefined) {
    return loadPage();
  }

  return withCache(
    CACHE_KEYS.paginatedPage(page, limit),
    LISTING_CACHE_TTL,
    loadPage,
  );
};

const searchDestinations = async (q: string): Promise<DestinationCardDTO[]> => {
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
  const countryIds = matchingCountries.map((country) => country._id);

  const branches: QueryFilter<IDestination>[] = [
    { $text: { $search: textSearch } },
  ];

  if (countryIds.length > 0) {
    branches.push({ "location.country": { $in: countryIds } });
  }

  return Destination.find({ $or: branches })
    .select("-reviews -__v -searchCity")
    .populate<{ location: DestinationCardRecord["location"] }>({
      path: "location.country",
      select: "name slug",
      populate: { path: "continent", select: "name slug" },
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .lean<DestinationCardRecord[]>()
    .then((destinations) => destinations.map(toDestinationCardDTO));
};

const getDestinationsByLocation = async (
  rawLocation: string,
): Promise<DestinationCardDTO[]> => {
  const locParam = decodeURIComponent(rawLocation).trim();
  const prefix = new RegExp(`^${escapeRegex(normalizeSearchValue(locParam))}`);

  const matchingCountries = await Country.find({ searchName: prefix })
    .select("_id")
    .lean();
  const countryIds = matchingCountries.map((c) => c._id);

  const $or: QueryFilter<IDestination>[] = [{ searchCity: prefix }];
  if (countryIds.length > 0) {
    $or.push({ "location.country": { $in: countryIds } });
  }

  return Destination.find({ $or })
    .select("-reviews -__v -searchCity")
    .populate<{ location: DestinationCardRecord["location"] }>({
      path: "location.country",
      select: "name slug",
      populate: { path: "continent", select: "name slug" },
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .lean<DestinationCardRecord[]>()
    .then((destinations) => destinations.map(toDestinationCardDTO));
};

const getDestinationsByCategory = async (
  rawCategory: string,
): Promise<{ category: Category; destinations: DestinationCardDTO[] }> => {
  const category = rawCategory.toLowerCase() as Category;
  const validCategories = [
    "beach",
    "mountain",
    "city",
    "historical",
    "adventure",
    "wildlife",
  ];

  if (!validCategories.includes(category)) {
    throw new AppError(
      `Invalid category. Valid categories are: ${validCategories.join(", ")}`,
      400,
    );
  }

  const destinations = await Destination.find({ category })
    .select("-reviews -__v -searchCity")
    .populate<{ location: DestinationCardRecord["location"] }>({
      path: "location.country",
      select: "name slug",
      populate: { path: "continent", select: "name slug" },
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .lean<DestinationCardRecord[]>();

  return { category, destinations: destinations.map(toDestinationCardDTO) };
};

const getContinentStats = async (): Promise<ContinentStat[]> => {
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

const getCountriesByContinent = async (
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
      const countries = stats.map(
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

const getDestinationByName = async (
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
    .populate<{ location: DestinationCardRecord["location"] }>({
      path: "location.country",
      select: "name slug",
      populate: { path: "continent", select: "name slug" },
    })
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
const getDestinationBySlug = async (
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
        .populate<{ location: DestinationCardRecord["location"] }>({
          path: "location.country",
          select: "name slug",
          populate: { path: "continent", select: "name slug" },
        })
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

const resolveCountry = async (countryIdentifier: string) => {
  if (isValidObjectId(countryIdentifier)) {
    const countryById = await Country.findById(countryIdentifier);
    if (countryById) return countryById;
  }
  const countryRegex = new RegExp(`^${escapeRegex(countryIdentifier)}$`, "i");
  return Country.findOne({ name: countryRegex });
};

const createDestination = async (data: CreateDestinationInput) => {
  const country = await resolveCountry(data.location.country);
  if (!country) {
    throw new AppError(`Country '${data.location.country}' not found`, 404);
  }

  const slug = slugify(data.name, { lower: true, strict: true });
  const existingDest = await Destination.findOne({
    "location.country": country._id,
    slug,
  });
  if (existingDest) {
    throw new AppError(
      "Destination with this name already exists in this country",
      409,
    );
  }

  const payload = {
    name: data.name,
    description: data.description,
    location: {
      city: data.location.city,
      ...(data.location.state ? { state: data.location.state } : {}),
      country: country._id,
    },
    category: data.category,
    ...(data.bestTimeToVisit ? { bestTimeToVisit: data.bestTimeToVisit } : {}),
    ...(data.images?.length ? { imageUrls: data.images } : {}),
    ...(data.attractions?.length
      ? {
          attractions: data.attractions.map((attraction) => ({
            name: attraction.name,
            ...(attraction.description !== undefined
              ? { description: attraction.description }
              : {}),
            ...(attraction.ticketPrice !== undefined
              ? { ticketPrice: attraction.ticketPrice }
              : {}),
            ...(attraction.suggestedDuration !== undefined
              ? { suggestedDuration: attraction.suggestedDuration }
              : {}),
            ...(attraction.openingHours !== undefined
              ? { openingHours: attraction.openingHours }
              : {}),
            ...(attraction.category !== undefined
              ? { category: attraction.category }
              : {}),
          })),
        }
      : {}),
  };

  const newDest = await Destination.create(payload);
  const { __v, ...rest } = newDest.toObject();

  // A new destination changes listing pages, country destinations, and continent/country counts
  await invalidateKeys(
    CACHE_KEYS.continentStats,
    CACHE_KEYS.countryDestinations(country.slug),
  );
  await invalidatePattern("api:dest:paginated:*");

  return rest;
};

const updateDestination = async (id: string, data: UpdateDestinationInput) => {
  const previousDestination = await Destination.findById(id)
    .select("slug location.country")
    .populate<{
      location: {
        country: { _id: Types.ObjectId; slug: string } | null;
      };
    }>(
      "location.country",
      "_id slug",
    )
    .lean();

  if (!previousDestination) {
    throw new AppError("Destination not found", 404);
  }

  const previousCountry = previousDestination.location?.country;
  if (!previousCountry) {
    throw new AppError("Destination country not found", 404);
  }
  const previousCountrySlug = previousCountry.slug;
  let targetCountryId: Types.ObjectId = previousCountry._id;

  const updatePayload: Record<string, unknown> = {};

  if (data.location?.country !== undefined) {
    const country = await resolveCountry(data.location.country);
    if (!country)
      throw new AppError(`Country '${data.location.country}' not found`, 404);
    targetCountryId = country._id;
    updatePayload["location.country"] = country._id;
  }

  if (data.name !== undefined) {
    const targetSlug = slugify(data.name, { lower: true, strict: true });
    const existing = await Destination.findOne({
      "location.country": targetCountryId,
      slug: targetSlug,
      _id: { $ne: id },
    });
    if (existing)
      throw new AppError(
        "Destination with this name already exists in this country",
        409,
      );
    updatePayload.name = data.name;
  } else if (data.location?.country !== undefined && targetCountryId) {
    const existing = await Destination.findOne({
      "location.country": targetCountryId,
      slug: previousDestination.slug,
      _id: { $ne: id },
    });
    if (existing)
      throw new AppError(
        "Destination with this name already exists in this country",
        409,
      );
  }

  if (data.description !== undefined)
    updatePayload.description = data.description;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.bestTimeToVisit !== undefined)
    updatePayload.bestTimeToVisit = data.bestTimeToVisit;
  if (data.images !== undefined) updatePayload.imageUrls = data.images;
  if (data.attractions !== undefined)
    updatePayload.attractions = data.attractions;

  if (data.location?.city !== undefined)
    updatePayload["location.city"] = data.location.city;
  if (data.location?.state !== undefined)
    updatePayload["location.state"] = data.location.state;

  const contextChanged =
    data.name !== undefined ||
    data.category !== undefined ||
    data.bestTimeToVisit !== undefined ||
    data.location?.city !== undefined ||
    data.location?.country !== undefined;

  const updatedDest = await Destination.findByIdAndUpdate(
    id,
    {
      $set: updatePayload,
      ...(contextChanged
        ? { $unset: { travelTips: 1, travelTipsContextHash: 1 } }
        : {}),
    },
    { new: true, runValidators: true },
  )
    .select("-__v")
    .lean();

  if (!updatedDest) {
    throw new AppError("Destination not found", 404);
  }

  // Resolve country slug to build the exact detail cache key
  const updatedCountry = await Country.findById(updatedDest.location?.country)
    .select("slug")
    .lean();

  // Invalidate cache entries for both the previous and updated route locations.
  const keysToInvalidate = new Set<string>([
    CACHE_KEYS.continentStats,
    ...(previousCountrySlug
      ? [CACHE_KEYS.countryDestinations(previousCountrySlug)]
      : []),
    ...(previousCountrySlug && previousDestination.slug
      ? [CACHE_KEYS.destBySlug(previousCountrySlug, previousDestination.slug)]
      : []),
  ]);

  if (updatedCountry?.slug) {
    keysToInvalidate.add(CACHE_KEYS.countryDestinations(updatedCountry.slug));
    if (updatedDest.slug) {
      keysToInvalidate.add(
        CACHE_KEYS.destBySlug(updatedCountry.slug, updatedDest.slug),
      );
    }
  }
  await invalidateKeys(...keysToInvalidate);
  await invalidatePattern("api:dest:paginated:*");

  return updatedDest;
};

const deleteDestination = async (id: string) => {
  const deletedDest = await withMongoTransaction(async (session) => {
    const destination = await Destination.findById(id).session(session);
    if (!destination) {
      throw new AppError("Destination not found", 404);
    }

    await Review.deleteMany({ destination: destination._id }, { session });
    await User.updateMany(
      { favoriteDestinations: destination._id },
      { $pull: { favoriteDestinations: destination._id } },
      { session },
    );

    const deleted = await Destination.findByIdAndDelete(id, { session });
    if (!deleted) {
      throw new AppError("Failed to delete destination", 500);
    }

    return deleted;
  });

  // Resolve country slug to build the exact detail cache key
  const deletedCountry = await Country.findById(deletedDest.location?.country)
    .select("slug")
    .lean();

  // A deleted destination changes the listing, country destinations, continent/country counts, and its own detail page
  const keysToInvalidate: string[] = [CACHE_KEYS.continentStats];
  if (deletedCountry?.slug) {
    keysToInvalidate.push(CACHE_KEYS.countryDestinations(deletedCountry.slug));
    if (deletedDest.slug) {
      keysToInvalidate.push(
        CACHE_KEYS.destBySlug(deletedCountry.slug, deletedDest.slug),
      );
    }
  }
  await invalidateKeys(...keysToInvalidate);
  await invalidatePattern("api:dest:paginated:*");

  return deletedDest;
};

const getDestinationsByCountrySlug = async (rawCountrySlug: string) => {
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
