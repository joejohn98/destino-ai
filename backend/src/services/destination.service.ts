import { Destination } from "../models/Destination.model";
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


export default {
  getPaginatedDestinations,
  searchDestinations,
};