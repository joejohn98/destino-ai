import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  ListChecks,
  MapPin,
  PencilLine,
  Sparkles,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { api, ContinentStat, Destination } from "@/lib/api";

export const metadata: Metadata = {
  title: "Destino AI — Discover & Plan Trips",
  description:
    "Explore verified destinations, discover authentic sights, and shape your next journey.",
};

const steps = [
  {
    number: "01",
    label: "Explore verified places",
    title: "Browse real destinations.",
    description:
      "Every destination is backed by real sights, reviews, opening hours, and travel data.",
    icon: Compass,
    iconClass: "text-pastel-lavender",
  },
  {
    number: "02",
    label: "AI summaries & tips",
    title: "Grounded travel insights.",
    description:
      "Read AI-generated summaries and practical tips synthesized directly from verified traveler reviews.",
    icon: Sparkles,
    iconClass: "text-pastel-sky",
  },
  {
    number: "03",
    label: "Authentic attractions",
    title: "Verified sights & monuments.",
    description:
      "Explore curated attractions, tickets, timings, and suggested durations for each place.",
    icon: ListChecks,
    iconClass: "text-pastel-peach",
  },
  {
    number: "04",
    label: "Curate your route",
    title: "Discover by continent & country.",
    description:
      "Filter by region, category, or style to plan a journey that matches your pace.",
    icon: PencilLine,
    iconClass: "text-pastel-pink",
  },
];

export default async function Page() {
  let destinations: Destination[] = [];
  let continents: ContinentStat[] = [];

  try {
    const destRes = await api.getDestinations({ limit: 6 });
    destinations = destRes.data || [];
  } catch (error) {
    console.error("Failed to load featured destinations:", error);
  }

  try {
    const contRes = await api.getContinentStats();
    continents = contRes.data || [];
  } catch (error) {
    console.error("Failed to load continents:", error);
  }

  const heroDestination = destinations[0];

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-cream">
          <div className="mx-auto max-w-page px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-16 lg:px-10 lg:pb-20 lg:pt-20">
            <p className="mb-4 text-eyebrow font-medium uppercase text-muted-foreground">
              A little room for discovery
            </p>
            <h1 className="mx-auto max-w-5xl text-display font-semibold text-ink">
              <span className="block">Find your next</span>
              <span className="block">favorite place.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lead text-muted-foreground">
              Explore destinations across the globe, verified sights, and practical
              travel tips powered by verified traveler insights.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/destinations"
                className={buttonVariants({ size: "pill" })}
              >
                Explore all destinations
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="/continents"
                className={buttonVariants({ variant: "outline", size: "pill" })}
              >
                Browse by continent
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </div>
          </div>

          {/* Hero Featured Visual */}
          {heroDestination && (
            <div className="mx-auto max-w-page px-4 pb-12 sm:px-6 sm:pb-16 lg:px-10 lg:pb-20">
              <Link
                href={`/destinations/${heroDestination.slug || heroDestination._id}`}
                className="group block overflow-hidden rounded-marketing bg-canvas p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:p-4"
              >
                <div className="relative aspect-21/9 min-h-72 w-full overflow-hidden rounded-media bg-cream">
                  {heroDestination.imageUrls?.[0] ? (
                    <Image
                      src={heroDestination.imageUrls[0]}
                      alt={heroDestination.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 1620px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white sm:bottom-8 sm:left-8 sm:right-8">
                    <div>
                      <Badge
                        variant="tag"
                        className="mb-2 border-white/30 bg-white/20 text-white backdrop-blur-xs"
                      >
                        Featured destination
                      </Badge>
                      <h2 className="text-title font-semibold text-white">
                        {heroDestination.name}
                      </h2>
                      <p className="mt-1 text-sm text-white/90 sm:text-base">
                        {heroDestination.location?.city},{" "}
                        {heroDestination.location?.country}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-ink shadow-sm transition-transform group-hover:translate-x-1">
                      <span>Discover {heroDestination.name}</span>
                      <ArrowRight className="size-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </section>

        {/* Featured Destinations Grid */}
        <section
          aria-labelledby="destinations-heading"
          className="mx-auto max-w-page px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28"
        >
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-eyebrow font-medium uppercase text-muted-foreground">
                Verified locations
              </p>
              <h2
                id="destinations-heading"
                className="text-headline font-semibold text-ink"
              >
                Curated places to begin
              </h2>
            </div>
            <Link
              href="/destinations"
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              See all {destinations.length > 0 ? "destinations" : ""}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((destination) => (
              <Link
                key={destination._id}
                href={`/destinations/${destination.slug || destination._id}`}
                className="group block rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <Card
                  variant="editorial"
                  className="h-full gap-0 p-0 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-marketing bg-cream">
                    {destination.imageUrls?.[0] ? (
                      <Image
                        src={destination.imageUrls[0]}
                        alt={destination.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full bg-cream" />
                    )}
                    <Badge
                      variant="tag"
                      className="absolute bottom-4 left-4 border-background bg-background/90 text-ink capitalize"
                    >
                      {destination.category}
                    </Badge>
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-title font-semibold text-ink">
                        {destination.name}
                      </CardTitle>
                      {destination.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-ink">
                          <Star className="size-3.5 fill-pastel-peach text-pastel-peach" />
                          <span>{destination.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({destination.ratingsCount})
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {destination.location?.city},{" "}
                      {destination.location?.country}
                    </p>
                  </CardHeader>
                  <CardContent className="px-6 py-2">
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {destination.description}
                    </p>
                  </CardContent>
                  <CardFooter className="border-0 bg-transparent p-6 pt-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4">
                      Explore destination
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section
          aria-labelledby="how-it-works-heading"
          className="bg-cream py-16 sm:py-20 lg:py-28"
        >
          <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
              <p className="mb-3 text-eyebrow font-medium uppercase text-muted-foreground">
                Grounded in database insights
              </p>
              <h2
                id="how-it-works-heading"
                className="text-headline font-semibold text-ink"
              >
                How Destino AI works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lead text-muted-foreground">
                No hallucinated destinations. Real traveler experiences, verified
                attractions, and honest insights.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.number} variant="app" className="bg-background p-6">
                    <CardHeader className="gap-4 p-0">
                      <div className="flex items-center justify-between">
                        <Icon
                          aria-hidden="true"
                          className={`size-8 ${step.iconClass}`}
                          strokeWidth={1.6}
                        />
                        <span className="text-eyebrow font-medium tabular-nums text-muted-foreground">
                          {step.number}
                        </span>
                      </div>
                      <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                        {step.label}
                      </p>
                      <h3 className="text-title font-semibold text-ink">
                        {step.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="p-0 pt-3">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Explore By Continent Section */}
        <section
          aria-labelledby="continents-heading"
          className="mx-auto max-w-page px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-eyebrow font-medium uppercase text-muted-foreground">
                Start broad, then follow your curiosity
              </p>
              <h2
                id="continents-heading"
                className="text-headline font-semibold text-ink"
              >
                Explore by continent
              </h2>
            </div>
            <Link
              href="/continents"
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              All regions
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {continents.map((continent) => (
              <Link
                key={continent.continent}
                href={`/continents/${encodeURIComponent(continent.continent.toLowerCase().replace(/\s+/g, "-"))}`}
                className="group flex min-h-24 items-center justify-between gap-4 rounded-marketing bg-cream p-5 text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <div>
                  <h3 className="text-title font-semibold text-ink">
                    {continent.continent}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {continent.countryCount} countries · {continent.destinationCount} destinations
                  </p>
                </div>
                <div className="grid size-10 place-items-center rounded-full bg-background transition-transform group-hover:translate-x-1">
                  <ArrowUpRight aria-hidden="true" className="size-5 text-ink" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Dark Call-to-action Band */}
        <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10">
          <div className="mx-auto flex max-w-page flex-col items-start gap-6 rounded-marketing bg-ink px-6 py-12 text-white sm:px-10 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-16">
            <div>
              <p className="mb-3 text-eyebrow font-medium uppercase text-white/70">
                Your next trip is out there
              </p>
              <h2 className="max-w-2xl text-headline font-semibold text-white">
                Start with a place. See where it takes you.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/80">
                Browse our collection of verified historical, coastal, mountain, and city destinations.
              </p>
            </div>
            <Link
              href="/destinations"
              className={buttonVariants({ size: "pill" })}
            >
              Find a destination
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
