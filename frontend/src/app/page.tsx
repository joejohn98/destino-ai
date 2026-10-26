import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  GitCompareArrows,
  ListChecks,
  MapPin,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Destino AI | Find your next place",
  description:
    "Explore destinations, plan a trip with AI, and compare places for your next adventure.",
};

const destinations = [
  { name: "Santorini", country: "Greece", category: "Coastal escape" },
  { name: "Kyoto", country: "Japan", category: "Cultural journey" },
  { name: "Marrakech", country: "Morocco", category: "City adventure" },
];

const continents = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

const navigation = [
  ["Destinations", "/destinations"],
  ["Continents", "/continents"],
  ["AI Planner", "/ai/planner"],
  ["Compare", "/ai/compare"],
] as const;

const steps = [
  {
    number: "01",
    label: "Start with an idea",
    title: "Share what you have in mind.",
    description:
      "Begin with a place, a feeling, or the kind of trip you would like to take.",
    icon: Compass,
    iconClass: "text-pastel-lavender",
  },
  {
    number: "02",
    label: "Explore possibilities",
    title: "Find a direction to follow.",
    description:
      "Look through a first set of destination ideas and see what catches your attention.",
    icon: Sparkles,
    iconClass: "text-pastel-sky",
  },
  {
    number: "03",
    label: "Shape the outline",
    title: "Bring the days together.",
    description:
      "Use the itinerary draft to arrange the places and moments you want to explore.",
    icon: ListChecks,
    iconClass: "text-pastel-peach",
  },
  {
    number: "04",
    label: "Make it yours",
    title: "Adjust until it feels right.",
    description:
      "Review your plan, make changes, and keep the parts that suit your trip.",
    icon: PencilLine,
    iconClass: "text-pastel-pink",
  },
];

export default function Page() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="bg-cream">
        <header className="mx-auto max-w-page px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="Destino AI home"
              className="rounded-sm text-lg font-semibold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Destino AI
            </Link>

            <nav
              aria-label="Main navigation"
              className="order-3 flex w-full items-center gap-6 overflow-x-auto pb-1 md:order-0 md:w-auto md:pb-0"
            >
              {navigation.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="shrink-0 rounded-sm text-sm font-medium text-ink transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <Link
              href="/auth/login"
              className={buttonVariants({
                variant: "outline",
                size: "pill",
                className: "h-10 px-5",
              })}
            >
              Sign in
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-page px-4 pb-10 pt-12 text-center sm:px-6 sm:pb-14 sm:pt-16 lg:px-10 lg:pb-16 lg:pt-20">
          <p className="mb-5 text-eyebrow font-medium uppercase text-muted-foreground">
            A little room for discovery
          </p>
          <h1 className="mx-auto max-w-5xl text-display font-semibold text-ink">
            <span className="block">Find your next</span>
            <span className="block">favorite place.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lead text-muted-foreground">
            Explore destinations and shape a trip with a little help from the
            AI planner.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/ai/planner"
              className={buttonVariants({ size: "pill" })}
            >
              Plan a trip with AI
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/destinations"
              className={buttonVariants({ variant: "outline", size: "pill" })}
            >
              Explore destinations
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-page px-4 pb-10 sm:px-6 sm:pb-14 lg:px-10 lg:pb-16">
          <div
            aria-hidden="true"
            className="aspect-video overflow-hidden rounded-marketing bg-canvas p-2 sm:p-4"
          >
            <div className="size-full rounded-media bg-cream" />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="destinations-heading"
        className="mx-auto max-w-page px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28"
      >
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-eyebrow font-medium uppercase text-muted-foreground">
              A few places to begin
            </p>
            <h2
              id="destinations-heading"
              className="text-headline font-semibold text-ink"
            >
              Let the map open up
            </h2>
          </div>
          <Link
            href="/destinations"
            className="inline-flex w-fit items-center gap-2 rounded-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            See all destinations
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {destinations.map((destination) => (
            <Card
              key={destination.name}
              variant="editorial"
              className="transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"
            >
              <div
                aria-hidden="true"
                className="aspect-video overflow-hidden rounded-media bg-canvas p-2"
              >
                <div className="size-full rounded-card bg-cream" />
              </div>
              <CardHeader>
                <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                  {destination.category}
                </p>
                <CardTitle className="text-title font-semibold text-ink">
                  {destination.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin aria-hidden="true" />
                  {destination.country}
                </p>
              </CardContent>
              <CardFooter className="border-0 bg-transparent p-0">
                <Link
                  href={`/destinations/${encodeURIComponent(destination.name)}`}
                  className="inline-flex items-center gap-2 rounded-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  Explore {destination.name}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="how-it-works-heading"
        className="mx-auto max-w-page px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28"
      >
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <p className="mb-3 text-eyebrow font-medium uppercase text-muted-foreground">
            From first thought to trip outline
          </p>
          <h2
            id="how-it-works-heading"
            className="text-headline font-semibold text-ink"
          >
            How the AI planner works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lead text-muted-foreground">
            A simple place to begin exploring, sketching out ideas, and making
            a plan your own.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.number} variant="editorial">
                <CardHeader className="gap-5">
                  <div className="flex items-center justify-between">
                    <Icon
                      aria-hidden="true"
                      className={`size-8 ${step.iconClass}`}
                      strokeWidth={1.6}
                    />
                    <span className="text-eyebrow font-medium text-muted-foreground tabular-nums">
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
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="planning-heading"
        className="bg-cream"
      >
        <div className="mx-auto grid max-w-page gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-28">
          <div>
            <p className="mb-3 text-eyebrow font-medium uppercase text-muted-foreground">
              A thoughtful travel companion
            </p>
            <h2
              id="planning-heading"
              className="max-w-xl text-headline font-semibold text-ink"
            >
              Plan with more of the picture.
            </h2>
            <p className="mt-5 max-w-xl text-lead text-muted-foreground">
              Start with a destination idea, sketch out an itinerary, or compare
              two places side by side before you decide.
            </p>
            <Link
              href="/ai/planner"
              className={`${buttonVariants({ size: "pill" })} mt-7`}
            >
              Start planning
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/ai/planner"
              className="rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Card
                variant="editorial"
                className="h-full transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"
              >
                <CardHeader>
                  <Sparkles
                    aria-hidden="true"
                    className="size-8 text-pastel-sky"
                    strokeWidth={1.5}
                  />
                  <CardTitle className="text-title font-semibold text-ink">
                    AI trip planner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Turn a destination idea into a day-by-day itinerary grounded
                    in destination information.
                  </p>
                </CardContent>
                <CardFooter className="border-0 bg-transparent p-0">
                  <Badge variant="ai">AI-assisted</Badge>
                </CardFooter>
              </Card>
            </Link>

            <Link
              href="/ai/compare"
              className="rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Card
                variant="editorial"
                className="h-full transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"
              >
                <CardHeader>
                  <GitCompareArrows
                    aria-hidden="true"
                    className="size-8 text-pastel-peach"
                    strokeWidth={1.5}
                  />
                  <CardTitle className="text-title font-semibold text-ink">
                    Compare places
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    See two destinations side by side and explore the details
                    that matter to you.
                  </p>
                </CardContent>
                <CardFooter className="border-0 bg-transparent p-0">
                  <span className="inline-flex items-center gap-2 font-medium text-ink underline underline-offset-4">
                    Compare destinations
                    <ArrowRight aria-hidden="true" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="continents-heading"
        className="mx-auto max-w-page px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28"
      >
        <div className="max-w-2xl">
          <p className="mb-3 text-eyebrow font-medium uppercase text-muted-foreground">
            Start broad, then follow your curiosity
          </p>
          <h2
            id="continents-heading"
            className="text-headline font-semibold text-ink"
          >
            Explore by continent
          </h2>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {continents.map((continent) => (
            <Link
              key={continent}
              href={`/continents/${encodeURIComponent(continent)}`}
              className="group flex min-h-20 items-center justify-between gap-4 rounded-marketing bg-cream px-5 py-4 text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <span className="font-medium">{continent}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10">
        <div className="mx-auto flex max-w-page flex-col items-start gap-6 rounded-marketing bg-ink px-6 py-10 text-background sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div>
            <p className="mb-3 text-eyebrow font-medium uppercase text-background/70">
              Your next trip is out there
            </p>
            <h2 className="max-w-2xl text-headline font-semibold">
              Start with a place. See where it takes you.
            </h2>
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

      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                href="/"
                className="rounded-sm text-xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                Destino AI
              </Link>
              <p className="mt-3 max-w-md text-sm leading-relaxed">
                Explore places and make room for your next journey.
              </p>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
              {navigation.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <Separator className="my-8 bg-ink/20" />
          <p className="text-sm">© 2026 Destino AI</p>
        </div>
      </footer>
    </main>
  );
}
