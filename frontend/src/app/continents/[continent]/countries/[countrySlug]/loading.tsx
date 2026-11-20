import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function CountryDestinationsLoading() {
  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <section
          aria-labelledby="country-destinations-heading"
          className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-10 lg:pb-28 lg:pt-16"
        >
          {/* Breadcrumb skeleton */}
          <div
            aria-hidden="true"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm"
          >
            <div className="h-4 w-16 animate-pulse rounded-sm bg-band/40" />
            <span className="text-muted-foreground">/</span>
            <div className="h-4 w-20 animate-pulse rounded-sm bg-band/30" />
            <span className="text-muted-foreground">/</span>
            <div className="h-4 w-24 animate-pulse rounded-sm bg-band/40" />
          </div>

          <div className="mb-10 max-w-3xl sm:mb-14">
            <Badge variant="tag" aria-hidden="true">
              <div className="size-4 animate-pulse rounded-full bg-band/40" />
              <div className="h-2.5 w-24 animate-pulse rounded-sm bg-band/40" />
            </Badge>
            <h1
              id="country-destinations-heading"
              className="mt-4 h-11 w-80 max-w-full animate-pulse rounded-sm bg-band/30 sm:h-13"
            >
              <span className="sr-only">Loading destinations</span>
            </h1>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full max-w-xl animate-pulse rounded-sm bg-band/30" />
              <div className="h-4 w-3/4 max-w-lg animate-pulse rounded-sm bg-band/30" />
            </div>
          </div>

          <div
            role="status"
            aria-label="Loading destinations"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                variant="editorial"
                className="animate-pulse gap-0 overflow-hidden p-0"
              >
                <div className="aspect-video w-full bg-band/40" />
                <div className="flex flex-col gap-3 p-6">
                  <div className="h-5 w-2/3 rounded-sm bg-band/40" />
                  <div className="h-3.5 w-1/2 rounded-sm bg-band/30" />
                  <div className="mt-1 h-3.5 w-full rounded-sm bg-band/20" />
                  <div className="h-3.5 w-5/6 rounded-sm bg-band/20" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
