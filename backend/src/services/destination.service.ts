import { Category, Destination } from "../models/Destination.model";
import { Country } from "../models/Country.model";
import { AppError } from "../utils/AppError";
import type {
  CreateDestinationInput,
  UpdateDestinationInput,
} from "../validators/destination.validators";
import { Review } from "../models";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface PaginatedOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult {
  destinations: any[];
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

  const [destinations, total] = await Promise.all([
    Destination.find()
      .select("-reviews -__v")
      .populate({
        path: "location.country",
        select: "slug name",
        populate: { path: "continent", select: "slug name" },
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Destination.countDocuments(),
  ]);

  // Flatten country/continent slugs so the frontend can build the full
  // hierarchical URL: /continents/:continentSlug/countries/:countrySlug/destinations/:destinationSlug
  const enriched = destinations.map((d: any) => {
    const country = d.location?.country;
    const continent = country?.continent;
    return {
      ...d,
      location: {
        city: d.location?.city,
        country: country?.name ?? country,
        countrySlug: country?.slug ?? null,
      },
      continent: continent?.name ?? null,
      continentSlug: continent?.slug ?? null,
    };
  });

  const totalPages = Math.ceil(total / limit) || 0;

  return {
    destinations: enriched,
    totalDestinations: total,
    totalPages,
    currentPage: page,
  };
};

const searchDestinations = async (q: string): Promise<any[]> => {
  const trimmedQ = q.trim();
  if (!trimmedQ || trimmedQ.length < 2) {
    throw new AppError(
      "Search query 'q' must be at least 2 characters long",
      400,
    );
  }

  const regex = new RegExp(escapeRegex(trimmedQ), "i");

  const matchingCountries = await Country.find({ name: regex })
    .select("_id")
    .lean();
  const countryIds = matchingCountries.map((c) => c._id);

  const $or: any[] = [
    { name: regex },
    { description: regex },
    { "location.city": regex },
  ];

  if (countryIds.length > 0) {
    $or.push({ "location.country": { $in: countryIds } });
  }

  return Destination.find({ $or }).select("-reviews -__v").lean();
};

const getDestinationsByLocation = async (
  rawLocation: string,
): Promise<any[]> => {
  const locParam = decodeURIComponent(rawLocation).trim();
  const regex = new RegExp(escapeRegex(locParam), "i");

  const matchingCountries = await Country.find({ name: regex })
    .select("_id")
    .lean();
  const countryIds = matchingCountries.map((c) => c._id);

  const $or: any[] = [{ "location.city": regex }];
  if (countryIds.length > 0) {
    $or.push({ "location.country": { $in: countryIds } });
  }

  return Destination.find({ $or }).select("-reviews -__v").lean();
};

const getDestinationsByRating = async (): Promise<any[]> => {
  return Destination.find()
    .sort({ averageRating: -1 })
    .select("-reviews -__v")
    .lean();
};

const getDestinationsByMinRating = async (
  rawMinRating: string,
): Promise<any[]> => {
  const minRating = parseFloat(rawMinRating);
  if (isNaN(minRating) || minRating < 0 || minRating > 5) {
    throw new AppError("minRating must be a number between 0 and 5", 400);
  }

  return Destination.find({
    averageRating: { $gte: minRating },
  })
    .select("-reviews -__v")
    .lean();
};

const getDestinationsByCategory = async (
  rawCategory: string,
): Promise<{ category: Category; destinations: any[] }> => {
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
    .select("-reviews -__v")
    .lean();

  return { category, destinations };
};

const getContinentStats = async (): Promise<ContinentStat[]> => {
  return Destination.aggregate([
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
  ]);
};

const getCountriesByContinent = async (
  rawContinent: string,
): Promise<{ continent: string; countries: CountryStat[] }> => {
  const continentParam = decodeURIComponent(rawContinent).trim();
  const continentRegex = new RegExp(`^${escapeRegex(continentParam)}$`, "i");

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
    ({ country, destinationCount, averageRating }) => ({
      country,
      destinationCount,
      averageRating,
    }),
  );

  return { continent: canonicalContinent, countries };
};

const getDestinationByName = async (rawName: string): Promise<any> => {
  const nameParam = decodeURIComponent(rawName).trim();
  const regex = new RegExp(`^${escapeRegex(nameParam)}$`, "i");

  const destination = await Destination.findOne({
    $or: [{ name: regex }, { slug: nameParam.toLowerCase() }],
  })
    .populate({
      path: "location.country",
      select: "name slug",
      populate: { path: "continent", select: "name slug" },
    })
    .lean();

  if (!destination) {
    throw new AppError("Destination not found", 404);
  }

  const countryObj = destination.location?.country as any;
  const countryName =
    typeof countryObj === "object" && countryObj?.name
      ? countryObj.name
      : countryObj;
  const continentName =
    typeof countryObj === "object" && countryObj?.continent?.name
      ? countryObj.continent.name
      : (destination as any).continent || "";

  return {
    ...destination,
    location: {
      city: destination.location?.city,
      country: countryName,
      countrySlug: countryObj?.slug ?? null,
    },
    continent: continentName,
    continentSlug: countryObj?.continent?.slug ?? null,
  };
};

/**
 * Canonical destination detail lookup.
 * Uses the compound unique index { "location.country": 1, slug: 1 } so it is
 * always unambiguous — even if two countries share an identically-named destination.
 */
const getDestinationBySlug = async (
  countrySlug: string,
  destinationSlug: string,
): Promise<any> => {
  const country = await Country.findOne({
    slug: countrySlug.toLowerCase(),
  })
    .select("_id name slug continent")
    .populate<{ continent: { _id: any; name: string; slug: string } }>(
      "continent",
      "name slug",
    )
    .lean();

  if (!country) {
    throw new AppError(`Country '${countrySlug}' not found`, 404);
  }

  const destination = await Destination.findOne({
    slug: destinationSlug.toLowerCase(),
    "location.country": country._id,
  })
    .select("-__v")
    .lean();

  if (!destination) {
    throw new AppError(
      `Destination '${destinationSlug}' not found in '${country.name}'`,
      404,
    );
  }

  const continent = country.continent as any;

  return {
    ...destination,
    location: {
      city: destination.location?.city,
      country: country.name,
      countrySlug: country.slug,
    },
    continent: continent?.name ?? null,
    continentSlug: continent?.slug ?? null,
  };
};

const createDestination = async (data: CreateDestinationInput) => {
  const existingDest = await Destination.findOne({ name: data.name });
  if (existingDest) {
    throw new AppError("Destination with this name already exists", 409);
  }

  const countryRegex = new RegExp(
    `^${escapeRegex(data.location.country)}$`,
    "i",
  );
  const country = await Country.findOne({ name: countryRegex });
  if (!country) {
    throw new AppError(`Country '${data.location.country}' not found`, 404);
  }

  const payload: any = {
    name: data.name,
    description: data.description,
    location: {
      city: data.location.city,
      country: country._id,
    },
    category: data.category,
  };

  if (data.bestTimeToVisit) payload.bestTimeToVisit = data.bestTimeToVisit;
  if (data.images && data.images.length > 0) payload.imageUrls = data.images;

  const newDest = await Destination.create(payload);
  const { __v, ...rest } = newDest.toObject();
  return rest;
};

const updateDestination = async (id: string, data: UpdateDestinationInput) => {
  const updatePayload: Record<string, unknown> = {};

  if (data.name !== undefined) {
    const existing = await Destination.findOne({
      name: data.name,
      _id: { $ne: id },
    });
    if (existing)
      throw new AppError("Destination with this name already exists", 409);
    updatePayload.name = data.name;
  }
  if (data.description !== undefined)
    updatePayload.description = data.description;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.bestTimeToVisit !== undefined)
    updatePayload.bestTimeToVisit = data.bestTimeToVisit;
  if (data.images !== undefined) updatePayload.imageUrls = data.images;

  if (data.location?.city !== undefined)
    updatePayload["location.city"] = data.location.city;
  if (data.location?.country !== undefined) {
    const countryRegex = new RegExp(
      `^${escapeRegex(data.location.country)}$`,
      "i",
    );
    const country = await Country.findOne({ name: countryRegex });
    if (!country)
      throw new AppError(`Country '${data.location.country}' not found`, 404);
    updatePayload["location.country"] = country._id;
  }

  const updatedDest = await Destination.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true },
  )
    .select("-__v")
    .lean();

  if (!updatedDest) {
    throw new AppError("Destination not found", 404);
  }

  return updatedDest;
};

const deleteDestination = async (id: string) => {
  const deletedDest = await Destination.findByIdAndDelete(id)
    .select("-__v")
    .lean();
  if (!deletedDest) {
    throw new AppError("Destination not found", 404);
  }

  await Review.deleteMany({ destination: deletedDest._id });

  return deletedDest;
};

export default {
  getPaginatedDestinations,
  searchDestinations,
  getDestinationsByLocation,
  getDestinationsByRating,
  getDestinationsByMinRating,
  getDestinationsByCategory,
  getContinentStats,
  getCountriesByContinent,
  getDestinationByName,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
};
