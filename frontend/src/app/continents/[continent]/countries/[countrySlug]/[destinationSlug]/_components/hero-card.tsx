import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { Destination } from "@/lib/api";
import { FavoriteButton } from "@/components/favorite-button";
import { DestinationImageCarousel } from "@/components/destination-image-carousel";

export function DestinationHeroCard({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <Card
      variant="editorial"
      className="grid overflow-hidden p-0 lg:grid-cols-12"
    >
      <div className="relative min-h-80 overflow-hidden lg:col-span-7 lg:min-h-130">
        <DestinationImageCarousel
          images={destination.imageUrls ?? []}
          destinationName={destination.name}
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent"
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
  );
}

