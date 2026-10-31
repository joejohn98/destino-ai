import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FavoriteButton } from "@/components/favorite-button";
import {
  Destination,
  destinationHref,
  shouldBypassImageOptimization,
} from "@/lib/api";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <div className="relative">
      <Link
        href={destinationHref(destination)}
        aria-label={`Explore ${destination.name}, ${destination.location?.country}`}
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
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
            />
            <Badge
              variant="tag"
              className="absolute bottom-4 left-4 border-background bg-background/90 text-ink capitalize"
            >
              {destination.category}
            </Badge>
          </div>

          <CardHeader className="gap-2 p-6 pb-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle
                role="heading"
                aria-level={3}
                className="text-title font-semibold text-ink"
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
            <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              {destination.location?.city ? `${destination.location.city}, ` : ""}
              {destination.location?.country}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-3">
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {destination.description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs text-muted-foreground">
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
        </Card>
      </Link>
      <FavoriteButton
        destinationId={destination._id}
        destinationName={destination.name}
        className="absolute right-4 top-4 z-10"
      />
    </div>
  );
}
