import { Check, MapPin, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ComparedDestination } from "@/lib/api";
import {
  readableCategory,
  sentimentVariant,
} from "../_lib/compare-helpers";

export function ProsCons({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {positive ? (
          <Check aria-hidden="true" className="size-4 text-success" />
        ) : (
          <X aria-hidden="true" className="size-4 text-danger" />
        )}
        {title}
      </p>
      <ul className="flex flex-col gap-2 break-words text-sm leading-6 text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function DestinationCard({
  destination,
}: {
  destination: ComparedDestination;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="outline" className="mb-3 capitalize">
              {readableCategory(destination.category)}
            </Badge>
            <CardTitle className="break-words text-title">{destination.name}</CardTitle>
            <p className="mt-2 flex min-w-0 flex-wrap items-start gap-1.5 break-words text-sm leading-5 text-muted-foreground">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {destination.location}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-control bg-canvas px-2.5 py-1.5 text-sm font-semibold tabular-nums">
            <Star aria-hidden="true" className="size-4 fill-lime text-lime" />
            <span aria-label={`${destination.averageRating} out of 5`}>
              {destination.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
        <Badge
          variant={sentimentVariant(destination.reviewSentiment)}
          className="self-start capitalize"
        >
          {destination.reviewSentiment}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 p-5">
        <ProsCons title="Highlights" items={destination.pros} positive />
        <ProsCons title="Things to consider" items={destination.cons} />
        <div className="rounded-control bg-canvas p-3">
          <p className="text-xs font-medium text-muted-foreground">Best for</p>
          <p className="mt-1 break-words text-sm leading-6">{destination.bestFor}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Standout fact
          </p>
          <p className="mt-1 break-words text-sm leading-6">{destination.standoutFact}</p>
        </div>
      </CardContent>
    </Card>
  );
}

