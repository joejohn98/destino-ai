import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ContinentStat } from "@/lib/api";

export function ContinentsSection({
  continents,
}: {
  continents: ContinentStat[];
}) {
  return (
    <section
      aria-labelledby="continents-heading"
      className="mx-auto max-w-page px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-eyebrow font-medium uppercase text-muted-foreground">
            Start broad, then follow your curiosity
          </p>
          <h2
            id="continents-heading"
            className="text-headline font-semibold text-ink"
          >
            Explore by continent
          </h2>
        </div>
        <Link
          href="/continents"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-muted-foreground"
        >
          All regions
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {continents.map((continent) => (
          <Link
            key={continent.continent}
            href={`/continents/${encodeURIComponent(continent.continent.toLowerCase().replace(/\s+/g, "-"))}`}
            className="group flex min-h-24 items-center justify-between gap-4 rounded-marketing bg-cream p-5 text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <div>
              <h3 className="text-title font-semibold text-ink">
                {continent.continent}
              </h3>
              <p className="text-xs text-muted-foreground">
                {continent.countryCount} countries · {continent.destinationCount} destinations
              </p>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-background transition-transform group-hover:translate-x-1">
              <ArrowUpRight aria-hidden="true" className="size-5 text-ink" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

