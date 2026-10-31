import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  authProviders: {
    provider: "google" | "github";
    providerId: string;
  }[];
  role: "user" | "admin";
  avatarUrl?: string;
  isActive: boolean;
  bio?: string;
  favoriteDestinations: mongoose.Types.ObjectId[];
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.authProviders || this.authProviders.length === 0;
      },
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    authProviders: {
      type: [
        {
          provider: {
            type: String,
            enum: ["google", "github"],
            required: true,
          },
          providerId: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: undefined,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      trim: true,
      default: undefined,
    },

    favoriteDestinations: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Destination" }],
      default: [],
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { "authProviders.provider": 1, "authProviders.providerId": 1 },
  { unique: true, sparse: true },
);

// Pre-save hook: hash password
userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password!, 12);
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password!);
};

export const User = mongoose.model<IUser>("User", userSchema);
