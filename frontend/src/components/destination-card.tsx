import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Card as MotionCard } from "@/components/motion/card";
import { FavoriteButton } from "@/components/favorite-button";
import { DestinationImageCarousel } from "@/components/destination-image-carousel";
import { Destination, destinationHref } from "@/lib/api";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <div className="relative">
      <MotionCard
        variant="muted"
        interactive
        className="group h-full gap-0 rounded-marketing border-0 bg-cream p-0 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-t-marketing bg-cream">
          <DestinationImageCarousel
            images={destination.imageUrls ?? []}
            destinationName={destination.name}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
          />
          <Badge
            variant="tag"
            className="absolute bottom-4 left-4 border-background bg-background/90 text-ink capitalize"
          >
            {destination.category}
          </Badge>
        </div>

        <Link
          href={destinationHref(destination)}
          aria-label={`Explore ${destination.name}, ${destination.location?.country}`}
          className="block rounded-b-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <CardHeader className="gap-2 p-6 pb-0">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <CardTitle
                role="heading"
                aria-level={3}
                className="min-w-0 break-words text-title font-semibold text-ink"
              >
                {destination.name}
              </CardTitle>
              {destination.averageRating > 0 && (
                <span className="flex shrink-0 items-center gap-1 rounded-sm bg-pastel-peach/30 px-2 py-0.5 text-xs font-semibold text-ink">
                  <Star className="size-3.5 fill-pastel-peach text-pastel-peach" />
                  {destination.averageRating.toFixed(1)}
                </span>
              )}
            </div>
            <CardDescription className="flex min-w-0 flex-wrap items-center gap-1.5 break-words text-xs text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              {destination.location?.city ? `${destination.location.city}, ` : ""}
              {destination.location?.country}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-3">
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {destination.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line/60 pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {destination.ratingsCount > 0
                  ? `${destination.ratingsCount} traveler reviews`
                  : "Verified destination"}
              </span>
              {destination.bestTimeToVisit && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {destination.bestTimeToVisit}
                </span>
              )}
            </div>
          </CardContent>

          <CardFooter className="justify-end border-0 bg-transparent p-6 pt-0">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4">
              Explore
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </span>
          </CardFooter>
        </Link>
      </MotionCard>
      <FavoriteButton
        destinationId={destination._id}
        destinationName={destination.name}
        className="absolute right-4 top-4 z-10"
      />
    </div>
  );
}
