import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { api, type Destination } from "@/lib/api";
import {
  DestinationReviews,
  DestinationReviewsFallback,
} from "./_components/destination-reviews";
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

// Cached canonical destination query with Next.js Cache Components
async function getCachedCanonicalDestination(countrySlug: string, destinationSlug: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 1200 }); // 10 min TTL (aligns with backend Redis DETAIL_CACHE_TTL)
  cacheTag("destinations");
  cacheTag(`destination-${destinationSlug}`);
  return api.getCanonicalDestination(countrySlug, destinationSlug);
}

// Cached related destinations from the same canonical country
async function getCachedRelatedDestinations(countrySlug: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 1200 });
  cacheTag("destinations");
  cacheTag(`country-${countrySlug}`);
  return api.getCountryDestinations(countrySlug);
}

export async function generateMetadata({
  params,
}: DestinationDetailPageProps) {
  const { countrySlug, destinationSlug } = await params;
  try {
    const res = await getCachedCanonicalDestination(countrySlug, destinationSlug);
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
  let relatedDestinations: Destination[] = [];

  try {
    const res = await getCachedCanonicalDestination(countrySlug, destinationSlug);
    destination = res.data;
  } catch (error) {
    console.error(`Failed to fetch destination ${countrySlug}/${destinationSlug}:`, error);
  }

  if (!destination) {
    notFound();
  }

  // Fetch related destinations from the same canonical country
  try {
    const countryRes = await getCachedRelatedDestinations(countrySlug);
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
          <Suspense fallback={<DestinationReviewsFallback />}>
            <DestinationReviews
              destinationName={destination.name}
              countrySlug={countrySlug}
              destinationSlug={destination.slug}
            />
          </Suspense>

          <DestinationRelatedSection
            countryName={destination.location?.country}
            relatedDestinations={relatedDestinations}
          />
        </div>
      </main>
    </div>
  );
}
