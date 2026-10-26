import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Globe2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContinentsHeader } from "@/app/continents/_components/continents-header";

type Country = {
  name: string;
  flag: string;
};

const countries: Record<string, Country[]> = {
  Asia: [
    { name: "India", flag: "🇮🇳" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "Thailand", flag: "🇹🇭" },
    { name: "Indonesia", flag: "🇮🇩" },
    { name: "Vietnam", flag: "🇻🇳" },
    { name: "South Korea", flag: "🇰🇷" },
  ],
  Europe: [
    { name: "Italy", flag: "🇮🇹" },
    { name: "France", flag: "🇫🇷" },
    { name: "Greece", flag: "🇬🇷" },
    { name: "Portugal", flag: "🇵🇹" },
    { name: "Spain", flag: "🇪🇸" },
    { name: "Iceland", flag: "🇮🇸" },
  ],
  "North America": [
    { name: "United States", flag: "🇺🇸" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "Mexico", flag: "🇲🇽" },
    { name: "Costa Rica", flag: "🇨🇷" },
  ],
  "South America": [
    { name: "Brazil", flag: "🇧🇷" },
    { name: "Peru", flag: "🇵🇪" },
    { name: "Colombia", flag: "🇨🇴" },
    { name: "Argentina", flag: "🇦🇷" },
  ],
  Africa: [
    { name: "South Africa", flag: "🇿🇦" },
    { name: "Egypt", flag: "🇪🇬" },
    { name: "Morocco", flag: "🇲🇦" },
    { name: "Kenya", flag: "🇰🇪" },
  ],
  Oceania: [
    { name: "Australia", flag: "🇦🇺" },
    { name: "New Zealand", flag: "🇳🇿" },
    { name: "Fiji", flag: "🇫🇯" },
  ],
};

export const metadata: Metadata = {
  title: "Explore countries | Destino AI",
  description: "Browse countries and find a starting point for your next trip.",
};

export function generateStaticParams() {
  return Object.keys(countries).map((continent) => ({ continent }));
}

export default async function CountriesPage({
  params,
}: {
  params: Promise<{ continent: string }>;
}) {
  const { continent } = await params;
  const list = countries[continent];

  if (!list) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <ContinentsHeader backHref="/continents" backLabel="All regions" />

      <section
        aria-labelledby="continent-heading"
        className="mx-auto max-w-page px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-10 lg:pb-20 lg:pt-20"
      >
        <div className="mb-10 flex items-start gap-4 sm:mb-14 sm:gap-6">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-canvas text-pastel-sky sm:size-16">
            <Globe2 aria-hidden="true" className="size-7 sm:size-8" />
          </div>
          <div>
            <Badge variant="tag">
              <MapPin data-icon="inline-start" />
              Explore by country
            </Badge>
            <h1
              id="continent-heading"
              className="mt-4 text-display font-semibold text-ink"
            >
              {continent}
            </h1>
            <p className="mt-3 max-w-2xl text-lead text-muted-foreground">
              Start with a country and follow your curiosity from there.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
          {list.map((country) => (
            <Link
              key={country.name}
              href={`/destinations?location=${encodeURIComponent(country.name)}`}
              className="group block rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Card
                variant="editorial"
                className="h-full transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
              >
                <CardHeader className="gap-4">
                  <span
                    aria-hidden="true"
                    className="grid size-14 place-items-center rounded-control bg-canvas text-3xl"
                  >
                    {country.flag}
                  </span>
                  <CardTitle className="text-title font-semibold text-ink">
                    {country.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Browse destination ideas in {country.name}.
                  </CardDescription>
                </CardContent>
                <CardFooter className="border-0 bg-transparent p-0 pt-2">
                  <span className="inline-flex items-center gap-2 font-medium text-ink underline underline-offset-4">
                    View destinations
                    <ArrowRight
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
