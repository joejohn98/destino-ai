import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ContinentDetailLoading() {
  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <section
          aria-labelledby="continent-detail-heading"
          className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-10 lg:pb-28 lg:pt-16"
        >
          {/* Breadcrumb skeleton */}
          <div
            aria-hidden="true"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm"
          >
            <div className="h-4 w-16 animate-pulse rounded-sm bg-band/40" />
            <span className="text-muted-foreground">/</span>
            <div className="h-4 w-24 animate-pulse rounded-sm bg-band/40" />
          </div>

          <div className="mb-10 max-w-3xl sm:mb-14">
            <Badge variant="tag" aria-hidden="true">
              <div className="size-4 animate-pulse rounded-full bg-band/40" />
              <div className="h-2.5 w-20 animate-pulse rounded-sm bg-band/40" />
            </Badge>
            <h1
              id="continent-detail-heading"
              className="mt-4 h-11 w-72 max-w-full animate-pulse rounded-sm bg-band/30 sm:h-13"
            >
              <span className="sr-only">Loading continent</span>
            </h1>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full max-w-xl animate-pulse rounded-sm bg-band/30" />
              <div className="h-4 w-3/4 max-w-lg animate-pulse rounded-sm bg-band/30" />
            </div>
          </div>

          <div
            role="status"
            aria-label="Loading countries"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                variant="editorial"
                className="animate-pulse gap-3 p-7"
              >
                <div className="size-7 rounded-full bg-band/40" />
                <div className="h-7 w-44 max-w-full rounded-sm bg-band/40" />
                <div className="h-3.5 w-52 max-w-full rounded-sm bg-band/30" />
                <div className="h-4 w-48 max-w-full rounded-sm bg-band/30" />
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
