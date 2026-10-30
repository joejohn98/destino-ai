import { Destination, Review, User } from "../models";
import { isValidObjectId } from "../utils/validation";
import { AppError } from "../utils/AppError";
import type { UpdateProfileInput } from "../validators/user.validators";

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

const toIdStrings = (ids: unknown[]) => ids.map((id) => String(id));

const getFavorites = async (userId: string, page: number, limit: number) => {
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
    .populate({
      path: "location.country",
      select: "slug name",
      populate: { path: "continent", select: "slug name" },
    })
    .lean();

  const byId = new Map(destinations.map((d: any) => [String(d._id), d]));

  // Same flattened shape as the paginated destinations list.
  const data = pageIds.flatMap((id) => {
    const d: any = byId.get(id);
    if (!d) return [];
    const country = d.location?.country;
    const continent = country?.continent;
    return [
      {
        ...d,
        location: {
          city: d.location?.city,
          country: country?.name ?? country,
          countrySlug: country?.slug ?? null,
        },
        continent: continent?.name ?? null,
        continentSlug: continent?.slug ?? null,
      },
    ];
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

export default {
  getProfile,
  updateProfile,
  deleteProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
};
