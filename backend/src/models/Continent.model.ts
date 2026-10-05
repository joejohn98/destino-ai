import mongoose, { Document } from "mongoose";
import slugify from "slugify";

export interface IContinent extends Document {
  name: string;
  slug: string;
  description?: string;
  image: string;
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
      default: undefined
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook: auto-generate slug from name
continentSchema.pre("validate", function () {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

export const Continent = mongoose.model<IContinent>(
  "Continent",
  continentSchema,
);
