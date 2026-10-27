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
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { api, ContinentStat } from "@/lib/api";

export const metadata: Metadata = {
  title: "Explore Continents",
  description:
    "Browse continents across the globe and discover verified destinations region by region.",
};

export default async function ContinentsPage() {
  let continents: ContinentStat[] = [];

  try {
    const res = await api.getContinentStats();
    continents = res.data || [];
  } catch (error) {
    console.error("Failed to load continents:", error);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader backHref="/" backLabel="Back home" />

      <main className="flex-1">
        <section
          aria-labelledby="continents-heading"
          className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-10 lg:pb-28 lg:pt-16"
        >
          <div className="mb-10 max-w-3xl sm:mb-14">
            <Badge variant="tag">
              <Globe2 data-icon="inline-start" />
              Browse by region
            </Badge>
            <h1
              id="continents-heading"
              className="mt-4 text-display font-semibold text-ink"
            >
              Explore the world.
            </h1>
            <p className="mt-4 max-w-2xl text-lead text-muted-foreground">
              Every region carries its own rhythm and history. Start broad, then follow
              your curiosity from continent to country and destination.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {continents.map((continent) => (
              <Link
                key={continent.continent}
                href={`/continents/${encodeURIComponent(continent.continent.toLowerCase().replace(/\s+/g, "-"))}`}
                aria-label={`Explore ${continent.continent}`}
                className="group block rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <Card
                  variant="editorial"
                  className="h-full gap-0 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
                >
                  <CardHeader className="gap-3">
                    <Globe2
                      aria-hidden="true"
                      className="size-7 text-pastel-sky"
                      strokeWidth={1.5}
                    />
                    <CardTitle className="text-title font-semibold text-ink">
                      {continent.continent}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                      {continent.countryCount}{" "}
                      {continent.countryCount === 1 ? "country" : "countries"}{" "}
                      · {continent.destinationCount}{" "}
                      {continent.destinationCount === 1
                        ? "destination"
                        : "destinations"}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="border-0 bg-transparent">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4">
                      Explore {continent.continent}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
