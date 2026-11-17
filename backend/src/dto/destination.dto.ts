import type {
  IAttraction,
  Category,
  IDestination,
} from "../models/Destination.model";
import type { DestinationCardDTO } from "@destino/shared";

export type { DestinationCardDTO };

export type DestinationCardRecord = Omit<Pick<
  IDestination,
  | "name"
  | "slug"
  | "description"
  | "category"
  | "imageUrls"
  | "attractions"
  | "bestTimeToVisit"
  | "travelTips"
  | "aiReviewSummary"
  | "summaryGeneratedAtRatingCount"
  | "openingHours"
  | "ticketPrice"
  | "website"
  | "averageRating"
  | "ratingsCount"
  | "isFeatured"
>, "attractions"> & {
  attractions?: IAttraction[] | null;
  _id: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
  location: {
    city: string;
    state?: string;
    country: {
      name: string;
      slug: string;
      continent: { name: string; slug: string } | null;
    } | null;
  };
};

export interface DestinationCardResponseDTO {
  status: "success";
  data: DestinationCardDTO;
}

export interface PaginatedDestinationResponseDTO {
  status: "success";
  results: number;
  totalDestinations: number;
  totalPages: number;
  currentPage: number;
  data: DestinationCardDTO[];
}

export interface DestinationArrayResponseDTO {
  status: "success";
  results: number;
  data: DestinationCardDTO[];
}

export interface CategoryDestinationResponseDTO extends DestinationArrayResponseDTO {
  category: Category;
}

export const toDestinationCardDTO = (
  destination: DestinationCardRecord,
): DestinationCardDTO => {
  const country = destination.location.country;
  const continent = country?.continent;

  return {
    _id: destination._id.toString(),
    name: destination.name,
    slug: destination.slug,
    description: destination.description,
    location: {
      city: destination.location.city,
      ...(destination.location.state !== undefined
        ? { state: destination.location.state }
        : {}),
      country: country?.name ?? "",
      countrySlug: country?.slug ?? null,
    },
    category: destination.category,
    imageUrls: destination.imageUrls,
    attractions: (Array.isArray(destination.attractions)
      ? destination.attractions
      : []
    ).map((attraction) => ({
      name: attraction.name,
      ...(attraction._id ? { _id: attraction._id.toString() } : {}),
      ...(attraction.description !== undefined
        ? { description: attraction.description }
        : {}),
      ...(attraction.ticketPrice !== undefined
        ? { ticketPrice: attraction.ticketPrice }
        : {}),
      ...(attraction.suggestedDuration !== undefined
        ? { suggestedDuration: attraction.suggestedDuration }
        : {}),
      ...(attraction.openingHours !== undefined
        ? { openingHours: attraction.openingHours }
        : {}),
      ...(attraction.category !== undefined
        ? { category: attraction.category }
        : {}),
    })),
    ...(destination.bestTimeToVisit !== undefined
      ? { bestTimeToVisit: destination.bestTimeToVisit }
      : {}),
    ...(destination.travelTips !== undefined
      ? { travelTips: destination.travelTips }
      : {}),
    ...(destination.aiReviewSummary !== undefined
      ? { aiReviewSummary: destination.aiReviewSummary }
      : {}),
    ...(destination.summaryGeneratedAtRatingCount !== undefined
      ? {
          summaryGeneratedAtRatingCount:
            destination.summaryGeneratedAtRatingCount,
        }
      : {}),
    ...(destination.openingHours !== undefined
      ? { openingHours: destination.openingHours }
      : {}),
    ...(destination.ticketPrice !== undefined
      ? { ticketPrice: destination.ticketPrice }
      : {}),
    ...(destination.website !== undefined
      ? { website: destination.website }
      : {}),
    averageRating: destination.averageRating,
    ratingsCount: destination.ratingsCount,
    isFeatured: destination.isFeatured,
    createdAt: destination.createdAt.toISOString(),
    updatedAt: destination.updatedAt.toISOString(),
    continent: continent?.name ?? null,
    continentSlug: continent?.slug ?? null,
  };
};
