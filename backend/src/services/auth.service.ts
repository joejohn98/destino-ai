import { User } from "../models";
import { AppError } from "../utils/AppError";
import { Response } from "express";
import { createSendToken } from "../utils/utils";

const register = async (
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
  res: Response,
) => {
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

  const _token = createSendToken(newUser, res);

  const { password: _, __v, ...userData } = newUser.toObject();

  return {
    user: userData,
  };
};

const login = async (email: string, password: string, res: Response) => {
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

  // Create token
  const _token = createSendToken(user, res);

  const { password: _, __v, ...userData } = user.toObject();

  return {
    user: userData,
  };
};

const logout = async (res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });

  return {
    message: "Logged out successfully",
  };
};

export default {
  register,
  login,
  logout,
};
