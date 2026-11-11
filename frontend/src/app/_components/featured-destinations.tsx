import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  destinationHref,
  shouldBypassImageOptimization,
  type Destination,
} from "@/lib/api";
import { FavoriteButton } from "@/components/favorite-button";

export function FeaturedDestinationsSection({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
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
          <div key={destination._id} className="relative">
            <Link
              href={destinationHref(destination)}
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
                      unoptimized={shouldBypassImageOptimization(destination.imageUrls[0])}
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
            <FavoriteButton
              destinationId={destination._id}
              destinationName={destination.name}
              className="absolute right-4 top-4 z-10"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

