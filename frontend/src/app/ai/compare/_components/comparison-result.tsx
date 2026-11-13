import {
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ComparisonOutput } from "@/lib/api";
import { DestinationCard, ProsCons } from "./destination-card";
import { RecommendationCard } from "./recommendation-card";

export { ProsCons, DestinationCard, RecommendationCard };

export function ComparisonResult({
  query,
  comparison,
  onReset,
}: {
  query: string;
  comparison: ComparisonOutput;
  onReset: () => void;
}) {
  const destinations = comparison.destinations ?? [];
  const names = destinations.map((destination) => destination.name);
  const unresolved = comparison.unresolvedDestinations ?? [];
  const isPartial = comparison.status === "partial";

  return (
    <section aria-live="polite" className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-eyebrow text-muted-foreground">Your comparison</p>
          <h2 className="mt-2 break-words text-title">
            {names.length > 0 ? names.join(" vs ") : "Destination comparison"}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="ai">AI-generated comparison</Badge>
            {isPartial && <Badge variant="warning">Partial results</Badge>}
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          New comparison
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="rounded-control bg-canvas p-4">
            <div className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="size-4 text-pastel-sky" />
              <p className="text-sm font-semibold">What you asked us to weigh</p>
            </div>
            <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{query}</p>
          </div>
          {comparison.userContext && (
            <p className="max-w-3xl break-words text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">Key preference: </span>
              {comparison.userContext}
            </p>
          )}
        </CardContent>
      </Card>

      {isPartial && (
        <Alert role="status">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Some requested destinations could not be verified</AlertTitle>
          <AlertDescription>
            {unresolved.length > 0
              ? `This comparison covers the destinations that were found. Not available: ${unresolved.join(", ")}.`
              : comparison.message ||
                "This comparison includes only the destinations that could be verified."}
          </AlertDescription>
        </Alert>
      )}

      {destinations.length > 0 ? (
        <section
          aria-labelledby="destination-profiles-title"
          className="flex flex-col gap-3"
        >
          <div className="min-w-0">
            <p className="text-eyebrow text-muted-foreground">At a glance</p>
            <h3
              id="destination-profiles-title"
              className="mt-1 text-xl font-semibold"
            >
              Destination profiles
            </h3>
          </div>
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.name}
                destination={destination}
              />
            ))}
          </div>
        </section>
      ) : (
        <Alert>
          <AlertTitle>No destination profiles were returned</AlertTitle>
          <AlertDescription>
            Try again with the exact names of two or three destinations listed in
            Destino.
          </AlertDescription>
        </Alert>
      )}

      {(comparison.comparisonTable?.length ?? 0) > 0 && (
        <section
          aria-labelledby="criteria-title"
          className="flex flex-col gap-3"
        >
          <div className="min-w-0">
            <p className="text-eyebrow text-muted-foreground">The trade-offs</p>
            <h3 id="criteria-title" className="mt-1 text-xl font-semibold">
              Where each destination wins
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {comparison.comparisonTable?.map((item, index) => (
              <Card key={`${item.criterion}-${index}`}>
                <CardHeader className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <CardTitle className="min-w-0 break-words text-base">{item.criterion}</CardTitle>
                  <Badge
                    variant={
                      item.winner.toLowerCase() === "tie"
                        ? "secondary"
                        : "success"
                    }
                  >
                    {item.winner.toLowerCase() === "tie" ? "Tie" : item.winner}
                  </Badge>
                </CardHeader>
                <CardContent className="break-words px-5 pb-5 text-sm leading-6 text-muted-foreground">
                  {item.reason}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {(comparison.recommendation ||
        comparison.recommendationReason ||
        comparison.alternativeAdvice) && (
        <RecommendationCard comparison={comparison} />
      )}
    </section>
  );
}
