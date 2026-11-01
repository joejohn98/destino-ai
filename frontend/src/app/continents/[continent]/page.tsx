import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Globe2, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, ContinentStat, CountryContinentStat } from "@/lib/api";

type ContinentPageProps = {
  params: Promise<{ continent: string }>;
};

export async function generateMetadata({ params }: ContinentPageProps): Promise<Metadata> {
  const { continent } = await params;
  const decoded = decodeURIComponent(continent);
  const formatted = decoded
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  return {
    title: `Explore ${formatted} | Destino AI`,
    description: `Browse countries and verified destinations in ${formatted}.`,
  };
}

export default async function ContinentDetailPage({ params }: ContinentPageProps) {
  const { continent } = await params;
  const decodedParam = decodeURIComponent(continent).toLowerCase();

  let continentStats: ContinentStat[] = [];
  try {
    const res = await api.getContinentStats();
    continentStats = res.data || [];
  } catch (error) {
    console.error("Failed to fetch continents:", error);
  }

  const matchedContinent = continentStats.find(
    (item) =>
      item.continent.toLowerCase() === decodedParam ||
      item.continent.toLowerCase().replace(/\s+/g, "-") === decodedParam,
  );

  if (!matchedContinent) {
    notFound();
  }

  const continentName = matchedContinent.continent;

  // Fetch country statistics for this continent
  let countriesList: CountryContinentStat[] = [];
  try {
    const statsRes = await api.getCountriesByContinent(continentName);
    countriesList = statsRes.data || [];
  } catch (error) {
    console.error(`Failed to fetch countries for ${continentName}:`, error);
  }

  if (countriesList.length === 0) {
    notFound();
  }

  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <section
          aria-labelledby="continent-heading"
          className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-10 lg:pb-24 lg:pt-16"
        >
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm">
            <Link
              href="/continents"
              className="rounded-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Continents
            </Link>
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
            <span aria-current="page" className="font-medium text-ink">
              {continentName}
            </span>
          </nav>

          {/* Heading cluster */}
          <div className="mb-10 flex items-start gap-4 sm:mb-14 sm:gap-6">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-canvas text-ink shadow-2xs sm:size-16">
              <Globe2 aria-hidden="true" className="size-7 sm:size-8" />
            </div>
            <div>
              <Badge variant="tag">
                <MapPin data-icon="inline-start" />
                Explore by country
              </Badge>
              <h1
                id="continent-heading"
                className="mt-3 text-display font-semibold text-ink"
              >
                {continentName}
              </h1>
              <p className="mt-3 max-w-2xl text-lead text-muted-foreground">
                Browse countries and verified destinations across this region.
              </p>
            </div>
          </div>

          {/* Country Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {countriesList.map((countryItem) => {
              const countrySlug =
                countryItem.slug ||
                countryItem.country.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={countryItem.country}
                  href={`/continents/${encodeURIComponent(continent)}/countries/${encodeURIComponent(countrySlug)}`}
                  className="group block rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                <Card
                  variant="editorial"
                  className="h-full transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
                >
                  <CardHeader className="gap-3 p-6 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="grid size-10 place-items-center rounded-control bg-background text-ink shadow-2xs">
                        <MapPin className="size-5 text-pastel-sky" />
                      </div>
                      {countryItem.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-ink">
                          <Star className="size-3.5 fill-pastel-peach text-pastel-peach" />
                          <span>{countryItem.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-title font-semibold text-ink">
                      {countryItem.country}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-6 py-2">
                    <CardDescription className="text-sm">
                      {countryItem.destinationCount > 0
                        ? `${countryItem.destinationCount} verified ${
                            countryItem.destinationCount === 1
                              ? "destination"
                              : "destinations"
                          } in database.`
                        : `Browse destination listings in ${countryItem.country}.`}
                    </CardDescription>
                  </CardContent>

                  <CardFooter className="border-0 bg-transparent p-6 pt-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4">
                      View destinations
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
