import { Continent, Country, Destination, Review } from "../models";
import { AppError } from "../utils/AppError";

interface CreateCountryInput {
  name?: string;
  description?: string;
  image?: string;
  continent?: string;
}

const getAllCountries = async () => {
  const countries = await Country.find()
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

const getCountry = async (slug: string) => {
  const country = await Country.findOne({ slug })
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

const createCountry = async (countryData: {
  name: string;
  description?: string;
  image: string;
  continent: string;
}) => {
  const { name, continent } = countryData;

  const existingContinent = await Continent.findById(continent);
  if (!existingContinent) {
    throw new AppError("Continent not found with that ID", 404);
  }

  const existingCountry = await Country.findOne({ name });

  if (existingCountry) {
    throw new AppError("Country with this name already exists", 400);
  }

  const newCountry = await Country.create(countryData);
  return newCountry;
};

const updateCountry = async (id: string, updateData: CreateCountryInput) => {
  // Find country by ID
  const country = await Country.findById(id);
  if (!country) {
    throw new AppError("No country found with that ID", 404);
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

  // Validate continent if updating continent
  if (updateData.continent) {
    const existingContinent = await Continent.findById(updateData.continent);
    if (!existingContinent) {
      throw new AppError("Continent not found with that ID", 404);
    }
    country.continent = updateData.continent as any;
  }

  // Update fields
  if (updateData.name) country.name = updateData.name;
  if (updateData.description !== undefined)
    country.description = updateData.description;
  if (updateData.image) country.image = updateData.image;

  // Save changes
  await country.save();

  return country;
};

const deleteCountry = async (id: string) => {
  // Find country by ID
  const country = await Country.findById(id);
  if (!country) {
    throw new AppError("Country not found", 404);
  }

  // Cascade delete destinations
  const destinations = await Destination.find({ "location.country": id });

  if (destinations.length > 0) {
    const destinationIds = destinations.map((d) => d._id);
    await Review.deleteMany({ destination: { $in: destinationIds } });
    await Destination.deleteMany({ _id: { $in: destinationIds } });
  }

  // Delete the country
  const deletedCountry = await Country.findByIdAndDelete(id);

  return deletedCountry;
};

export default {
  getAllCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
};
