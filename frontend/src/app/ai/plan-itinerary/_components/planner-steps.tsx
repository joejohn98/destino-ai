import { Card, CardContent } from "@/components/ui/card";

export function PlannerSteps() {
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

