import { Check, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ItineraryOutput } from "@/lib/api";

export function DayCard({
  day,
}: {
  day: NonNullable<ItineraryOutput["days"]>[number];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-cream text-lg font-semibold tabular-nums">
            {String(day.day).padStart(2, "0")}
          </div>
          <div className="min-w-0">
            <p className="flex min-w-0 flex-wrap items-center gap-1.5 break-words text-sm font-medium text-muted-foreground">
              <MapPin aria-hidden="true" className="size-4" />
              {day.destination}
            </p>
            <CardTitle className="mt-1 break-words text-base">{day.theme}</CardTitle>
          </div>
        </div>
        {day.estimatedDailyCost && (
          <Badge
            variant="outline"
            className="self-start tabular-nums sm:ml-auto"
          >
            {day.estimatedDailyCost} / day
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-5 pb-5">
        <Separator />
        <div>
          <h4 className="text-sm font-semibold">Activities</h4>
          {day.activities.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2.5">
              {day.activities.map((activity, index) => (
                <li
                  key={`${activity}-${index}`}
                  className="flex items-start gap-2.5 text-sm leading-6"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lime">
                    <Check aria-hidden="true" className="size-3 text-ink" />
                  </span>
                  <span className="min-w-0 break-words">{activity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No verified activities were returned for this day.
            </p>
          )}
        </div>

        {day.accommodation && (
          <div className="rounded-control bg-canvas p-3">
            <p className="text-xs font-medium text-muted-foreground">Stay</p>
            <p className="mt-1 break-words text-sm">{day.accommodation}</p>
          </div>
        )}

        {day.tips.length > 0 && (
          <div className="rounded-control bg-canvas p-3">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles aria-hidden="true" className="size-4 text-pastel-sky" />
              <p className="text-sm font-semibold">Local tips</p>
              <Badge variant="ai" className="ml-auto">
                AI
              </Badge>
            </div>
            <ul className="flex flex-col gap-2 break-words text-sm leading-6 text-muted-foreground">
              {day.tips.map((tip, index) => (
                <li key={`${tip}-${index}`}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

