"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { shouldBypassImageOptimization } from "@/lib/api";

type DestinationImageCarouselProps = {
  images: string[];
  destinationName: string;
  priority?: boolean;
  sizes?: string;
};

export function DestinationImageCarousel({
  images,
  destinationName,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: DestinationImageCarouselProps) {
  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    return <div aria-hidden="true" className="absolute inset-0 bg-cream" />;
  }

  return (
    <Carousel
      aria-label={`${destinationName} photos`}
      opts={{ loop: validImages.length > 1 }}
      className="absolute inset-0 size-full"
    >
      <CarouselContent className="ml-0 h-full" viewportClassName="h-full">
        {validImages.map((src, index) => (
          <CarouselItem key={`${src}-${index}`} className="h-full pl-0">
            <div className="relative size-full">
              <Image
                src={src}
                alt={`${destinationName} photo ${index + 1} of ${validImages.length}`}
                fill
                priority={priority && index === 0}
                unoptimized={shouldBypassImageOptimization(src)}
                sizes={sizes}
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {validImages.length > 1 && (
        <>
          <CarouselPrevious
            aria-label={`Previous ${destinationName} photo`}
            className="left-3 z-10 border-background/80 bg-background/90 text-ink hover:bg-background"
          />
          <CarouselNext
            aria-label={`Next ${destinationName} photo`}
            className="right-3 z-10 border-background/80 bg-background/90 text-ink hover:bg-background"
          />
        </>
      )}
    </Carousel>
  );
}
