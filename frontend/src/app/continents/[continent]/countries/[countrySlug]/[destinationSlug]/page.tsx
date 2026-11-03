import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Compass,
  MapPin,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  api,
  Destination,
  Review,
  destinationHref,
  shouldBypassImageOptimization,
} from "@/lib/api";
import { FavoriteButton } from "@/components/favorite-button";
import { ReviewsSection } from "@/components/reviews/reviews-section";

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

  const facts = [
    {
      icon: Star,
      label: "Traveler rating",
      value:
        destination.averageRating > 0
          ? `${destination.averageRating.toFixed(1)} / 5.0`
          : "Verified place",
      detail:
        destination.ratingsCount > 0
          ? `Based on ${destination.ratingsCount} reviews`
          : "Curated destination",
    },
    {
      icon: CalendarDays,
      label: "Best time to visit",
      value: destination.bestTimeToVisit || "Year-round",
      detail: "Optimal seasonal conditions",
    },
    {
      icon: Ticket,
      label: "Typical entry fee",
      value: destination.ticketPrice || "Free / Varies",
      detail: "Per visitor entry",
    },
    {
      icon: Clock3,
      label: "Opening hours",
      value: destination.openingHours || "Varies by season",
      detail: "Check ahead of visit",
    },
  ];

  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          {/* Breadcrumb Navigation - Canonical Hierarchy: Continents > Continent > Country > Destination */}
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
              href={`/continents/${encodeURIComponent(continent)}`}
              className="rounded-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {destination.continent || decodeURIComponent(continent)}
            </Link>
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
            <Link
              href={`/continents/${encodeURIComponent(continent)}/countries/${encodeURIComponent(countrySlug)}`}
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

          {/* Destination Hero Card */}
          <Card
            variant="editorial"
            className="grid overflow-hidden p-0 lg:grid-cols-12"
          >
            <div className="relative min-h-80 overflow-hidden lg:col-span-7 lg:min-h-130">
              {destination.imageUrls?.[0] ? (
                <Image
                  src={destination.imageUrls[0]}
                  alt={destination.name}
                  fill
                  unoptimized={shouldBypassImageOptimization(destination.imageUrls[0])}
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              ) : (
                <div className="size-full bg-cream" />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent"
              />
              <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                <Badge
                  variant="tag"
                  className="border-background bg-background/95 text-ink backdrop-blur-xs capitalize"
                >
                  {destination.category}
                </Badge>
                {destination.location?.country && (
                  <Badge
                    variant="tag"
                    className="border-background bg-background/95 text-ink backdrop-blur-xs"
                  >
                    {destination.location.country}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-5 lg:p-12">
              <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                Destination guide
              </p>
              <h1 className="mt-2 text-headline font-semibold text-ink">
                {destination.name}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin
                  aria-hidden="true"
                  className="size-4 shrink-0 text-pastel-sky"
                />
                {destination.location?.city ? `${destination.location.city}, ` : ""}
                {destination.location?.country}
              </p>

              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {destination.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <FavoriteButton
                  variant="labeled"
                  destinationId={destination._id}
                  destinationName={destination.name}
                />
                {destination.website && (
                  <a
                    href={destination.website}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "pill",
                    })}
                  >
                    Official site
                    <ArrowUpRight data-icon="inline-end" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* Key Facts KPI Row */}
          <section
            aria-label="Destination facts"
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {facts.map(({ icon: Icon, label, value, detail }) => (
              <Card key={label} variant="editorial" className="p-6">
                <CardHeader className="flex flex-row items-center gap-2 p-0">
                  <div className="grid size-8 place-items-center rounded-control bg-background text-ink shadow-2xs">
                    <Icon aria-hidden="true" className="size-4" />
                  </div>
                  <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                    {label}
                  </p>
                </CardHeader>
                <CardContent className="px-0 pt-4 pb-0">
                  <p className="text-xl font-semibold text-ink">
                    {value}
                  </p>
                  <CardDescription className="mt-1 text-xs">
                    {detail}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* AI Review Summary Inset Panel */}
          {destination.aiReviewSummary && (
            <section aria-labelledby="ai-summary-heading" className="mt-10">
              <div className="rounded-card border border-border bg-canvas p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-7 place-items-center rounded-full bg-pastel-sky/30">
                      <Sparkles className="size-4 text-ink" />
                    </div>
                    <h2
                      id="ai-summary-heading"
                      className="text-lg font-semibold text-ink"
                    >
                      AI Review Summary
                    </h2>
                  </div>
                  <Badge variant="ai">AI-generated</Badge>
                </div>

                <p className="mt-4 text-base leading-relaxed text-ink">
                  {destination.aiReviewSummary}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Compass className="size-3.5 text-pastel-sky" />
                    Grounded in {destination.ratingsCount} verified traveler reviews
                  </span>
                  <span>Synthesized via Gemini AI</span>
                </div>
              </div>
            </section>
          )}

          {/* AI Travel Tips (if generated/available) */}
          {destination.travelTips && destination.travelTips.length > 0 && (
            <section aria-labelledby="travel-tips-heading" className="mt-10">
              <Card variant="editorial" className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                      Practical Advice
                    </p>
                    <h2
                      id="travel-tips-heading"
                      className="mt-1 text-title font-semibold text-ink"
                    >
                      Traveler Tips for {destination.name}
                    </h2>
                  </div>
                  <Badge variant="ai">AI-verified tips</Badge>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {destination.travelTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-card bg-background p-4 shadow-2xs"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {idx + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-ink/90">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          )}

          {/* Verified Attractions & Sights */}
          {destination.attractions && destination.attractions.length > 0 && (
            <section aria-labelledby="attractions-heading" className="mt-14">
              <div className="mb-6">
                <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                  Sights & Monuments
                </p>
                <h2
                  id="attractions-heading"
                  className="mt-1 text-title font-semibold text-ink"
                >
                  Verified Attractions in {destination.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Key points of interest verified in our database with visiting guidelines.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {destination.attractions.map((attraction, idx) => (
                  <Card key={idx} variant="app" className="bg-background p-6">
                    <CardHeader className="gap-2 p-0">
                      <div className="flex items-center justify-between gap-2">
                        {attraction.category && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {attraction.category}
                          </Badge>
                        )}
                        {attraction.ticketPrice && (
                          <span className="text-xs font-semibold text-ink">
                            {attraction.ticketPrice}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-title font-semibold text-ink">
                        {attraction.name}
                      </h3>
                    </CardHeader>
                    {attraction.description && (
                      <CardContent className="p-0 pt-3">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {attraction.description}
                        </p>
                      </CardContent>
                    )}
                    <CardFooter className="flex flex-col items-start gap-2 border-t border-line/60 bg-transparent p-0 pt-4 mt-4 text-xs text-muted-foreground">
                      {attraction.openingHours && (
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="size-3.5 shrink-0" />
                          {attraction.openingHours}
                        </span>
                      )}
                      {attraction.suggestedDuration && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 shrink-0" />
                          Suggested: {attraction.suggestedDuration}
                        </span>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Traveler Reviews Section */}
          <ReviewsSection
            destinationName={destination.name}
            countrySlug={countrySlug}
            destinationSlug={destination.slug}
            initialReviews={reviews}
            initialTotalReviews={totalReviews}
            initialTotalPages={totalReviewPages}
          />

          {/* Related Destinations */}
          {relatedDestinations.length > 0 && (
            <section aria-labelledby="related-destinations-heading" className="mt-16 border-t border-line pt-12">
              <div className="mb-6">
                <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                  Keep exploring
                </p>
                <h2
                  id="related-destinations-heading"
                  className="mt-1 text-title font-semibold text-ink"
                >
                  More places in {destination.location?.country}
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedDestinations.map((item) => (
                  <div key={item._id} className="relative">
                  <Link
                    href={destinationHref(item)}
                    className="group block rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    <Card
                      variant="editorial"
                      className="h-full gap-0 p-0 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-t-marketing bg-cream">
                        {item.imageUrls?.[0] ? (
                          <Image
                            src={item.imageUrls[0]}
                            alt={item.name}
                            fill
                            unoptimized={shouldBypassImageOptimization(item.imageUrls[0])}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="size-full bg-cream" />
                        )}
                        <Badge
                          variant="tag"
                          className="absolute bottom-3 left-3 border-background bg-background/90 text-xs text-ink capitalize"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <CardFooter className="justify-between border-0 bg-transparent p-5">
                        <div>
                          <CardTitle className="text-title font-semibold text-ink">
                            {item.name}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            {item.location?.city ? `${item.location.city}, ` : ""}
                            {item.location?.country}
                          </CardDescription>
                        </div>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-5 shrink-0 text-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </CardFooter>
                    </Card>
                  </Link>
                  <FavoriteButton
                    destinationId={item._id}
                    destinationName={item.name}
                    className="absolute right-4 top-4 z-10"
                  />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

