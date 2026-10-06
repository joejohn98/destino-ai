import {
  Continent,
  Country,
  Destination,
  IContinent,
  ICountry,
  Review,
} from "../models";
import { AppError } from "../utils/AppError";

export interface CreateContinentInput {
  name: string;
  slug?: string;
  description?: string;
  image: string;
}

const getAllContinents = async () => {
  const continents = await Continent.find()
    .select("-_v")
    .populate({
      path: "countries",
      select: "_id name slug",
      populate: {
        path: "destinations",
        select: "_id name",
      },
    })
    .lean();

  if (!continents || continents.length === 0) {
    throw new AppError("No continents found", 404);
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
  const { name } = continentData;

  // Check if continent with this name already exists
  const existingContinent = await Continent.findOne({ name });
  if (existingContinent) {
    throw new AppError(`Continent "${name}" already exists`, 400);
  }

  // Create new continent
  const newContinent = await Continent.create(continentData);

  return newContinent;
};

const updateContinent = async (
  slug: string,
  updateData: CreateContinentInput,
) => {
  // Find continent by slug
  const continent = await Continent.findOne({ slug });
  if (!continent) {
    throw new AppError("No continent found with that slug", 404);
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
  if (updateData.description) continent.description = updateData.description;
  if (updateData.image) continent.image = updateData.image;

  // Save changes
  await continent.save();

  return continent;
};

const deleteContinent = async (slug: string) => {
  const continent = await Continent.findOne({ slug });
  if (!continent) {
    throw new AppError("No continent found with that slug", 404);
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

  // 3. Cascade delete reviews, destinations, and countries
  if (destinationIds.length > 0) {
    await Review.deleteMany({ destination: { $in: destinationIds } });
    await Destination.deleteMany({ _id: { $in: destinationIds } });
  }

  if (countryIds.length > 0) {
    await Country.deleteMany({ _id: { $in: countryIds } });
  }

  // 4. Delete the continent itself
  await Continent.findByIdAndDelete(continent._id);

  return continent;
};

export default {
  getAllContinents,
  getContinent,
  createContinent,
  updateContinent,
  deleteContinent,
};
