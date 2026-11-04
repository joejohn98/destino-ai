import mongoose, { Document } from "mongoose";
import slugify from "slugify";
import { IDestination } from "./Destination.model";
import { normalizeSearchValue } from "../utils/search-normalization";

export interface ICountry extends Document {
  name: string;
  searchName?: string;
  slug: string;
  imageUrl: string;
  description: string | undefined;
  continent: mongoose.Types.ObjectId;
  destinations?: IDestination[];
  destinationCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const countrySchema = new mongoose.Schema<ICountry>(
  {
    name: {
      type: String,
      required: [true, "Country name is required"],
      trim: true,
    },
    searchName: {
      type: String,
      select: false,
    },
    slug: {
      type: String,
      required: [true, "Country slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: undefined
    },
    continent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Continent",
      required: [true, "Continent reference is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate destinations for Country
countrySchema.virtual("destinations", {
  ref: "Destination",
  localField: "_id",
  foreignField: "location.country",
});

// Create an index on the continent field for faster queries
countrySchema.index({ continent: 1 });
countrySchema.index({ searchName: 1 });
countrySchema.index({ name: "text" });

// Pre-save hook: auto-generate slug from name
countrySchema.pre("validate", function () {
  this.searchName = normalizeSearchValue(this.name ?? "");

  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Pre-findOneAndUpdate hook: regenerate slug if name is being updated
countrySchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as {
    name?: string;
    slug?: string;
    $set?: { name?: string; slug?: string; searchName?: string };
  };
  if (update?.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
    update.$set = {
      ...update.$set,
      searchName: normalizeSearchValue(update.name),
    };
  }

  if (update?.$set?.name) {
    update.$set.slug = slugify(update.$set.name, {
      lower: true,
      strict: true,
    });
    update.$set.searchName = normalizeSearchValue(update.$set.name);
  }
});

export const Country = mongoose.model<ICountry>("Country", countrySchema);
