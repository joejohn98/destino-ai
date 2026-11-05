import { Destination, Review, User } from "../models";
import { isValidObjectId } from "../utils/validation";
import { AppError } from "../utils/AppError";
import type { UpdateProfileInput } from "../validators/user.validators";
import type { PaginationQuery } from "../validators/query.validators";
import type { DestinationCardRecord } from "../dto/destination.dto";
import { toDestinationCardDTO } from "../dto/destination.dto";
import type { FavoritesPageDTO, MyReviewsPageDTO } from "../dto/user.dto";

const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const updateProfile = async (
  userId: string,
  profileData: UpdateProfileInput,
) => {
  if (profileData.email) {
    const existingUser = await User.findOne({
      email: profileData.email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new AppError("Email is already in use", 409);
    }
  }

  const user = await User.findByIdAndUpdate(userId, profileData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const deleteProfile = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await Review.updateMany(
    { user: user._id },
    {
      $set: {
        user: null,
        authorName: "Deleted user",
      },
    },
  );

  await User.findByIdAndDelete(user._id);
};

const assertValidDestinationId = (destinationId: string) => {
  if (!isValidObjectId(destinationId)) {
    throw new AppError("Invalid destination id", 400);
  }
};

const toIdStrings = (ids: readonly { toString(): string }[]) =>
  ids.map((id) => id.toString());

const getFavorites = async (
  userId: string,
  { page, limit }: PaginationQuery,
): Promise<FavoritesPageDTO> => {
  const user = await User.findById(userId).select("favoriteDestinations").lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Newest favorite first. Ids whose destination was deleted are skipped.
  const savedIds = toIdStrings(user.favoriteDestinations ?? []).reverse();
  const liveIds = new Set(
    toIdStrings(
      await Destination.find({ _id: { $in: savedIds } })
        .select("_id")
        .lean()
        .then((docs) => docs.map((doc) => doc._id)),
    ),
  );
  const orderedIds = savedIds.filter((id) => liveIds.has(id));

  const total = orderedIds.length;
  const pageIds = orderedIds.slice((page - 1) * limit, page * limit);

  const destinations = await Destination.find({ _id: { $in: pageIds } })
    .select("-reviews -__v")
    .populate<{ location: DestinationCardRecord["location"] }>({
      path: "location.country",
      select: "slug name",
      populate: { path: "continent", select: "slug name" },
    })
    .lean<DestinationCardRecord[]>();

  const byId = new Map(destinations.map((destination) => [String(destination._id), destination]));

  // Same flattened shape as the paginated destinations list.
  const data = pageIds.flatMap((id) => {
    const destination = byId.get(id);
    return destination ? [toDestinationCardDTO(destination)] : [];
  });

  return {
    data,
    totalFavorites: total,
    totalPages: Math.ceil(total / limit) || 0,
    currentPage: page,
  };
};

const addFavorite = async (userId: string, destinationId: string) => {
  assertValidDestinationId(destinationId);

  if (!(await Destination.exists({ _id: destinationId }))) {
    throw new AppError("Destination not found", 404);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favoriteDestinations: destinationId } },
    { new: true },
  )
    .select("favoriteDestinations")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toIdStrings(user.favoriteDestinations ?? []);
};

const removeFavorite = async (userId: string, destinationId: string) => {
  assertValidDestinationId(destinationId);

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favoriteDestinations: destinationId } },
    { new: true },
  )
    .select("favoriteDestinations")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toIdStrings(user.favoriteDestinations ?? []);
};

const getMyReviews = async (
  userId: string,
  { page, limit }: PaginationQuery,
): Promise<MyReviewsPageDTO> => {
  const totalReviews = await Review.countDocuments({ user: userId });

  type CountrySummary = { name: string; slug: string };
  type ReviewDestination = {
    _id: { toString(): string };
    name: string;
    slug: string;
    location?: {
      city?: string;
      country: CountrySummary | null;
    };
  };

  const reviews = await Review.find({ user: userId })
    .select("destination rating reviewText sentiment themes createdAt updatedAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-__v")
    .populate<{ destination: ReviewDestination | null }>({
      path: "destination",
      select: "name slug location",
    })
    .populate<{ destination: ReviewDestination | null }>(
      "destination.location.country",
      "name slug",
    )
    .lean();

  const data = reviews.map((review) => {
    const destination = review.destination;
    const country = destination?.location?.country;
    return {
      _id: review._id.toString(),
      rating: review.rating,
      reviewText: review.reviewText,
      ...(review.sentiment ? { sentiment: review.sentiment } : {}),
      themes: review.themes,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      destination: {
        _id: destination?._id.toString() ?? null,
        name: destination?.name ?? "Deleted destination",
        slug: destination?.slug ?? null,
        countryName: country?.name ?? null,
        countrySlug: country?.slug ?? null,
      },
    };
  });

  return {
    data,
    totalReviews,
    totalPages: Math.ceil(totalReviews / limit) || 0,
    currentPage: page,
  };
};

export default {
  getProfile,
  updateProfile,
  deleteProfile,
  getMyReviews,
  getFavorites,
  addFavorite,
  removeFavorite,
};
