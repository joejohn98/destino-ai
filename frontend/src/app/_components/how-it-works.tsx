import { Compass, ListChecks, PencilLine, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const steps = [
  {
    number: "01",
    label: "Explore verified places",
    title: "Browse real destinations.",
    description:
      "Every destination is backed by real sights, reviews, opening hours, and travel data.",
    icon: Compass,
    iconClass: "text-pastel-lavender",
  },
  {
    number: "02",
    label: "AI summaries & tips",
    title: "Grounded travel insights.",
    description:
      "Read AI-generated summaries and practical tips synthesized directly from verified traveler reviews.",
    icon: Sparkles,
    iconClass: "text-pastel-sky",
  },
  {
    number: "03",
    label: "Authentic attractions",
    title: "Verified sights & monuments.",
    description:
      "Explore curated attractions, tickets, timings, and suggested durations for each place.",
    icon: ListChecks,
    iconClass: "text-pastel-peach",
  },
  {
    number: "04",
    label: "Curate your route",
    title: "Discover by continent & country.",
    description:
      "Filter by region, category, or style to plan a journey that matches your pace.",
    icon: PencilLine,
    iconClass: "text-pastel-pink",
  },
];

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-cream py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-10">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <p className="mb-3 text-eyebrow font-medium uppercase text-muted-foreground">
            Grounded in database insights
          </p>
          <h2
            id="how-it-works-heading"
            className="text-headline font-semibold text-ink"
          >
            How Destino AI works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lead text-muted-foreground">
            No hallucinated destinations. Real traveler experiences, verified
            attractions, and honest insights.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} variant="app" className="bg-background p-6">
                <CardHeader className="gap-4 p-0">
                  <div className="flex items-center justify-between">
                    <Icon
                      aria-hidden="true"
                      className={`size-8 ${step.iconClass}`}
                      strokeWidth={1.6}
                    />
                    <span className="text-eyebrow font-medium tabular-nums text-muted-foreground">
                      {step.number}
                    </span>
                  </div>
                  <p className="text-eyebrow font-medium uppercase text-muted-foreground">
                    {step.label}
                  </p>
                  <h3 className="text-title font-semibold text-ink">
                    {step.title}
                  </h3>
                </CardHeader>
                <CardContent className="p-0 pt-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

