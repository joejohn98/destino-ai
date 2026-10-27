import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DestinationBrowser } from "@/app/destinations/_components/destination-browser";
import { api, Destination } from "@/lib/api";

export const metadata: Metadata = {
  title: "Explore Destinations",
  description:
    "Browse verified destinations, authentic attractions, and travel insights across the globe.",
};

export default async function DestinationsPage() {
  let initialDestinations: Destination[] = [];

  try {
    const res = await api.getDestinations({ limit: 24 });
    initialDestinations = res.data || [];
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader backHref="/" backLabel="Back home" />

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
            <DestinationBrowser initialDestinations={initialDestinations} />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
