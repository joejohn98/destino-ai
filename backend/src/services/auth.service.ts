import { IUser, User } from "../models";
import { AppError } from "../utils/AppError";

export interface SocialProfile {
  provider: "google" | "github";
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | undefined;
}

const register = async (
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
): Promise<IUser> => {
  // Check if user with email or username already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError("User with this email already exists", 400);
    }
    throw new AppError("User with this username already exists", 400);
  }

  const newUser = new User({
    firstName,
    lastName,
    email,
    username,
    password,
  });

  // Save user to database before issuing token and setting cookie
  await newUser.save();
  return newUser;
};

const login = async (email: string, password: string): Promise<IUser> => {
  // Check if user with email exists
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if password is correct
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  await User.findOneAndUpdate(
    { _id: user._id, reviewCount: { $exists: false } },
    { $set: { reviewCount: 0 } },
  );

  return user;
};

const findOrCreateSocialUser = async (
  profile: SocialProfile,
): Promise<IUser> => {
  // 1. Check if user already exists with this specific social provider
  let user = await User.findOne({
    "authProviders.provider": profile.provider,
    "authProviders.providerId": profile.providerId,
  });
  if (user) {
    return user;
  }
  // 2. Check if a user with this email already exists (Account Linking)
  user = await User.findOne({ email: profile.email.toLowerCase() });
  if (user) {
    // Link this provider to the existing account
    user.authProviders.push({
      provider: profile.provider,
      providerId: profile.providerId,
    });
    if (!user.avatarUrl && profile.avatarUrl) {
      user.avatarUrl = profile.avatarUrl;
    }
    await user.save();
    return user;
  }
  // 3. User does not exist: create unique username fallback
  let baseUsername = (profile.email.split("@")[0] || "user")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);

  let username = baseUsername;
  let counter = 1;
  while (await User.exists({ username })) {
    username = `${baseUsername}${counter++}`;
  }
  // 4. Create new User document (password is optional when authProviders is populated)
  user = await User.create({
    firstName: profile.firstName || "Traveler",
    lastName: profile.lastName || "User",
    username,
    email: profile.email.toLowerCase(),
    ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
    authProviders: [
      {
        provider: profile.provider,
        providerId: profile.providerId,
      },
    ],
  });
  return user;
};

export default {
  register,
  login,
  findOrCreateSocialUser,
};
