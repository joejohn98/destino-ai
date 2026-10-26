import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContinentsHeader } from "@/app/continents/_components/continents-header";

export const metadata: Metadata = {
  title: "Explore continents | Destino AI",
  description:
    "Browse the continents and find a starting point for your next trip.",
};

const continents = [
  {
    name: "Asia",
    description: "Ancient temples, bustling cities, and breathtaking landscapes",
    image:
      "https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Europe",
    description: "Rich history, world-class art, and charming cobblestone streets",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "North America",
    description: "National parks, vibrant cities, and diverse cultures",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "South America",
    description: "Amazon rainforests, ancient ruins, and carnival spirit",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Africa",
    description: "Safari adventures, ancient wonders, and vibrant cultures",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Oceania",
    description: "Coral reefs, rugged outback, and pristine island escapes",
    image:
      "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=900&q=85",
  },
];

export default function ContinentsPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <ContinentsHeader backHref="/" backLabel="Back home" />

      <section
        aria-labelledby="continents-heading"
        className="mx-auto max-w-page px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-10 lg:pb-28 lg:pt-20"
      >
        <div className="mb-10 max-w-3xl sm:mb-14">
          <Badge variant="tag">
            <Globe2 data-icon="inline-start" />
            Browse by region
          </Badge>
          <h1
            id="continents-heading"
            className="mt-5 text-display font-semibold text-ink"
          >
            Explore the world.
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-muted-foreground">
            Every destination has a different rhythm. Start broad, then follow
            your curiosity from continent to country.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {continents.map((continent) => (
            <Link
              key={continent.name}
              href={`/continents/${encodeURIComponent(continent.name)}`}
              aria-label={`Explore ${continent.name}`}
              className="group block rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Card
                variant="editorial"
                className="h-full transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
              >
                <div className="aspect-video overflow-hidden rounded-media">
                  <img
                    src={continent.image}
                    alt={continent.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
                <CardHeader className="mt-5 gap-2">
                  <CardTitle className="text-title font-semibold text-ink">
                    {continent.name}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {continent.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="border-0 bg-transparent p-0 pt-2">
                  <span className="inline-flex items-center gap-2 font-medium text-ink underline underline-offset-4">
                    Explore region
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
