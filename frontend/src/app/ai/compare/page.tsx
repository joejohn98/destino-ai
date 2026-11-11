"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, GitCompare, Send, Sparkles } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import {
  examples,
  getComparisonFailure,
  stateFromOutput,
  type CompareState,
} from "./_lib/compare-helpers";
import { HowItWorks } from "./_components/how-it-works";
import { LoadingState } from "./_components/compare-loading";
import { ComparisonFailure } from "./_components/comparison-failure";
import { ComparisonResult } from "./_components/comparison-result";

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [compareState, setCompareState] = useState<CompareState>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    if (clientError) setClientError(null);
  };

  const compare = async (customQuery?: string) => {
    const targetQuery = (customQuery ?? query).trim();
    if (targetQuery.length < 10) {
      setClientError("Enter at least 10 characters to compare destinations.");
      return;
    }

    setLoading(true);
    setClientError(null);

    try {
      const response = await api.compareDestinations(targetQuery);
      const comparison = response.data?.comparison || response.data?.result;

      if (!comparison) {
        setCompareState({
          kind: "error",
          message:
            response.message ||
            "The comparison could not be completed. Please try again.",
        });
        return;
      }

      setCompareState(stateFromOutput(targetQuery, comparison));
    } catch (error) {
      if (error instanceof ApiError) {
        setCompareState(getComparisonFailure(error));
      } else {
        setCompareState({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Something unexpected happened while comparing the destinations.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void compare();
  };

  return (
    <div className="flex-1 bg-background">
      <main className="mx-auto flex max-w-page flex-col gap-8 px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <header className="flex flex-col gap-3">
          <Badge variant="ai" className="self-start">
            AI Destination Comparison
          </Badge>
          <h1 className="text-display font-semibold tracking-tight">
            Weigh two or three destinations side by side
          </h1>
          <p className="max-w-2xl text-lead text-muted-foreground">
            Compare verified places with grounded trade-offs, highlights, traveller
            sentiment, and a clear recommendation tailored to what you care about.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>What would you like to compare?</CardTitle>
            <CardDescription>
              Name two or three destinations and describe what matters — weather,
              pace, history, food, or budget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field>
                <FieldGroup>
                  <FieldLabel htmlFor="comparison-query" className="sr-only">
                    Comparison request
                  </FieldLabel>
                  <Textarea
                    id="comparison-query"
                    rows={4}
                    value={query}
                    onChange={(event) => updateQuery(event.target.value)}
                    placeholder="e.g. Compare Hampi and Taj Mahal for a 3-day history trip with a focus on architecture and peaceful exploring."
                    aria-describedby="comparison-query-description comparison-query-examples"
                  />
                  <FieldDescription id="comparison-query-description">
                    Minimum 10 characters. Plain English with clear destination names
                    works best.
                  </FieldDescription>
                  {clientError && <FieldError errors={[{ message: clientError }]} />}
                </FieldGroup>
              </Field>

              <div id="comparison-query-examples" className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Or start with an example comparison:
                </span>
                <div className="flex flex-wrap gap-2">
                  {examples.map((example) => (
                    <Button
                      key={example.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuery(example.query)}
                      className="text-xs"
                    >
                      <GitCompare data-icon="inline-start" aria-hidden="true" />
                      {example.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <span
                  aria-live="polite"
                  className="text-xs tabular-nums text-muted-foreground"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void compare()}
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
