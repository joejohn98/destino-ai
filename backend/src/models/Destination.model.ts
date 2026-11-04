import mongoose, { Document } from "mongoose";
import slugify from "slugify";
import { normalizeSearchValue } from "../utils/search-normalization";

export const CATEGORIES = [
  "beach",
  "mountain",
  "city",
  "historical",
  "adventure",
  "wildlife",
] as const;

export const ATTRACTION_CATEGORIES = [
  "monument",
  "museum",
  "market",
  "nature",
  "viewpoint",
  "day-trip",
  "activity",
  "religious",
  "entertainment",
] as const;

export const SENTIMENTS = ["positive", "neutral", "negative"] as const;

export type Category = (typeof CATEGORIES)[number];
export type AttractionCategory = (typeof ATTRACTION_CATEGORIES)[number];
export type Sentiment = (typeof SENTIMENTS)[number];

/**
 * A verified local sight, excursion, or activity tied to a Destination.
 * The AI planner agent builds itinerary day-by-day activities exclusively
 * from this list — preventing hallucination of non-existent places.
 */
export interface IAttraction {
  _id?: mongoose.Types.ObjectId | string;
  name: string;
  description?: string;
  ticketPrice?: string;
  suggestedDuration?: string;
  openingHours?: string;
  category?: AttractionCategory;
}

export interface IDestination extends Document {
  name: string;
  slug: string;
  description: string;
  location: {
    city: string;
    state?: string;
    country: mongoose.Types.ObjectId;
  };
  category: Category;
  imageUrls: string[];
  /** Verified local sights and activities at this destination used by the AI planner. */
  attractions: IAttraction[];
  bestTimeToVisit?: string;
  travelTips?: string[];
  travelTipsContextHash?: string;
  aiReviewSummary?: string;
  summaryGeneratedAtRatingCount?: number;
  reviewContentVersion?: number;
  searchCity?: string;
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
      state: {
        type: String,
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

    attractions: {
      type: [
        new mongoose.Schema<IAttraction>(
          {
            name: { type: String, required: true, trim: true },
            description: { type: String, trim: true },
            ticketPrice: { type: String, trim: true },
            suggestedDuration: { type: String, trim: true },
            openingHours: { type: String, trim: true },
            category: {
              type: String,
              enum: {
                values: ATTRACTION_CATEGORIES,
                message: `Attraction category must be one of: ${ATTRACTION_CATEGORIES.join(", ")}`,
              },
            },
          },
          { _id: true },
        ),
      ],
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
    aiReviewSummary: {
      type: String,
      default: undefined,
    },
    summaryGeneratedAtRatingCount: {
      type: Number,
      min: [0, "Summary rating count cannot be negative"],
      default: undefined,
    },
    reviewContentVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    searchCity: {
      type: String,
      select: false,
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

destinationSchema.index({ createdAt: -1, _id: -1 });
destinationSchema.index({ category: 1, createdAt: -1, _id: -1 });
destinationSchema.index({ "location.country": 1, createdAt: -1, _id: -1 });
destinationSchema.index({ category: 1, averageRating: -1, _id: 1 });
destinationSchema.index({ averageRating: -1, _id: 1 });
destinationSchema.index({ searchCity: 1 });
destinationSchema.index({ "location.country": 1, slug: 1 }, { unique: true });
destinationSchema.index({
  name: "text",
  description: "text",
  "location.city": "text",
});

// Pre-save hook: auto-generate slug from name
destinationSchema.pre("validate", function () {
  this.searchCity = normalizeSearchValue(this.location?.city ?? "");

  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Pre-findOneAndUpdate hook: regenerate slug if name is being updated
destinationSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as {
    name?: string;
    slug?: string;
    $set?: {
      name?: string;
      slug?: string;
      "location.city"?: string;
      location?: { city?: string };
      searchCity?: string;
    };
    "location.city"?: string;
  };

  const updatedCity =
    update?.["location.city"] ??
    update?.$set?.["location.city"] ??
    update?.$set?.location?.city;
  if (typeof updatedCity === "string") {
    update.$set = {
      ...update.$set,
      searchCity: normalizeSearchValue(updatedCity),
    };
  }

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
