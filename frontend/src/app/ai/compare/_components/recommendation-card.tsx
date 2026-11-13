import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ComparisonOutput } from "@/lib/api";

export function RecommendationCard({
  comparison,
}: {
  comparison: ComparisonOutput;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl break-words">
          <Badge variant="ai">AI recommendation</Badge>
          {comparison.recommendation && (
            <h3 className="mt-3 text-title">{comparison.recommendation}</h3>
          )}
          {comparison.recommendationReason && (
            <p className="mt-2 break-words leading-7 text-muted-foreground">
              {comparison.recommendationReason}
            </p>
          )}
        </div>
        {comparison.alternativeAdvice && (
          <div className="w-full rounded-control bg-canvas p-4 lg:max-w-sm">
            <p className="text-sm font-semibold">
              When another option fits better
            </p>
            <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
              {comparison.alternativeAdvice}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

