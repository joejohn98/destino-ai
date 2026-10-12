import mongoose, { Document } from "mongoose";
import slugify from "slugify";

export const CATEGORIES = [
  "beach",
  "mountain",
  "city",
  "historical",
  "adventure",
  "wildlife",
] as const;

export const SENTIMENTS = ["positive", "neutral", "negative"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Sentiment = (typeof SENTIMENTS)[number];


export interface IDestination extends Document {
  name: string;
  slug: string;
  description: string;
  location: {
    city: string;
    country: mongoose.Types.ObjectId;
  };
  category: Category;
  imageUrls: string[];
  bestTimeToVisit?: string;
  travelTips?: string[];
  travelTipsContextHash?: string;
  openingHours?: string;
  ticketPrice?: string;
  website?: string;
  averageRating: number;
  ratingsCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}


const destinationSchema = new mongoose.Schema<IDestination>(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Destination slug is required"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: [true, "Country reference is required"],
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
    },
    imageUrls: {
      type: [String],
      default: [],
    },

    openingHours: {
      type: String,
      trim: true,
    },
    ticketPrice: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: undefined,
    },
    bestTimeToVisit: {
      type: String,
      trim: true,
      default: undefined,
    },
    travelTips: {
      type: [String],
      default: undefined,
    },
    travelTipsContextHash: {
      type: String,
      default: undefined,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating must be above 0"],
      max: [5, "Average rating must be below 5.0"],
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: [0, "Ratings count cannot be negative"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

destinationSchema.index({ category: 1 });
destinationSchema.index({ averageRating: -1 });
destinationSchema.index({ "location.country": 1, slug: 1 }, { unique: true });
destinationSchema.index({ name: "text", description: "text" });


// Pre-save hook: auto-generate slug from name
destinationSchema.pre("validate", function () {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Pre-findOneAndUpdate hook: regenerate slug if name is being updated
destinationSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as {
    name?: string;
    slug?: string;
    $set?: { name?: string; slug?: string };
  };

  if (update?.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }

  if (update?.$set?.name) {
    update.$set.slug = slugify(update.$set.name, {
      lower: true,
      strict: true,
    });
  }
});

export const Destination = mongoose.model<IDestination>(
  "Destination",
  destinationSchema,
);
