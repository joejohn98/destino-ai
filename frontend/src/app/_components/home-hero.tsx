import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  destinationHref,
  shouldBypassImageOptimization,
  type Destination,
} from "@/lib/api";

export function HomeHeroSection({
  heroDestination,
}: {
  heroDestination?: Destination;
}) {
  return (
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

      {heroDestination && (
        <div className="mx-auto max-w-page px-4 pb-12 sm:px-6 sm:pb-16 lg:px-10 lg:pb-20">
          <Link
            href={destinationHref(heroDestination)}
            className="group block overflow-hidden rounded-marketing bg-canvas p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:p-4"
          >
            <div className="relative aspect-21/9 min-h-72 w-full overflow-hidden rounded-media bg-cream">
              {heroDestination.imageUrls?.[0] ? (
                <Image
                  src={heroDestination.imageUrls[0]}
                  alt={heroDestination.name}
                  fill
                  unoptimized={shouldBypassImageOptimization(heroDestination.imageUrls[0])}
                  priority
                  sizes="(max-width: 1024px) 100vw, 1620px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
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
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-ink shadow-xs transition-transform group-hover:translate-x-1">
                  <span>Discover {heroDestination.name}</span>
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </section>
  );
}

