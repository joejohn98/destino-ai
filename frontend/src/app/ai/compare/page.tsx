"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  GitCompare,
  MapPin,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  api,
  ApiError,
  type ComparisonOutput,
  type ComparedDestination,
} from "@/lib/api";

const examples = [
  {
    label: "Peaceful history · Hampi vs Taj Mahal",
    query:
      "Should I visit Hampi or the Taj Mahal? I love ancient history and photography, but prefer peaceful places to explore on foot.",
  },
  {
    label: "July timing · Leh vs Goa",
    query:
      "I am planning a trip in July during monsoon. Should I go to Leh Ladakh or Goa Beaches?",
  },
  {
    label: "Split interests · Goa vs Rishikesh",
    query:
      "We are a group of friends deciding between Goa Beaches and Rishikesh. Half of us want river rafting and camping, while the other half want to chill by the water.",
  },
  {
    label: "Gentle mountain walks · Ladakh vs Munnar",
    query:
      "Compare Leh Ladakh and Munnar for a couple looking for scenic mountain views and cool weather with moderate walking.",
  },
  {
    label: "Three heritage cities · Jaipur, Varanasi & Jaisalmer",
    query:
      "Compare Jaipur, Varanasi, and Jaisalmer for a 4-day solo cultural trip focused on architectural beauty and vibrant street photography.",
  },
];

type CompareState =
  | { kind: "comparison"; query: string; comparison: ComparisonOutput }
  | {
      kind: "unavailable" | "invalid_request";
      message: string;
      result?: ComparisonOutput;
    }
  | { kind: "error"; message: string }
  | null;

type ComparisonErrorBody = {
  message?: string;
  data?: {
    result?: ComparisonOutput;
    comparison?: ComparisonOutput;
  };
};

function stateFromOutput(query: string, output: ComparisonOutput): CompareState {
  if (output.status === "unavailable" || output.status === "invalid_request") {
    return {
      kind: output.status,
      message:
        output.message ||
        (output.status === "unavailable"
          ? "One or more requested destinations could not be verified."
          : "Compare between two and three destinations at a time."),
      result: output,
    };
  }

  return { kind: "comparison", query, comparison: output };
}

function stateFromApiError(error: ApiError): CompareState {
  const body = error.payload as ComparisonErrorBody | null;
  const result = body?.data?.result ?? body?.data?.comparison;

  if (
    result?.status === "unavailable" ||
    result?.status === "invalid_request"
  ) {
    return {
      kind: result.status,
      message: result.message || body?.message || error.message,
      result,
    };
  }

  if (error.statusCode === 422) {
    return {
      kind: "invalid_request",
      message:
        body?.message ||
        "Enter two or three destination names so Destino can compare them.",
      result,
    };
  }

  if (error.statusCode === 404) {
    return {
      kind: "unavailable",
      message:
        body?.message ||
        "One or more destinations couldn’t be found. Check the names and try again.",
      result,
    };
  }

  return { kind: "error", message: body?.message || error.message };
}

function sentimentVariant(
  sentiment: ComparedDestination["reviewSentiment"],
): "success" | "warning" | "danger" | "info" {
  if (sentiment === "overwhelmingly positive" || sentiment === "mostly positive") {
    return "success";
  }
  if (sentiment === "mixed") return "warning";
  if (sentiment === "mostly negative") return "danger";
  return "info";
}

function readableCategory(category: string) {
  return category.replaceAll("-", " ");
}

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [compareState, setCompareState] = useState<CompareState>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const compare = async () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 10) {
      setValidationError("Describe what you want to compare in at least 10 characters.");
      return;
    }

    setValidationError("");
    setLoading(true);
    setCompareState(null);

    try {
      const response = await api.compareDestinations(trimmedQuery);
      const comparison = response.data?.comparison;

      if (comparison) {
        setCompareState(stateFromOutput(response.data?.query || trimmedQuery, comparison));
      } else if (response.data?.result) {
        setCompareState(stateFromOutput(trimmedQuery, response.data.result));
      } else {
        setCompareState({
          kind: "error",
          message: response.message || "The comparison response did not include any destination details.",
        });
      }
    } catch (error) {
      setCompareState(
        error instanceof ApiError
          ? stateFromApiError(error)
          : {
              kind: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "We couldn’t reach the comparison planner. Please try again.",
            },
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void compare();
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setCompareState(null);
    setValidationError("");
  };

  return (
    <div className="flex-1 bg-canvas text-foreground">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Compare destinations</span>
        </nav>

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-lime text-ink">
              <GitCompare aria-hidden="true" className="size-5" />
            </span>
            <Badge variant="ai">AI destination comparison</Badge>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-display">
              Compare what matters.
              <br className="hidden sm:block" /> Choose with confidence.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lead">
              Compare two or three destinations around your interests, timing,
              and preferred pace. See the trade-offs, evidence, and a clear
              recommendation.
            </p>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What are you deciding between?</CardTitle>
            <CardDescription>
              Name 2–3 destinations and tell us what matters most for this trip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-5">
              <FieldGroup>
                <Field data-invalid={Boolean(validationError)}>
                  <FieldLabel htmlFor="compare-query">Describe your comparison</FieldLabel>
                  <Textarea
                    id="compare-query"
                    value={query}
                    onChange={(event) => updateQuery(event.target.value)}
                    maxLength={500}
                    minLength={10}
                    rows={3}
                    required
                    disabled={loading}
                    aria-invalid={Boolean(validationError)}
                    aria-describedby="compare-query-hint compare-query-count"
                    placeholder="For example: Compare Goa and Rishikesh for a group that wants both rafting and time to relax by the water."
                    className="min-h-28 resize-y bg-background"
                  />
                  {validationError && <FieldError>{validationError}</FieldError>}
                  <FieldDescription id="compare-query-hint">
                    10–500 characters. The comparison supports 2–3 destinations.
                  </FieldDescription>
                </Field>
              </FieldGroup>

              <div className="flex flex-wrap gap-2" aria-label="Example comparisons">
                {examples.map((example) => (
                  <Button
                    key={example.label}
                    type="button"
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="h-auto max-w-full whitespace-normal text-left"
                    onClick={() => updateQuery(example.query)}
                  >
                    {example.label}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span
                  id="compare-query-count"
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
                      Comparing destinations…
                    </>
                  ) : (
                    <>
                      Compare destinations
                      <Send data-icon="inline-end" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {loading && <LoadingState />}
        {!compareState && !loading && <HowItWorks />}

        {compareState?.kind === "comparison" && (
          <ComparisonResult
            query={compareState.query}
            comparison={compareState.comparison}
            onReset={() => setCompareState(null)}
          />
        )}

        {(compareState?.kind === "unavailable" ||
          compareState?.kind === "invalid_request") && (
          <ComparisonFailure
            kind={compareState.kind}
            message={compareState.message}
            result={compareState.result}
          />
        )}

        {compareState?.kind === "error" && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>We couldn’t compare those destinations</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{compareState.message}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => void compare()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Tell us what you value",
      text: "Season, atmosphere, interests, pace — describe it naturally.",
    },
    {
      number: "02",
      title: "See each side clearly",
      text: "Compare grounded destination details and traveller sentiment.",
    },
    {
      number: "03",
      title: "Understand the trade-offs",
      text: "Get one recommendation and when another destination fits better.",
    },
  ];

  return (
    <section aria-label="How destination comparison works" className="grid gap-3 sm:grid-cols-3">
      {steps.map((step) => (
        <Card key={step.number}>
          <CardContent className="flex flex-col gap-4 p-5">
            <span className="text-eyebrow text-muted-foreground">{step.number}</span>
            <div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
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
          <h2 className="font-semibold">Researching the destinations</h2>
          <p className="text-sm text-muted-foreground">
            Checking destination details and traveller reviews.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item}>
            <CardContent className="flex flex-col gap-4 p-5">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ComparisonResult({
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
        <div>
          <p className="text-eyebrow text-muted-foreground">Your comparison</p>
          <h2 className="mt-2 text-title">
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
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{query}</p>
          </div>
          {comparison.userContext && (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
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
              : comparison.message || "This comparison includes only the destinations that could be verified."}
          </AlertDescription>
        </Alert>
      )}

      {destinations.length > 0 ? (
        <section aria-labelledby="destination-profiles-title" className="flex flex-col gap-3">
          <div>
            <p className="text-eyebrow text-muted-foreground">At a glance</p>
            <h3 id="destination-profiles-title" className="mt-1 text-xl font-semibold">
              Destination profiles
            </h3>
          </div>
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination.name} destination={destination} />
            ))}
          </div>
        </section>
      ) : (
        <Alert>
          <AlertTitle>No destination profiles were returned</AlertTitle>
          <AlertDescription>
            Try again with the exact names of two or three destinations listed in Destino.
          </AlertDescription>
        </Alert>
      )}

      {(comparison.comparisonTable?.length ?? 0) > 0 && (
        <section aria-labelledby="criteria-title" className="flex flex-col gap-3">
          <div>
            <p className="text-eyebrow text-muted-foreground">The trade-offs</p>
            <h3 id="criteria-title" className="mt-1 text-xl font-semibold">
              Where each destination wins
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {comparison.comparisonTable?.map((item, index) => (
              <Card key={`${item.criterion}-${index}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 p-5">
                  <CardTitle className="text-base">{item.criterion}</CardTitle>
                  <Badge variant={item.winner.toLowerCase() === "tie" ? "secondary" : "success"}>
                    {item.winner.toLowerCase() === "tie" ? "Tie" : item.winner}
                  </Badge>
                </CardHeader>
                <CardContent className="px-5 pb-5 text-sm leading-6 text-muted-foreground">
                  {item.reason}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {(comparison.recommendation || comparison.recommendationReason || comparison.alternativeAdvice) && (
        <RecommendationCard comparison={comparison} />
      )}
    </section>
  );
}

function DestinationCard({ destination }: { destination: ComparedDestination }) {
  return (
    <Card className="h-full">
      <CardHeader className="gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="outline" className="mb-3 capitalize">
              {readableCategory(destination.category)}
            </Badge>
            <CardTitle className="text-title">{destination.name}</CardTitle>
            <p className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-muted-foreground">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {destination.location}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-control bg-canvas px-2.5 py-1.5 text-sm font-semibold tabular-nums">
            <Star aria-hidden="true" className="size-4 fill-lime text-lime" />
            <span aria-label={`${destination.averageRating} out of 5`}>{destination.averageRating.toFixed(1)}</span>
          </div>
        </div>
        <Badge variant={sentimentVariant(destination.reviewSentiment)} className="self-start capitalize">
          {destination.reviewSentiment}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 p-5">
        <ProsCons title="Highlights" items={destination.pros} positive />
        <ProsCons title="Things to consider" items={destination.cons} />
        <div className="rounded-control bg-canvas p-3">
          <p className="text-xs font-medium text-muted-foreground">Best for</p>
          <p className="mt-1 text-sm leading-6">{destination.bestFor}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Standout fact</p>
          <p className="mt-1 text-sm leading-6">{destination.standoutFact}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProsCons({
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
      <ul className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
        {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
      </ul>
    </div>
  );
}

function RecommendationCard({ comparison }: { comparison: ComparisonOutput }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <Badge variant="ai">AI recommendation</Badge>
          {comparison.recommendation && (
            <h3 className="mt-3 text-title">{comparison.recommendation}</h3>
          )}
          {comparison.recommendationReason && (
            <p className="mt-2 leading-7 text-muted-foreground">
              {comparison.recommendationReason}
            </p>
          )}
        </div>
        {comparison.alternativeAdvice && (
          <div className="w-full rounded-control bg-canvas p-4 lg:max-w-sm">
            <p className="text-sm font-semibold">When another option fits better</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {comparison.alternativeAdvice}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComparisonFailure({
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
