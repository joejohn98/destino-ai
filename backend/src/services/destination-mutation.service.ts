import type { Types } from "mongoose";
import slugify from "slugify";
import { Destination } from "../models/Destination.model";
import { Country } from "../models/Country.model";
import { Review, User } from "../models";
import aiService from "./ai.service";
import { AppError } from "../utils/AppError";
import { escapeRegex, isValidObjectId } from "../utils/validation";
import {
  CACHE_KEYS,
  DEST_LISTING_PATTERN,
  invalidateKeys,
  invalidatePattern,
} from "../utils/cache";
import { withMongoTransaction } from "../utils/mongo-transactions";
import type {
  CreateDestinationInput,
  UpdateDestinationInput,
} from "../validators/destination.validators";

export const resolveCountry = async (countryIdentifier: string) => {
  if (isValidObjectId(countryIdentifier)) {
    const countryById = await Country.findById(countryIdentifier);
    if (countryById) return countryById;
  }
  const countryRegex = new RegExp(`^${escapeRegex(countryIdentifier)}$`, "i");
  return Country.findOne({ name: countryRegex });
};

export const createDestination = async (data: CreateDestinationInput) => {
  const country = await resolveCountry(data.location.country);
  if (!country) {
    throw new AppError(`Country '${data.location.country}' not found`, 404);
  }

  const slug = slugify(data.name, { lower: true, strict: true });
  const existingDest = await Destination.findOne({
    "location.country": country._id,
    slug,
  });
  if (existingDest) {
    throw new AppError(
      "Destination with this name already exists in this country",
      409,
    );
  }

  const payload = {
    name: data.name,
    description: data.description,
    location: {
      city: data.location.city,
      ...(data.location.state ? { state: data.location.state } : {}),
      country: country._id,
    },
    category: data.category,
    ...(data.bestTimeToVisit ? { bestTimeToVisit: data.bestTimeToVisit } : {}),
    ...(data.images?.length ? { imageUrls: data.images } : {}),
    ...(data.attractions?.length
      ? {
          attractions: data.attractions.map((attraction) => ({
            name: attraction.name,
            ...(attraction.description !== undefined
              ? { description: attraction.description }
              : {}),
            ...(attraction.ticketPrice !== undefined
              ? { ticketPrice: attraction.ticketPrice }
              : {}),
            ...(attraction.suggestedDuration !== undefined
              ? { suggestedDuration: attraction.suggestedDuration }
              : {}),
            ...(attraction.openingHours !== undefined
              ? { openingHours: attraction.openingHours }
              : {}),
            ...(attraction.category !== undefined
              ? { category: attraction.category }
              : {}),
          })),
        }
      : {}),
  };

  const newDest = await Destination.create(payload);
  const { __v: _v, ...rest } = newDest.toObject();

  // Pre-generate AI travel tips in background on destination creation
  aiService.generateDestinationTips(newDest._id.toString()).catch((err) => {
    console.warn(
      `[createDestination] Background tips generation failed for ${newDest._id}:`,
      err,
    );
  });

  // A new destination changes listing pages, country destinations, and continent/country counts
  await invalidateKeys(
    CACHE_KEYS.continentStats,
    CACHE_KEYS.continentAdminList,
    CACHE_KEYS.countryDestinations(country.slug),
  );
  await invalidatePattern(DEST_LISTING_PATTERN);

  return rest;
};

export const updateDestination = async (
  id: string,
  data: UpdateDestinationInput,
) => {
  const previousDestination = await Destination.findById(id)
    .select("slug location.country")
    .populate<{
      location: {
        country: { _id: Types.ObjectId; slug: string } | null;
      };
    }>("location.country", "_id slug")
    .lean();

  if (!previousDestination) {
    throw new AppError("Destination not found", 404);
  }

  const previousCountry = previousDestination.location?.country;
  if (!previousCountry) {
    throw new AppError("Destination country not found", 404);
  }
  const previousCountrySlug = previousCountry.slug;
  let targetCountryId: Types.ObjectId = previousCountry._id;

  const updatePayload: Record<string, unknown> = {};

  if (data.location?.country !== undefined) {
    const country = await resolveCountry(data.location.country);
    if (!country) {
      throw new AppError(`Country '${data.location.country}' not found`, 404);
    }
    targetCountryId = country._id;
    updatePayload["location.country"] = country._id;
  }

  if (data.name !== undefined) {
    const targetSlug = slugify(data.name, { lower: true, strict: true });
    const existing = await Destination.findOne({
      "location.country": targetCountryId,
      slug: targetSlug,
      _id: { $ne: id },
    });
    if (existing) {
      throw new AppError(
        "Destination with this name already exists in this country",
        409,
      );
    }
    updatePayload.name = data.name;
  } else if (data.location?.country !== undefined && targetCountryId) {
    const existing = await Destination.findOne({
      "location.country": targetCountryId,
      slug: previousDestination.slug,
      _id: { $ne: id },
    });
    if (existing) {
      throw new AppError(
        "Destination with this name already exists in this country",
        409,
      );
    }
  }

  if (data.description !== undefined) {
    updatePayload.description = data.description;
  }
  if (data.category !== undefined) {
    updatePayload.category = data.category;
  }
  if (data.bestTimeToVisit !== undefined) {
    updatePayload.bestTimeToVisit = data.bestTimeToVisit;
  }
  if (data.images !== undefined) {
    updatePayload.imageUrls = data.images;
  }
  if (data.attractions !== undefined) {
    updatePayload.attractions = data.attractions;
  }

  if (data.location?.city !== undefined) {
    updatePayload["location.city"] = data.location.city;
  }
  if (data.location?.state !== undefined) {
    updatePayload["location.state"] = data.location.state;
  }

  const contextChanged =
    data.name !== undefined ||
    data.category !== undefined ||
    data.bestTimeToVisit !== undefined ||
    data.location?.city !== undefined ||
    data.location?.country !== undefined;

  const updatedDest = await Destination.findByIdAndUpdate(
    id,
    {
      $set: updatePayload,
      ...(contextChanged
        ? { $unset: { travelTips: 1, travelTipsContextHash: 1 } }
        : {}),
    },
    { returnDocument: "after", runValidators: true },
  )
    .select("-__v")
    .lean();

  if (!updatedDest) {
    throw new AppError("Destination not found", 404);
  }

  // Resolve country slug to build the exact detail cache key
  const updatedCountry = await Country.findById(updatedDest.location?.country)
    .select("slug")
    .lean();

  // Invalidate cache entries for both the previous and updated route locations.
  const keysToInvalidate = new Set<string>([
    CACHE_KEYS.continentStats,
    CACHE_KEYS.continentAdminList,
    ...(previousCountrySlug
      ? [CACHE_KEYS.countryDestinations(previousCountrySlug)]
      : []),
    ...(previousCountrySlug && previousDestination.slug
      ? [CACHE_KEYS.destBySlug(previousCountrySlug, previousDestination.slug)]
      : []),
  ]);

  if (updatedCountry?.slug) {
    keysToInvalidate.add(CACHE_KEYS.countryDestinations(updatedCountry.slug));
    if (updatedDest.slug) {
      keysToInvalidate.add(
        CACHE_KEYS.destBySlug(updatedCountry.slug, updatedDest.slug),
      );
    }
  }
  await invalidateKeys(...keysToInvalidate);
  await invalidatePattern(DEST_LISTING_PATTERN);

  // Pre-generate AI travel tips if relevant context changed
  if (contextChanged) {
    aiService.generateDestinationTips(id).catch((err) => {
      console.warn(
        `[updateDestination] Background tips generation failed for ${id}:`,
        err,
      );
    });
  }

  return updatedDest;
};

export const deleteDestination = async (id: string) => {
  const deletedDest = await withMongoTransaction(async (session) => {
    const destination = await Destination.findById(id).session(session);
    if (!destination) {
      throw new AppError("Destination not found", 404);
    }

    await Review.deleteMany({ destination: destination._id }, { session });
    await User.updateMany(
      { favoriteDestinations: destination._id },
      { $pull: { favoriteDestinations: destination._id } },
      { session },
    );

    const deleted = await Destination.findByIdAndDelete(id, { session });
    if (!deleted) {
      throw new AppError("Failed to delete destination", 500);
    }

    return deleted;
  });

  // Resolve country slug to build the exact detail cache key
  const deletedCountry = await Country.findById(deletedDest.location?.country)
    .select("slug")
    .lean();

  // A deleted destination changes the listing, country destinations, continent/country counts, and its own detail page
  const keysToInvalidate: string[] = [
    CACHE_KEYS.continentStats,
    CACHE_KEYS.continentAdminList,
  ];
  if (deletedCountry?.slug) {
    keysToInvalidate.push(CACHE_KEYS.countryDestinations(deletedCountry.slug));
    if (deletedDest.slug) {
      keysToInvalidate.push(
        CACHE_KEYS.destBySlug(deletedCountry.slug, deletedDest.slug),
      );
    }
  }
  await invalidateKeys(...keysToInvalidate);
  await invalidatePattern(DEST_LISTING_PATTERN);

  return deletedDest;
};
