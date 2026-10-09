import { Continent, Country, Destination, Review } from "../models";
import { AppError } from "../utils/AppError";
import type {
  CreateCountryInput,
  UpdateCountryInput,
} from "../validators/country.validators";

const getAllCountries = async (continentId: string) => {
  const countries = await Country.find({ continent: continentId })
    .select("-__v")
    .populate({
      path: "continent",
      select: "_id name",
    })
    .populate({
      path: "destinations",
      select: "_id name",
    })
    .lean();

  return countries;
};

const getCountry = async (continentId: string, slug: string) => {
  const country = await Country.findOne({ slug, continent: continentId })
    .populate({
      path: "destinations",
      select: "_id name",
    })
    .lean();

  if (!country) {
    throw new AppError("No country found with that slug", 404);
  }
  return country;
};

const createCountry = async (
  continentId: string,
  countryData: CreateCountryInput,
) => {
  const { name, description, imageUrl } = countryData;

  const continent = await Continent.findById(continentId);
  if (!continent) {
    throw new AppError("Continent not found with that ID", 404);
  }

  const existingCountry = await Country.findOne({ name });

  if (existingCountry) {
    throw new AppError("Country with this name already exists", 400);
  }

  if (!imageUrl) {
    throw new AppError("Image URL is required", 400);
  }

  const payload: {
    name: string;
    imageUrl: string;
    continent: typeof continent._id;
    description?: string;
  } = {
    name,
    imageUrl,
    continent: continent._id,
  };

  if (description) {
    payload.description = description;
  }

  const newCountry = await Country.create(payload);
  return newCountry;
};

const updateCountry = async (id: string, updateData: UpdateCountryInput) => {
  const country = await Country.findById(id);
  if (!country) {
    throw new AppError("Country not found", 404);
  }
  // Check if another country has the same name (if name is being updated)
  if (updateData.name && updateData.name !== country.name) {
    const existingCountry = await Country.findOne({
      name: updateData.name,
    });
    if (existingCountry) {
      throw new AppError("Another country with this name already exists", 400);
    }
  }

  // Update fields
  if (updateData.name) country.name = updateData.name;
  if (updateData.description !== undefined)
    country.description = updateData.description;
  if (updateData.imageUrl) country.imageUrl = updateData.imageUrl;

  // Save changes
  await country.save();

  return country;
};

const deleteCountry = async (id: string) => {
  const country = await Country.findById(id);
  if (!country) {
    throw new AppError("Country not found", 404);
  }

  // Cascade delete destinations
  const destinations = await Destination.find({
    "location.country": country._id,
  });

  if (destinations.length > 0) {
    const destinationIds = destinations.map((d) => d._id);
    await Review.deleteMany({ destination: { $in: destinationIds } });
    await Destination.deleteMany({ _id: { $in: destinationIds } });
  }

  // Delete the country
  const deletedCountry = await Country.findByIdAndDelete(country._id);

  return deletedCountry;
};

export default {
  getAllCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
};
