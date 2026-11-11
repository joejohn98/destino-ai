import type { ReactNode } from "react";
import { Check, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Metric({
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
      <p
        className={
          emphasis
            ? "text-2xl font-semibold tracking-tight tabular-nums"
            : "text-lg font-semibold tabular-nums"
        }
      >
        {value}
      </p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

export function InfoListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-2">
              <Check
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-success"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function BudgetBreakdownCard({
  breakdown,
}: {
  breakdown: Record<string, string>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated cost breakdown</CardTitle>
        <CardDescription>
          Approximate distribution across the journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(breakdown).map(([category, cost]) => (
            <div key={category} className="rounded-control bg-canvas p-3">
              <dt className="text-xs capitalize text-muted-foreground">
                {category.replace(/([A-Z])/g, " $1").trim()}
              </dt>
              <dd className="mt-1 text-sm font-semibold">{cost}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

export function TravelerTipsCard({ tips }: { tips: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traveler tips for your route</CardTitle>
        <CardDescription>
          Drawn from real traveler reviews of your destinations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <MapPin
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-pastel-sky"
              />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
