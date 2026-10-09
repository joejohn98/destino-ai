import { Review, User } from "../models";
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

export default { getProfile, updateProfile, deleteProfile };
