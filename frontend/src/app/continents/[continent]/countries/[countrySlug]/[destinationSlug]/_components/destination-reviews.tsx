import { connection } from "next/server";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Review } from "@/lib/api";

type DestinationReviewsProps = {
  destinationName: string;
  countrySlug: string;
  destinationSlug: string;
};

export async function DestinationReviews({
  destinationName,
  countrySlug,
  destinationSlug,
}: DestinationReviewsProps) {
  await connection();

  let reviews: Review[] = [];
  let totalReviews = 0;
  let totalReviewPages = 0;

  try {
    const response = await api.getDestinationReviews(countrySlug, destinationSlug);
    reviews = response.data ?? [];
    totalReviews = response.totalReviews ?? reviews.length;
    totalReviewPages = response.totalPages ?? 0;
  } catch (error) {
    console.error(
      `Failed to fetch reviews for ${countrySlug}/${destinationSlug}:`,
      error,
    );
  }

  return (
    <ReviewsSection
      destinationName={destinationName}
      countrySlug={countrySlug}
      destinationSlug={destinationSlug}
      initialReviews={reviews}
      initialTotalReviews={totalReviews}
      initialTotalPages={totalReviewPages}
    />
  );
}

export function DestinationReviewsFallback() {
  return (
    <section
      aria-label="Loading traveler reviews"
      aria-busy="true"
      className="mt-12"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-40 rounded-marketing" />
        <Skeleton className="h-40 rounded-marketing" />
      </div>
    </section>
  );
}