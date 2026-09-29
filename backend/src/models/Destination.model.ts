import mongoose, { Document, Schema } from "mongoose";
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

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  rating: number;
  reviewText: string;
  sentiment?: Sentiment;
  themes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDestination extends Document {
  name: string;
  slug: string;
  description: string;
  location: {
    city: string;
    country: mongoose.Types.ObjectId;
  };
  category: Category;
  images: string[];
  bestTimeToVisit?: string;
  openingHours?: string;
  ticketPrice?: string;
  website?: string;
  averageRating: number;
  ratingsCount: number;
  isFeatured: boolean;
  reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review user is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewText: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      maxlength: [500, "Review text cannot exceed 500 characters"],
    },
    sentiment: {
      type: String,
      enum: {
        values: SENTIMENTS,
        message: `Sentiment must be one of: ${SENTIMENTS.join(", ")}`,
      },
      default: undefined,
    },
    themes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const destinationSchema = new Schema<IDestination>(
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
        type: Schema.Types.ObjectId,
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
    images: {
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
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating must be above 0"],
      max: [5, "Average rating must be below 5.0"],
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    ratingsCount: {
      type: Number,
      default: 0,
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

destinationSchema.pre("save", function (this: IDestination) {
  this.ratingsCount = this.reviews.length;

  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
  } else {
    this.averageRating = 0;
  }
});

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

  if (update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }

  if (update.$set?.name) {
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
