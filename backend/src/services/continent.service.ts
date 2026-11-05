import {
  Continent,
  Country,
  Destination,
  IDestination,
  IContinent,
  ICountry,
  Review,
  User,
} from "../models";
import { AppError } from "../utils/AppError";
import {
  CACHE_KEYS,
  CONTINENT_ADMIN_LIST_CACHE_TTL,
  invalidateKeys,
  invalidatePattern,
  withCache,
} from "../utils/cache";
import { withMongoTransaction } from "../utils/mongo-transactions";
import {
  CreateContinentInput,
  UpdateContinentInput,
} from "../validators/continent.validators";

interface ContinentAdminListItem {
  _id: IContinent["_id"];
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  countries: Array<{
    _id: ICountry["_id"];
    name: string;
    slug: string;
    destinations: Array<{ _id: IDestination["_id"]; name: string }>;
  }>;
  countryCount: number;
  destinationCount: number;
}

const getAllContinents = async (): Promise<ContinentAdminListItem[]> => {
  return withCache(
    CACHE_KEYS.continentAdminList,
    CONTINENT_ADMIN_LIST_CACHE_TTL,
    () =>
      Continent.aggregate<ContinentAdminListItem>([
        { $sort: { name: 1 } },
        {
          $lookup: {
            from: Country.collection.name,
            let: { continentId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$continent", "$$continentId"] } } },
              { $sort: { name: 1 } },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  slug: 1,
                },
              },
              {
                $lookup: {
                  from: Destination.collection.name,
                  let: { countryId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$location.country", "$$countryId"],
                        },
                      },
                    },
                    { $sort: { name: 1 } },
                    { $project: { _id: 1, name: 1 } },
                  ],
                  as: "destinations",
                },
              },
            ],
            as: "countries",
          },
        },
        {
          $addFields: {
            countryCount: { $size: "$countries" },
            destinationCount: {
              $sum: {
                $map: {
                  input: "$countries",
                  as: "country",
                  in: { $size: "$$country.destinations" },
                },
              },
            },
          },
        },
        { $project: { __v: 0 } },
      ]),
  );
};

const getContinent = async (slug: string) => {
  const continent = await Continent.findOne({ slug })
    .populate({
      path: "countries",
      select: "_id name slug",
      populate: {
        path: "destinations",
        select: "_id name",
      },
    })
    .lean();

  if (!continent) {
    throw new AppError("No continent found with that slug", 404);
  }
  // 1. Calculate overall counts for the continent
  const countryCount = continent.countries ? continent.countries.length : 0;
  const destinationCount = continent.countries
    ? continent.countries.reduce(
        (acc: number, country: ICountry) =>
          acc + (country.destinations?.length || 0),
        0,
      )
    : 0;

  // 2. Attach destinationCount to each nested country
  continent.countries?.forEach((country: ICountry) => {
    country.destinationCount = country.destinations?.length || 0;
  });

  return {
    ...continent,
    countryCount,
    destinationCount,
  };
};

const createContinent = async (continentData: CreateContinentInput) => {
  const { name, description, imageUrl } = continentData;

  if (!name || !imageUrl) {
    throw new AppError("Name and image URL are required", 400);
  }

  // Check if continent with this name already exists
  const existingContinent = await Continent.findOne({ name });
  if (existingContinent) {
    throw new AppError(`Continent "${name}" already exists`, 400);
  }

  const payload: { name: string; imageUrl: string; description?: string } = {
    name,
    imageUrl,
  };

  if (description) {
    payload.description = description;
  }

  // Create new continent
  const newContinent = await Continent.create(payload);

  await invalidateKeys(CACHE_KEYS.continentStats, CACHE_KEYS.continentAdminList);
  await invalidatePattern("agg:continent:*");

  return newContinent;
};

const updateContinent = async (
  id: string,
  updateData: UpdateContinentInput,
) => {
  // Find continent by slug
  const continent = await Continent.findById(id);
  if (!continent) {
    throw new AppError("No continent found with that ID", 404);
  }
  // Check if another continent has the same name (if name is being updated)
  if (updateData.name && updateData.name !== continent.name) {
    const existingContinent = await Continent.findOne({
      name: updateData.name,
    });
    if (existingContinent) {
      throw new AppError(
        "Another continent with this name already exists",
        400,
      );
    }
  }

  // Update fields
  if (updateData.name) continent.name = updateData.name;
  if (updateData.description !== undefined)
    continent.description = updateData.description;
  if (updateData.imageUrl) continent.imageUrl = updateData.imageUrl;

  // Save changes
  await continent.save();

  await invalidateKeys(CACHE_KEYS.continentStats, CACHE_KEYS.continentAdminList);
  await invalidatePattern("agg:continent:*");

  return continent;
};

const deleteContinent = async (id: string) => {
  const continent = await Continent.findById(id);
  if (!continent) {
    throw new AppError("No continent found with that ID", 404);
  }

  await withMongoTransaction(async (session) => {
    const countries = await Country.find({ continent: continent._id })
      .select("_id")
      .session(session)
      .lean();
    const countryIds = countries.map((country) => country._id);

    const destinations = await Destination.find({
      "location.country": { $in: countryIds },
    })
      .select("_id")
      .session(session)
      .lean();
    const destinationIds = destinations.map((destination) => destination._id);

    if (destinationIds.length > 0) {
      await Review.deleteMany(
        { destination: { $in: destinationIds } },
        { session },
      );
      await User.updateMany(
        { favoriteDestinations: { $in: destinationIds } },
        { $pull: { favoriteDestinations: { $in: destinationIds } } },
        { session },
      );
      await Destination.deleteMany(
        { _id: { $in: destinationIds } },
        { session },
      );
    }

    if (countryIds.length > 0) {
      await Country.deleteMany({ _id: { $in: countryIds } }, { session });
    }

    const deletedContinent = await Continent.findByIdAndDelete(continent._id, {
      session,
    });
    if (!deletedContinent) {
      throw new AppError("No continent found with that ID", 404);
    }
  });

  await invalidateKeys(CACHE_KEYS.continentStats, CACHE_KEYS.continentAdminList);
  await invalidatePattern("agg:continent:*");
  await invalidatePattern("api:dest:*");

  return continent;
};

export default {
  getAllContinents,
  getContinent,
  createContinent,
  updateContinent,
  deleteContinent,
};
