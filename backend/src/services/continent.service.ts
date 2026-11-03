import mongoose from "mongoose";
import {
  Continent,
  Country,
  Destination,
  IContinent,
  ICountry,
  Review,
} from "../models";
import { AppError } from "../utils/AppError";
import { CACHE_KEYS, invalidateKeys, invalidatePattern } from "../utils/cache";
import {
  CreateContinentInput,
  UpdateContinentInput,
} from "../validators/continent.validators";

const getAllContinents = async () => {
  const continents = await Continent.find()
    .select("-__v")
    .populate({
      path: "countries",
      select: "_id name slug",
      populate: {
        path: "destinations",
        select: "_id name",
      },
    })
    .lean();

  if (!continents) {
    return [];
  }

  const data = continents.map((continent: IContinent) => ({
    ...continent,
    countryCount: continent.countries ? continent.countries.length : 0,
    destinationCount: continent.countries
      ? continent.countries.reduce(
          (acc: number, country: ICountry) =>
            acc + (country.destinations?.length || 0),
          0,
        )
      : 0,
  }));

  return data;
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

  await invalidateKeys(CACHE_KEYS.continentStats);
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

  await invalidateKeys(CACHE_KEYS.continentStats);
  await invalidatePattern("agg:continent:*");

  return continent;
};

const deleteContinent = async (id: string) => {
  const continent = await Continent.findById(id);
  if (!continent) {
    throw new AppError("No continent found with that ID", 404);
  }

  // 1. Find all countries in this continent
  const countries = await Country.find({ continent: continent._id })
    .select("_id")
    .lean();
  const countryIds = countries.map((c) => c._id);

  // 2. Find all destinations in those countries
  const destinations = await Destination.find({
    "location.country": { $in: countryIds },
  })
    .select("_id")
    .lean();
  const destinationIds = destinations.map((d) => d._id);

  // 3. Cascade delete in transaction with standalone fallback
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (destinationIds.length > 0) {
        await Review.deleteMany({ destination: { $in: destinationIds } }, { session });
        await Destination.deleteMany({ _id: { $in: destinationIds } }, { session });
      }

      if (countryIds.length > 0) {
        await Country.deleteMany({ _id: { $in: countryIds } }, { session });
      }

      await Continent.findByIdAndDelete(continent._id, { session });
    });
  } catch (error: any) {
    if (error?.message?.includes("replica set")) {
      if (destinationIds.length > 0) {
        await Review.deleteMany({ destination: { $in: destinationIds } });
        await Destination.deleteMany({ _id: { $in: destinationIds } });
      }

      if (countryIds.length > 0) {
        await Country.deleteMany({ _id: { $in: countryIds } });
      }

      await Continent.findByIdAndDelete(continent._id);
    } else {
      throw error;
    }
  } finally {
    await session.endSession();
  }

  await invalidateKeys(CACHE_KEYS.continentStats);
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
