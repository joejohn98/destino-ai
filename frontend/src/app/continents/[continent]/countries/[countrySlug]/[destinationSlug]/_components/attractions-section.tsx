import { CalendarDays, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Destination } from "@/lib/api";

export function DestinationAttractionsSection({
  destination,
}: {
  destination: Destination;
}) {
  if (!destination.attractions || destination.attractions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="attractions-heading" className="mt-14">
      <div className="mb-6">
        <p className="text-eyebrow font-medium uppercase text-muted-foreground">
          Sights & Monuments
        </p>
        <h2
          id="attractions-heading"
          className="mt-1 break-words text-title font-semibold text-ink"
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
              <div className="flex flex-wrap items-center justify-between gap-2">
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
              <h3 className="mt-1 break-words text-title font-semibold text-ink">
                {attraction.name}
              </h3>
            </CardHeader>
            {attraction.description && (
              <CardContent className="p-0 pt-3">
                <p className="break-words text-sm leading-relaxed text-muted-foreground">
                  {attraction.description}
                </p>
              </CardContent>
            )}
            <CardFooter className="flex flex-col items-start gap-2 border-t border-line/60 bg-transparent p-0 pt-4 mt-4 text-xs text-muted-foreground">
              {attraction.openingHours && (
                <span className="flex min-w-0 items-center gap-1.5 break-words">
                  <Clock3 className="size-3.5 shrink-0" />
                  {attraction.openingHours}
                </span>
              )}
              {attraction.suggestedDuration && (
                <span className="flex min-w-0 items-center gap-1.5 break-words">
                  <CalendarDays className="size-3.5 shrink-0" />
                  Suggested: {attraction.suggestedDuration}
                </span>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

