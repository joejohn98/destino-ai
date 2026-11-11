import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  destinationHref,
  shouldBypassImageOptimization,
  type Destination,
} from "@/lib/api";
import { FavoriteButton } from "@/components/favorite-button";

export function DestinationRelatedSection({
  countryName,
  relatedDestinations,
}: {
  countryName?: string;
  relatedDestinations: Destination[];
}) {
  if (relatedDestinations.length === 0) return null;

  return (
    <section
      aria-labelledby="related-destinations-heading"
      className="mt-16 border-t border-line pt-12"
    >
      <div className="mb-6">
        <p className="text-eyebrow font-medium uppercase text-muted-foreground">
          Keep exploring
        </p>
        <h2
          id="related-destinations-heading"
          className="mt-1 text-title font-semibold text-ink"
        >
          More places in {countryName}
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
  );
}

