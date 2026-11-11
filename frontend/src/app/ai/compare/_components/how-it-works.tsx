import { Card, CardContent } from "@/components/ui/card";

export function HowItWorks() {
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

