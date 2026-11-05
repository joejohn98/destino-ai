import { Continent, Country, Destination, Review, User } from "../models";
import { AppError } from "../utils/AppError";
import { CACHE_KEYS, invalidateKeys, invalidatePattern } from "../utils/cache";
import { withMongoTransaction } from "../utils/mongo-transactions";
import { isValidObjectId } from "../utils/validation";
import type {
  CreateCountryInput,
  UpdateCountryInput,
} from "../validators/country.validators";

const resolveContinent = async (continentIdOrSlug: string) => {
  if (!continentIdOrSlug) {
    throw new AppError("Continent identifier is required", 400);
  }
  const query = isValidObjectId(continentIdOrSlug)
    ? { _id: continentIdOrSlug }
    : { slug: continentIdOrSlug.toLowerCase() };

  const continent = await Continent.findOne(query);
  if (!continent) {
    throw new AppError("Continent not found", 404);
  }
  return continent;
};

const getAllCountries = async (continentIdOrSlug: string) => {
  const continent = await resolveContinent(continentIdOrSlug);

  const countries = await Country.find({ continent: continent._id })
    .select("-__v")
    .populate({
      path: "continent",
      select: "_id name slug",
    })
    .populate({
      path: "destinations",
      select: "_id name slug",
      options: { limit: 100 },
    })
    .lean();

  return countries;
};

const getCountry = async (continentIdOrSlug: string, slug: string) => {
  const continent = await resolveContinent(continentIdOrSlug);

  const country = await Country.findOne({
    slug: slug.toLowerCase(),
    continent: continent._id,
  })
    .populate({
      path: "destinations",
      select: "-__v",
      options: { limit: 100 },
    })
    .populate({
      path: "continent",
      select: "_id name slug",
    })
    .lean();

  if (!country) {
    throw new AppError("No country found with that slug", 404);
  }
  return country;
};

const createCountry = async (
  continentIdOrSlug: string,
  countryData: CreateCountryInput,
) => {
  const { name, description, imageUrl } = countryData;

  const continent = await resolveContinent(continentIdOrSlug);

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

  // A new country changes both continent stats and the per-continent country list
  await invalidateKeys(
    CACHE_KEYS.continentStats,
    CACHE_KEYS.continentAdminList,
    CACHE_KEYS.continentCountries(continent.slug),
  );

  return newCountry;
};

const updateCountry = async (id: string, updateData: UpdateCountryInput) => {
  const country = await Country.findById(id).populate<{ continent: { slug: string } }>("continent", "slug");
  if (!country) {
    throw new AppError("Country not found", 404);
  }
  const previousCountrySlug = country.slug;
  const continentSlug = country.continent?.slug;

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

  const countrySlugs = new Set([previousCountrySlug, country.slug]);
  const keys = new Set<string>([
    CACHE_KEYS.continentStats,
    CACHE_KEYS.continentAdminList,
  ]);
  if (continentSlug) {
    keys.add(CACHE_KEYS.continentCountries(continentSlug));
  }
  for (const slug of countrySlugs) {
    keys.add(CACHE_KEYS.countryDestinations(slug));
  }

  await invalidateKeys(...keys);
  await Promise.all(
    Array.from(countrySlugs, (slug) =>
      invalidatePattern(CACHE_KEYS.destByCountryPattern(slug)),
    ),
  );
  await invalidatePattern("api:dest:paginated:*");

  return country;
};

const deleteCountry = async (id: string) => {
  const country = await Country.findById(id).populate<{ continent: { slug: string } }>("continent", "slug");
  if (!country) {
    throw new AppError("Country not found", 404);
  }

  await withMongoTransaction(async (session) => {
    const destinations = await Destination.find({
      "location.country": country._id,
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

    const deletedCountry = await Country.findByIdAndDelete(country._id, {
      session,
    });
    if (!deletedCountry) {
      throw new AppError("Country not found", 404);
    }
  });

  const keys: string[] = [
    CACHE_KEYS.continentStats,
    CACHE_KEYS.continentAdminList,
  ];
  if (country.continent?.slug) {
    keys.push(CACHE_KEYS.continentCountries(country.continent.slug));
  }
  if (country.slug) {
    keys.push(CACHE_KEYS.countryDestinations(country.slug));
  }

  await invalidateKeys(...keys);
  await invalidatePattern("api:dest:*");

  return country;
};

export default {
  getAllCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
};
