"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Send, Sparkles } from "lucide-react";
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
  asFailureState,
  examples,
  getApiFailure,
  type PlannerState,
} from "./_lib/planner-helpers";
import { PlannerSteps } from "./_components/planner-steps";
import { LoadingState } from "./_components/planner-loading";
import { FailureResult } from "./_components/failure-result";
import { ItineraryResult } from "./_components/itinerary-result";

export default function PlanItineraryPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [plannerState, setPlannerState] = useState<PlannerState>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    if (clientError) setClientError(null);
  };

  const generate = async (customQuery?: string) => {
    const targetQuery = (customQuery ?? query).trim();
    if (targetQuery.length < 10) {
      setClientError("Give us a little more to work with (at least 10 characters).");
      return;
    }

    setLoading(true);
    setClientError(null);

    try {
      const response = await api.planItinerary(targetQuery);
      if (response.status === "success" && response.data.itinerary.status === "success") {
        setPlannerState({
          kind: "success",
          query: targetQuery,
          itinerary: response.data.itinerary,
        });
      } else {
        setPlannerState(asFailureState(response));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setPlannerState(getApiFailure(error));
      } else {
        setPlannerState({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Something unexpected happened while planning the itinerary.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void generate();
  };

  return (
    <div className="flex-1 bg-background">
      <main className="mx-auto flex max-w-page flex-col gap-8 px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <header className="flex flex-col gap-3">
          <Badge variant="ai" className="self-start">
            AI Travel Agent
          </Badge>
          <h1 className="text-display font-semibold tracking-tight">
            Plan your next journey with AI
          </h1>
          <p className="max-w-2xl text-lead text-muted-foreground">
            Describe your dream trip in plain language. We&apos;ll research verified
            destinations, daily activities, and budget estimates to build your
            itinerary.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Describe your trip</CardTitle>
            <CardDescription>
              Include destination, duration, budget, travel style, or travellers for
              the sharpest results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field>
                <FieldGroup>
                  <FieldLabel htmlFor="itinerary-query" className="sr-only">
                    Trip description
                  </FieldLabel>
                  <Textarea
                    id="itinerary-query"
                    rows={4}
                    value={query}
                    onChange={(event) => updateQuery(event.target.value)}
                    placeholder="e.g. Plan a 4-day trip to Jaipur for 2 people with a focus on heritage palaces and street food, moderate budget."
                    aria-describedby="query-description query-examples"
                  />
                  <FieldDescription id="query-description">
                    Minimum 10 characters. Plain English works best.
                  </FieldDescription>
                  {clientError && <FieldError errors={[{ message: clientError }]} />}
                </FieldGroup>
              </Field>

              <div id="query-examples" className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Or pick an example prompt:
                </span>
                <div className="flex flex-wrap gap-2">
                  {examples.map((example) => (
                    <Button
                      key={example}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuery(example)}
                      className="text-xs"
                    >
                      {example}
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
                      Building itinerary…
                    </>
                  ) : (
                    <>
                      Plan my itinerary
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
