import Link from "next/link";
import { notFound } from "next/navigation";
import { api, type Destination, type Review } from "@/lib/api";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import {
  DestinationAiInsights,
  DestinationAttractionsSection,
  DestinationHeroCard,
  DestinationKeyFacts,
  DestinationRelatedSection,
} from "./_components";

type DestinationDetailPageProps = {
  params: Promise<{
    continent: string;
    countrySlug: string;
    destinationSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: DestinationDetailPageProps) {
  const { countrySlug, destinationSlug } = await params;
  try {
    const res = await api.getCanonicalDestination(countrySlug, destinationSlug);
    if (res?.data) {
      return {
        title: `${res.data.name} — Destination Guide | Destino AI`,
        description: res.data.description,
      };
    }
  } catch {
    // fallback
  }
  return {
    title: "Destination Guide | Destino AI",
  };
}

export default async function DestinationDetailPage({
  params,
}: DestinationDetailPageProps) {
  const { continent, countrySlug, destinationSlug } = await params;

  let destination: Destination | null = null;
  let reviews: Review[] = [];
  let totalReviews = 0;
  let totalReviewPages = 0;
  let relatedDestinations: Destination[] = [];

  try {
    const res = await api.getCanonicalDestination(countrySlug, destinationSlug);
    destination = res.data;
  } catch (error) {
    console.error(`Failed to fetch destination ${countrySlug}/${destinationSlug}:`, error);
  }

  if (!destination) {
    notFound();
  }

  try {
    const reviewRes = await api.getDestinationReviews(countrySlug, destinationSlug);
    reviews = reviewRes.data || [];
    totalReviews = reviewRes.totalReviews ?? reviews.length;
    totalReviewPages = reviewRes.totalPages ?? 0;
  } catch {
    // Reviews might be empty
  }

  // Fetch related destinations from the same canonical country
  try {
    const countryRes = await api.getCountryDestinations(countrySlug);
    relatedDestinations = (countryRes.data?.destinations || [])
      .filter((d) => d._id !== destination?._id)
      .slice(0, 3);
  } catch {
    // ignore
  }

  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          {/* Breadcrumb Navigation - Canonical Hierarchy: Continents > Continent > Country > Destination */}
          {(() => {
            const resolvedContinentSlug = destination.continentSlug || continent;
            return (
              <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                <Link
                  href="/continents"
                  className="rounded-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  Continents
                </Link>
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
                <Link
                  href={`/continents/${encodeURIComponent(resolvedContinentSlug)}`}
                  className="rounded-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {destination.continent || decodeURIComponent(continent)}
                </Link>
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
                <Link
                  href={`/continents/${encodeURIComponent(resolvedContinentSlug)}/countries/${encodeURIComponent(countrySlug)}`}
                  className="rounded-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {destination.location?.country || countrySlug}
                </Link>
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
                <span aria-current="page" className="font-medium text-ink">
                  {destination.name}
                </span>
              </nav>
            );
          })()}

          <DestinationHeroCard destination={destination} />
          <DestinationKeyFacts destination={destination} />
          <DestinationAiInsights destination={destination} />
          <DestinationAttractionsSection destination={destination} />

          {/* Traveler Reviews Section */}
          <ReviewsSection
            destinationName={destination.name}
            countrySlug={countrySlug}
            destinationSlug={destination.slug}
            initialReviews={reviews}
            initialTotalReviews={totalReviews}
            initialTotalPages={totalReviewPages}
          />

          <DestinationRelatedSection
            countryName={destination.location?.country}
            relatedDestinations={relatedDestinations}
          />
        </div>
      </main>
    </div>
  );
}
