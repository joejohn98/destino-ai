"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  MapPin,
  RotateCcw,
  Send,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  api,
  ApiError,
  type ItineraryOutput,
  type PlanItineraryResponse,
} from "@/lib/api";

const examples = [
  "Plan a 3-day budget trip to Hampi for 2 travellers under ₹15,000",
  "I want a 5-day cultural trip in Rajasthan under ₹30,000",
  "Plan a 7-day moderate trip for 2 people in Kerala",
];

type PlannerState =
  | { kind: "success"; query: string; itinerary: ItineraryOutput }
  | {
      kind: "unavailable" | "invalid_request";
      message: string;
      result?: ItineraryOutput;
    }
  | { kind: "error"; message: string }
  | null;

type PlannerErrorPayload = {
  message?: string;
  data?: {
    result?: ItineraryOutput;
  };
};

function asFailureState(
  response: PlanItineraryResponse,
): Exclude<PlannerState, null | { kind: "success" }> {
  if (response.status === "fail") {
    const result = response.data?.result;
    const kind =
      result?.status === "invalid_request" ? "invalid_request" : "unavailable";
    return {
      kind,
      message: result?.message || response.message,
      result,
    };
  }

  const result = response.data.itinerary;
  return {
    kind: result.status === "invalid_request" ? "invalid_request" : "unavailable",
    message:
      result.message ||
      "We couldn’t create an itinerary from that request. Try another destination or adjust the trip details.",
    result,
  };
}

function getApiFailure(error: ApiError): PlannerState {
  const payload = error.payload as PlannerErrorPayload | null;
  const result = payload?.data?.result;

  if (result?.status === "unavailable" || result?.status === "invalid_request") {
    return {
      kind: result.status,
      message: result.message || payload?.message || error.message,
      result,
    };
  }

  return {
    kind: "error",
    message: payload?.message || error.message,
  };
}

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStyle(style?: ItineraryOutput["travelStyle"]) {
  if (!style) return null;
  return style.charAt(0).toUpperCase() + style.slice(1);
}

export default function PlannerPage() {
  const [query, setQuery] = useState("");
  const [plannerState, setPlannerState] = useState<PlannerState>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const generate = async () => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 10) {
      setValidationError("Describe your trip in at least 10 characters.");
      return;
    }

    setValidationError("");
    setLoading(true);
    setPlannerState(null);

    try {
      const response = await api.planItinerary(trimmedQuery);
      if (
        response.status === "success" &&
        response.data.itinerary.status === "success"
      ) {
        setPlannerState({
          kind: "success",
          query: response.data.query || trimmedQuery,
          itinerary: response.data.itinerary,
        });
      } else {
        setPlannerState(asFailureState(response));
      }
    } catch (error) {
      setPlannerState(
        error instanceof ApiError
          ? getApiFailure(error)
          : {
              kind: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "We couldn’t reach the planner. Please try again.",
            },
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void generate();
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setPlannerState(null);
    setValidationError("");
  };

  return (
    <div className="min-h-dvh bg-canvas text-foreground">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-lime text-ink">
              <Compass aria-hidden="true" className="size-5" />
            </span>
            <Badge variant="ai">AI trip planner</Badge>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-display">
              Plan the trip.
              <br className="hidden sm:block" /> We’ll do the research.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lead">
              Share the destination, timing, group size, and budget on your mind.
              Get a day-by-day plan based on destinations and traveller insight
              in Destino.
            </p>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What kind of trip are you imagining?</CardTitle>
            <CardDescription>
              Include a destination or region, number of days, travellers, and
              budget if you know them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-5">
              <FieldGroup>
                <Field data-invalid={Boolean(validationError)}>
                  <FieldLabel htmlFor="planner-query">
                    Describe your trip
                  </FieldLabel>
                  <Textarea
                    id="planner-query"
                    value={query}
                    onChange={(event) => updateQuery(event.target.value)}
                    disabled={loading}
                    maxLength={500}
                    minLength={10}
                    rows={4}
                    required
                    aria-invalid={Boolean(validationError)}
                    aria-describedby="planner-query-hint planner-query-count"
                    placeholder="For example: Plan a 5-day cultural trip in Jaipur for 2 people, with a moderate budget."
                    className="min-h-28 resize-y bg-background"
                  />
                  {validationError ? (
                    <FieldError>{validationError}</FieldError>
                  ) : (
                    <FieldDescription id="planner-query-hint">
                      10–500 characters. The planner supports trips up to 30
                      days and groups up to 20 travellers.
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>

              <div className="flex flex-wrap gap-2" aria-label="Example prompts">
                {examples.map((example) => (
                  <Button
                    key={example}
                    type="button"
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="h-auto max-w-full whitespace-normal text-left"
                    onClick={() => updateQuery(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span
                  id="planner-query-count"
                  className="text-xs tabular-nums text-muted-foreground"
                  aria-live="polite"
                >
                  {query.length}/500 characters
                </span>
                <Button
                  type="submit"
                  disabled={query.trim().length < 10 || loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Sparkles data-icon="inline-start" aria-hidden="true" />
                      Researching your trip…
                    </>
                  ) : (
                    <>
                      Generate itinerary
                      <Send data-icon="inline-end" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {loading && <LoadingState />}

        {!plannerState && !loading && <PlannerSteps />}

        {plannerState?.kind === "success" && (
          <ItineraryResult
            query={plannerState.query}
            itinerary={plannerState.itinerary}
            onReset={() => setPlannerState(null)}
          />
        )}

        {(plannerState?.kind === "unavailable" ||
          plannerState?.kind === "invalid_request") && (
          <FailureResult
            kind={plannerState.kind}
            message={plannerState.message}
            result={plannerState.result}
            onChooseDestination={(destination) =>
              updateQuery(`Plan a trip to ${destination}`)
            }
          />
        )}

        {plannerState?.kind === "error" && (
          <Alert variant="destructive" role="alert">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>We couldn’t build that itinerary</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{plannerState.message}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void generate()}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}

function PlannerSteps() {
  const steps = [
    {
      number: "01",
      title: "Tell us what matters",
      description: "Destination, pace, people, and budget — all in your words.",
    },
    {
      number: "02",
      title: "We check the details",
      description: "The planner researches listed destinations, tips, and costs.",
    },
    {
      number: "03",
      title: "Get your day-by-day plan",
      description: "Review activities, daily estimates, and practical notes.",
    },
  ];

  return (
    <section aria-label="How trip planning works" className="grid gap-3 sm:grid-cols-3">
      {steps.map((step) => (
        <Card key={step.number}>
          <CardContent className="flex flex-col gap-4 p-5">
            <span className="text-eyebrow text-muted-foreground">{step.number}</span>
            <div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function LoadingState() {
  return (
    <section aria-live="polite" aria-busy="true" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Sparkles aria-hidden="true" className="size-5 text-pastel-sky" />
        <div>
          <h2 className="font-semibold">Researching your itinerary</h2>
          <p className="text-sm text-muted-foreground">
            Checking destinations, traveller notes, and the trip estimate.
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function ItineraryResult({
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
  const budgetItems = itinerary.budgetBreakdown
    ? [
        ["Accommodation", itinerary.budgetBreakdown.accommodation],
        ["Food", itinerary.budgetBreakdown.food],
        ["Local transport", itinerary.budgetBreakdown.localTransport],
        ["Activities", itinerary.budgetBreakdown.activities],
        ["Intercity transport", itinerary.budgetBreakdown.intercityTransport],
      ]
    : [];

  return (
    <section aria-live="polite" className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="ai">AI-generated itinerary</Badge>
          <h2 className="mt-3 text-title">
            {itinerary.title || "Your trip itinerary"}
          </h2>
          {itinerary.summary && (
            <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
              {itinerary.summary}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Planned from your request: <span className="text-foreground">{query}</span>
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          New itinerary
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {itinerary.totalEstimatedCost && (
            <Metric
              icon={<Wallet aria-hidden="true" />}
              label="Estimated total"
              value={itinerary.totalEstimatedCost}
              detail="Trip estimate"
              emphasis
            />
          )}
          {itinerary.perPersonCost && (
            <Metric
              icon={<Users aria-hidden="true" />}
              label="Per person"
              value={itinerary.perPersonCost}
              detail={itinerary.travellers ? `For ${itinerary.travellers} travellers` : undefined}
            />
          )}
          {itinerary.durationDays !== undefined && itinerary.durationDays > 0 && (
            <Metric
              icon={<CalendarDays aria-hidden="true" />}
              label="Duration"
              value={`${itinerary.durationDays} ${itinerary.durationDays === 1 ? "day" : "days"}`}
              detail={itinerary.travellers ? `${itinerary.travellers} travellers` : undefined}
            />
          )}
          {travelStyle && (
            <Metric
              icon={<Compass aria-hidden="true" />}
              label="Travel style"
              value={travelStyle}
              detail={
                itinerary.budgetLimit != null
                  ? `Budget limit ${formatInr(itinerary.budgetLimit)}`
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-eyebrow text-muted-foreground">Your plan</p>
              <h3 className="mt-1 text-xl font-semibold">Day by day</h3>
            </div>
            {route.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden="true" className="size-4" />
                <span>{route.join(" · ")}</span>
              </div>
            )}
          </div>

          {days.length > 0 ? (
            <ol className="flex flex-col gap-3">
              {days.map((day) => (
                <li key={`${day.day}-${day.destinationId}`}>
                  <DayCard day={day} />
                </li>
              ))}
            </ol>
          ) : (
            <Alert>
              <AlertTitle>No daily schedule was returned</AlertTitle>
              <AlertDescription>
                The planner returned a successful response without day details.
                Try generating the itinerary again.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {budgetItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Estimated budget</CardTitle>
                <CardDescription>Breakdown returned by the planner</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {budgetItems.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-right font-medium tabular-nums">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {itinerary.bestTimeToVisit && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3 aria-hidden="true" className="size-4 text-muted-foreground" />
                  Best time to visit
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {itinerary.bestTimeToVisit}
              </CardContent>
            </Card>
          )}

          {itinerary.assumptions && itinerary.assumptions.length > 0 && (
            <InfoListCard title="Planning assumptions" items={itinerary.assumptions} />
          )}
          {itinerary.reviewHighlights && itinerary.reviewHighlights.length > 0 && (
            <InfoListCard title="Traveller highlights" items={itinerary.reviewHighlights} />
          )}
        </aside>
      </div>

      {itinerary.warnings && itinerary.warnings.length > 0 && (
        <Alert>
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Worth knowing before you go</AlertTitle>
          <AlertDescription>
            <ul className="flex list-disc flex-col gap-2 pl-4">
              {itinerary.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}

function DayCard({ day }: { day: NonNullable<ItineraryOutput["days"]>[number] }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-cream text-lg font-semibold tabular-nums">
            {String(day.day).padStart(2, "0")}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin aria-hidden="true" className="size-4" />
              {day.destination}
            </p>
            <CardTitle className="mt-1 text-base">{day.theme}</CardTitle>
          </div>
        </div>
        {day.estimatedDailyCost && (
          <Badge variant="outline" className="self-start tabular-nums sm:ml-auto">
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
                <li key={`${activity}-${index}`} className="flex items-start gap-2.5 text-sm leading-6">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lime">
                    <Check aria-hidden="true" className="size-3 text-ink" />
                  </span>
                  <span>{activity}</span>
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
            <p className="mt-1 text-sm">{day.accommodation}</p>
          </div>
        )}

        {day.tips.length > 0 && (
          <div className="rounded-control bg-canvas p-3">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles aria-hidden="true" className="size-4 text-pastel-sky" />
              <p className="text-sm font-semibold">Local tips</p>
              <Badge variant="ai" className="ml-auto">AI</Badge>
            </div>
            <ul className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
              {day.tips.map((tip, index) => <li key={`${tip}-${index}`}>{tip}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
  emphasis = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={emphasis ? "text-2xl font-semibold tracking-tight tabular-nums" : "text-lg font-semibold tabular-nums"}>
        {value}
      </p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

function InfoListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-2">
              <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function FailureResult({
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
