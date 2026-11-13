import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Compass,
  RotateCcw,
  Users,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ItineraryOutput } from "@/lib/api";
import { formatInr, formatStyle } from "../_lib/planner-helpers";
import { DayCard } from "./day-card";
import {
  BudgetBreakdownCard,
  InfoListCard,
  Metric,
  TravelerTipsCard,
} from "./itinerary-widgets";

export { Metric, InfoListCard, BudgetBreakdownCard, TravelerTipsCard };

export function ItineraryResult({
  query,
  itinerary,
  onReset,
}: {
  query: string;
  itinerary: ItineraryOutput;
  onReset: () => void;
}) {
  const days = itinerary.days ?? [];
  const route = [...new Set(days.map((day) => day.destination))];
  const travelStyle = formatStyle(itinerary.travelStyle);
  const unresolved = itinerary.unresolvedDestinations ?? [];
  const suggestions = itinerary.suggestedDestinations ?? [];
  const warnings = itinerary.warnings ?? [];
  const assumptions = itinerary.assumptions ?? [];
  const reviewHighlights = itinerary.reviewHighlights ?? [];

  return (
    <section aria-live="polite" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow text-muted-foreground">Your itinerary</p>
          <h2 className="mt-2 break-words text-title">
            {itinerary.title || "Custom India journey"}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="ai">AI-crafted itinerary</Badge>
            {itinerary.travelStyle && (
              <Badge variant="outline">{travelStyle}</Badge>
            )}
            {itinerary.bestTimeToVisit && (
              <Badge variant="outline">{itinerary.bestTimeToVisit}</Badge>
            )}
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          Plan another trip
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-5 sm:p-6">
          <div className="rounded-control bg-canvas p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What you asked for
            </p>
            <p className="mt-2 break-words text-sm leading-6 text-foreground">{query}</p>
          </div>

          {itinerary.summary && (
            <p className="break-words leading-7 text-muted-foreground">
              {itinerary.summary}
            </p>
          )}

          <div className="grid gap-4 rounded-control border p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={<CalendarDays aria-hidden="true" className="size-4" />}
              label="Duration"
              value={`${itinerary.durationDays ?? days.length} days`}
            />
            <Metric
              icon={<Users aria-hidden="true" className="size-4" />}
              label="Party size"
              value={`${itinerary.travellers ?? 1} traveller${(itinerary.travellers ?? 1) === 1 ? "" : "s"}`}
            />
            <Metric
              icon={<Wallet aria-hidden="true" className="size-4" />}
              label="Estimated total"
              value={itinerary.totalEstimatedCost || "On request"}
              detail={
                itinerary.budgetLimit
                  ? `Limit: ${formatInr(itinerary.budgetLimit)}`
                  : undefined
              }
              emphasis
            />
            <Metric
              icon={<Clock3 aria-hidden="true" className="size-4" />}
              label="Per person"
              value={itinerary.perPersonCost || "On request"}
              detail={travelStyle ? `${travelStyle} pace` : undefined}
            />
          </div>

          {route.length > 0 && (
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Compass aria-hidden="true" className="size-4" />
                Route
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {route.map((stop, index) => (
                  <span
                    key={stop}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <span className="font-medium text-foreground">{stop}</span>
                    {index < route.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground"
                      >
                        →
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {unresolved.length > 0 && (
        <Alert role="status">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Some requested stops aren’t in Destino yet</AlertTitle>
          <AlertDescription>
            We couldn’t verify {unresolved.join(", ")} against our database, so
            the plan substitutes nearby verified destinations.
            {suggestions.length > 0 && (
              <span className="mt-2 block">
                Consider exploring: {suggestions.join(", ")}.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {days.length > 0 ? (
        <section
          aria-labelledby="itinerary-days-title"
          className="flex flex-col gap-4"
        >
          <div>
            <p className="text-eyebrow text-muted-foreground">Day-by-day plan</p>
            <h3
              id="itinerary-days-title"
              className="mt-1 text-xl font-semibold"
            >
              Your daily schedule
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            {days.map((day) => (
              <DayCard key={`${day.day}-${day.destination}`} day={day} />
            ))}
          </div>
        </section>
      ) : (
        <Alert>
          <AlertTitle>No daily breakdown available</AlertTitle>
          <AlertDescription>
            {itinerary.message ||
              "The planner could not create a day-by-day breakdown for this request. Please try again with different dates or destinations."}
          </AlertDescription>
        </Alert>
      )}

      {itinerary.budgetBreakdown && (
        <BudgetBreakdownCard breakdown={itinerary.budgetBreakdown} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {assumptions.length > 0 && (
          <InfoListCard
            title="Assumptions & pacing"
            items={assumptions}
          />
        )}
        {warnings.length > 0 && (
          <InfoListCard
            title="Important considerations"
            items={warnings}
          />
        )}
      </div>

      {reviewHighlights.length > 0 && (
        <TravelerTipsCard tips={reviewHighlights} />
      )}
    </section>
  );
}
