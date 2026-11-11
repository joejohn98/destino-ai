import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ItineraryOutput } from "@/lib/api";

export function FailureResult({
  kind,
  message,
  result,
  onChooseDestination,
}: {
  kind: "unavailable" | "invalid_request";
  message: string;
  result?: ItineraryOutput;
  onChooseDestination: (destination: string) => void;
}) {
  const unavailable = kind === "unavailable";
  const unresolved = result?.unresolvedDestinations ?? [];
  const suggestions = result?.suggestedDestinations ?? [];

  return (
    <section aria-live="polite">
      <Alert role="status">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>
          {unavailable ? "Destination not available yet" : "Trip details need an adjustment"}
        </AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-4">
          <p>{message}</p>
          {unresolved.length > 0 && (
            <p>
              We couldn’t verify: <span className="font-medium text-foreground">{unresolved.join(", ")}</span>
            </p>
          )}
          {suggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-medium text-foreground">Try one of these listed destinations</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((destination) => (
                  <Button
                    key={destination}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onChooseDestination(destination)}
                  >
                    {destination}
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm">
            {unavailable
              ? "Choose a destination available in Destino, or try a more specific city name."
              : "Keep the trip within 1–30 days and no more than 20 travellers, then submit again."}
          </p>
        </AlertDescription>
      </Alert>
    </section>
  );
}

