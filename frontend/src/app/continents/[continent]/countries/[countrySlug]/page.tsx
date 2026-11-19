import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { Compass, Globe2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { DestinationCard } from "@/components/destination-card";
import { api } from "@/lib/api";

type Props = {
  params: Promise<{ continent: string; countrySlug: string }>;
};

async function getCachedCountryDestinations(countrySlug: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 1200 }); // 10 min revalidate, aligns with backend Redis DETAIL_CACHE_TTL
  cacheTag("destinations");
  cacheTag(`country-${countrySlug}`);
  return api.getCountryDestinations(countrySlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countrySlug } = await params;
  try {
    const res = await getCachedCountryDestinations(countrySlug);
    if (res?.data?.country) {
      return {
        title: `Explore ${res.data.country.name} Destinations | Destino AI`,
        description:
          res.data.country.description ||
          `Browse verified destinations, authentic attractions, and travel guides in ${res.data.country.name}.`,
      };
    }
  } catch {
    // fallback
  }
  return {
    title: "Country Destinations | Destino AI",
  };
}

export default async function CountryDestinationsPage({ params }: Props) {
  const { continent, countrySlug } = await params;

  let data = null;
  try {
    const res = await getCachedCountryDestinations(countrySlug);
    data = res?.data;
  } catch {
    // handled by notFound check below
  }

  if (!data?.country) {
    notFound();
  }

  const { country, destinations } = data;
  const continentDisplay = country.continent || decodeURIComponent(continent);

  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <section
          aria-labelledby="country-heading"
          className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-10 lg:pb-24 lg:pt-16"
        >
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href="/continents"
              className="rounded-sm underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Continents
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href={`/continents/${encodeURIComponent(continent)}`}
              className="rounded-sm underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {continentDisplay}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-ink">
              {country.name}
            </span>
          </nav>

          {/* Country Heading Cluster */}
          <div className="mb-10 flex items-start gap-4 sm:mb-14 sm:gap-6">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-canvas text-ink shadow-2xs sm:size-16">
              <Globe2 aria-hidden="true" className="size-7 sm:size-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="tag">
                  <MapPin data-icon="inline-start" className="size-3.5" />
                  {continentDisplay}
                </Badge>
                <Badge variant="tag" className="border-pastel-peach/40 bg-pastel-peach/15">
                  {destinations.length} verified {destinations.length === 1 ? "destination" : "destinations"}
                </Badge>
              </div>
              <h1
                id="country-heading"
                className="mt-3 text-display font-semibold text-ink"
              >
                {country.name}
              </h1>
              <p className="mt-3 max-w-2xl text-lead text-muted-foreground">
                {country.description ||
                  `Explore verified destinations, top sights, and local traveler insights across ${country.name}.`}
              </p>
            </div>
          </div>

          {/* Destinations Grid */}
          {destinations.length === 0 ? (
            <Card variant="editorial" className="p-6 text-center sm:p-10">
              <CardContent className="flex flex-col items-center gap-3 p-0">
                <div className="grid size-12 place-items-center rounded-full bg-cream text-muted-foreground">
                  <Compass className="size-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-base text-ink">
                  No destinations listed yet
                </CardTitle>
                <CardDescription className="max-w-md">
                  We haven&apos;t added verified destinations for {country.name} yet.
                  Check back soon or explore other countries in {continentDisplay}.
                </CardDescription>
                <Link
                  href={`/continents/${encodeURIComponent(continent)}`}
                  className="mt-2 text-sm font-medium text-ink underline underline-offset-4"
                >
                  Back to {continentDisplay}
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination._id}
                  destination={destination}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

