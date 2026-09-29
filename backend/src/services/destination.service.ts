import { Category, Destination } from "../models/Destination.model";
import { Country } from "../models/Country.model";
import { AppError } from "../utils/AppError";

const escapeRegex = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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


const getPaginatedDestinations = async (
  options: PaginatedOptions
): Promise<PaginatedResult> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(Math.max(1, options.limit || 12), 50);
  const skip = (page - 1) * limit;

  const [destinations, total] = await Promise.all([
    Destination.find().select("-reviews -__v").skip(skip).limit(limit).lean(),
    Destination.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit) || 0;

  return {
    destinations,
    totalDestinations: total,
    totalPages,
    currentPage: page,
  };
};

const searchDestinations = async (q: string): Promise<any[]> => {
  const trimmedQ = q.trim();
  if (!trimmedQ || trimmedQ.length < 2) {
    throw new AppError("Search query 'q' must be at least 2 characters long", 400);
  }

  const regex = new RegExp(escapeRegex(trimmedQ), "i");

  const matchingCountries = await Country.find({ name: regex }).select("_id").lean();
  const countryIds = matchingCountries.map((c) => c._id);

  const $or: any[] = [
    { name: regex },
    { description: regex },
    { "location.city": regex },
  ];

  if (countryIds.length > 0) {
    $or.push({ "location.country": { $in: countryIds } });
  }

  return Destination.find({ $or })
    .select("-reviews -__v")
    .lean();
};

const getDestinationsByLocation = async (rawLocation: string): Promise<any[]> => {
  const locParam = decodeURIComponent(rawLocation).trim();
  const regex = new RegExp(escapeRegex(locParam), "i");

  const matchingCountries = await Country.find({ name: regex }).select("_id").lean();
  const countryIds = matchingCountries.map((c) => c._id);

  const $or: any[] = [{ "location.city": regex }];
  if (countryIds.length > 0) {
    $or.push({ "location.country": { $in: countryIds } });
  }

  return Destination.find({ $or })
    .select("-reviews -__v")
    .lean();
};

const getDestinationsByRating = async (): Promise<any[]> => {
  return Destination.find()
    .sort({ averageRating: -1 })
    .select("-reviews -__v")
    .lean();
};


const getDestinationsByMinRating = async (rawMinRating: string): Promise<any[]> => {
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
  rawCategory: string
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
      400
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


export default {
  getPaginatedDestinations,
  searchDestinations,
  getDestinationsByLocation,
  getDestinationsByRating,
  getDestinationsByMinRating,
  getDestinationsByCategory,
  getContinentStats,
};