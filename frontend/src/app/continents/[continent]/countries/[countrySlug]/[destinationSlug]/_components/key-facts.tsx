import { CalendarDays, Clock3, Star, Ticket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { Destination } from "@/lib/api";

export function DestinationKeyFacts({
  destination,
}: {
  destination: Destination;
}) {
  const facts = [
    {
      icon: Star,
      label: "Traveler rating",
      value:
        destination.averageRating > 0
          ? `${destination.averageRating.toFixed(1)} / 5.0`
          : "Verified place",
      detail:
        destination.ratingsCount > 0
          ? `Based on ${destination.ratingsCount} reviews`
          : "Curated destination",
    },
    {
      icon: CalendarDays,
      label: "Best time to visit",
      value: destination.bestTimeToVisit || "Year-round",
      detail: "Optimal seasonal conditions",
    },
    {
      icon: Ticket,
      label: "Typical entry fee",
      value: destination.ticketPrice || "Free / Varies",
      detail: "Per visitor entry",
    },
    {
      icon: Clock3,
      label: "Opening hours",
      value: destination.openingHours || "Varies by season",
      detail: "Check ahead of visit",
    },
  ];

  return (
    <section
      aria-label="Destination facts"
      className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {facts.map(({ icon: Icon, label, value, detail }) => (
        <Card key={label} variant="editorial" className="p-6">
          <CardHeader className="flex flex-row items-center gap-2 p-0">
            <div className="grid size-8 place-items-center rounded-control bg-background text-ink shadow-2xs">
              <Icon aria-hidden="true" className="size-4" />
            </div>
            <p className="text-eyebrow font-medium uppercase text-muted-foreground">
              {label}
            </p>
          </CardHeader>
          <CardContent className="px-0 pt-4 pb-0">
            <p className="text-xl font-semibold text-ink">{value}</p>
            <CardDescription className="mt-1 text-xs">{detail}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

