import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ComparisonOutput } from "@/lib/api";

export function ComparisonFailure({
  kind,
  message,
  result,
}: {
  kind: "unavailable" | "invalid_request";
  message: string;
  result?: ComparisonOutput;
}) {
  const unresolved = result?.unresolvedDestinations ?? [];
  const unavailable = kind === "unavailable";

  return (
    <Alert>
      <AlertCircle aria-hidden="true" />
      <AlertTitle>
        {unavailable ? "Destinations not available yet" : "Check the comparison request"}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>{message}</p>
        {unresolved.length > 0 && (
          <p>
            Couldn’t verify: <span className="font-medium text-foreground">{unresolved.join(", ")}</span>
          </p>
        )}
        <p>
          {unavailable
            ? "Use the destination names as they appear in Destino and compare at least two that are available."
            : "Enter two or three destinations and describe what you want to compare."}
        </p>
      </AlertDescription>
    </Alert>
  );
}

