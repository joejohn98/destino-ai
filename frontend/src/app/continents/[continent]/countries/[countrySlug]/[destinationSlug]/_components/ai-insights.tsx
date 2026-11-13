import { Compass, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Destination } from "@/lib/api";

export function DestinationAiInsights({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <>
      {/* AI Review Summary Inset Panel */}
      {destination.aiReviewSummary && (
        <section aria-labelledby="ai-summary-heading" className="mt-10">
          <div className="rounded-card border border-border bg-canvas p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-full bg-pastel-sky/30">
                  <Sparkles className="size-4 text-ink" />
                </div>
                <h2
                  id="ai-summary-heading"
                  className="text-lg font-semibold text-ink"
                >
                  AI Review Summary
                </h2>
              </div>
              <Badge variant="ai">AI-generated</Badge>
            </div>

            <p className="mt-4 break-words text-base leading-relaxed text-ink">
              {destination.aiReviewSummary}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Compass className="size-3.5 text-pastel-sky" />
                Grounded in {destination.ratingsCount} verified traveler reviews
              </span>
              <span>Synthesized via Gemini AI</span>
            </div>
          </div>
        </section>
      )}

      {/* AI Travel Tips */}
      {destination.travelTips && destination.travelTips.length > 0 && (
        <section aria-labelledby="travel-tips-heading" className="mt-10">
          <Card variant="editorial" className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                  Practical Advice
                </p>
                <h2
                  id="travel-tips-heading"
                  className="mt-1 break-words text-title font-semibold text-ink"
                >
                  Traveler Tips for {destination.name}
                </h2>
              </div>
              <Badge variant="ai">AI-verified tips</Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {destination.travelTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-card bg-background p-4 shadow-2xs"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                  <p className="break-words text-sm leading-relaxed text-ink/90">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </>
  );
}

