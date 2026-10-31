import { Suspense } from "react";
import type { Metadata } from "next";
import { DestinationClient } from "@/app/destinations/_components/destination-client";
import { api, Destination } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Destinations",
  description:
    "Browse verified destinations, authentic attractions, and travel insights across the globe.",
};

type DestinationsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
    category?: string | string[];
    minRating?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DestinationsPage({
  searchParams,
}: DestinationsPageProps) {
  const filters = await searchParams;
  const search = firstSearchParam(filters.q);
  const location = firstSearchParam(filters.location);
  const category = firstSearchParam(filters.category);
  const rawMinRating = Number(firstSearchParam(filters.minRating));
  const minRating =
    Number.isFinite(rawMinRating) && rawMinRating > 0 && rawMinRating <= 5
      ? rawMinRating
      : undefined;
  let initialDestinations: Destination[] = [];
  let initialTotalDestinations = 0;
  let initialTotalPages = 0;

  try {
    const res = await api.getDestinations({
      limit: 24,
      ...(search && search.trim().length >= 2
        ? { search: search.trim() }
        : {}),
      ...(location ? { location } : {}),
      ...(category ? { category } : {}),
      ...(minRating !== undefined ? { minRating } : {}),
    });
    initialDestinations = res.data || [];
    initialTotalDestinations = res.totalDestinations;
    initialTotalPages = res.totalPages;
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
  }

  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-eyebrow font-medium uppercase text-muted-foreground">
              Explore
            </p>
            <h1 className="mt-3 text-display font-semibold text-ink">
              Find your next place.
            </h1>
            <p className="mt-4 max-w-2xl text-lead text-muted-foreground">
              Browse verified recommendations from historic monuments to mountain
              escapes, then follow your curiosity wherever it leads.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-video animate-pulse rounded-marketing bg-band/20" />
                ))}
              </div>
            }
          >
            <DestinationClient
              initialDestinations={initialDestinations}
              initialTotalDestinations={initialTotalDestinations}
              initialTotalPages={initialTotalPages}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
