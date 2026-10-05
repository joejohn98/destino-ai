import { User } from "../models";
import { AppError } from "../utils/AppError";
import { Response } from "express";
import { createSendToken } from "../utils/utils";

const register = async (
  email: string,
  username: string,
  password: string,
  res: Response
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
    email,
    username,
    password,
  });

  // Save user to database before issuing token and setting cookie
  await newUser.save();

  const token = createSendToken(newUser, res);

  const { password: _, __v, ...userData } = newUser.toObject();

  return {
    user: userData,
    token,
  };
};

export default {
  register,
};

