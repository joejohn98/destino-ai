import mongoose, { Document } from "mongoose";
import slugify from "slugify";
import { ICountry } from "./Country.model";

export interface IContinent extends Document {
  name: string;
  slug: string;
  description?: string;
  countries?: ICountry[];
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const continentSchema = new mongoose.Schema<IContinent>(
  {
    name: {
      type: String,
      required: [true, "Continent name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Continent slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: undefined,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Pre-save hook: auto-generate slug from name
continentSchema.pre("validate", function () {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Virtual populate countries
continentSchema.virtual("countries", {
  ref: "Country",
  localField: "_id",
  foreignField: "continent",
});

export const Continent = mongoose.model<IContinent>(
  "Continent",
  continentSchema,
);
