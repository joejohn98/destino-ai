import { Continent, IContinent, ICountry } from "../models";
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
  const newContinent = await Continent.create(continentData);

  return newContinent;
};

export default {
  getAllContinents,
  getContinent,
  createContinent,
};
