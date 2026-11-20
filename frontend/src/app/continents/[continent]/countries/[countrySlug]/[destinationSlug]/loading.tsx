import { Card } from "@/components/ui/card";

export default function DestinationDetailLoading() {
  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          {/* Breadcrumb skeleton */}
          <div
            aria-hidden="true"
            className="mb-6 flex flex-wrap items-center gap-2 text-sm"
          >
            <div className="h-4 w-16 animate-pulse rounded-sm bg-band/40" />
            <span className="text-muted-foreground">/</span>
            <div className="h-4 w-20 animate-pulse rounded-sm bg-band/30" />
            <span className="text-muted-foreground">/</span>
            <div className="h-4 w-24 animate-pulse rounded-sm bg-band/30" />
            <span className="text-muted-foreground">/</span>
            <div className="h-4 w-28 animate-pulse rounded-sm bg-band/40" />
          </div>

          {/* Hero Card skeleton matching DestinationHeroCard */}
          <Card
            variant="editorial"
            className="grid overflow-hidden p-0 lg:grid-cols-12"
          >
            <div className="relative min-h-80 overflow-hidden bg-band/40 animate-pulse lg:col-span-7 lg:min-h-130">
              <div className="absolute right-6 bottom-6 left-6 flex flex-wrap gap-2">
                <div className="h-6 w-20 rounded-full bg-band/60" />
                <div className="h-6 w-24 rounded-full bg-band/60" />
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-5 lg:p-12">
              <div className="h-3.5 w-32 animate-pulse rounded-sm bg-band/40" />
              <div className="mt-3 h-10 w-3/4 animate-pulse rounded-sm bg-band/40" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded-sm bg-band/30" />
              <div className="mt-6 space-y-2">
                <div className="h-4 w-full animate-pulse rounded-sm bg-band/30" />
                <div className="h-4 w-5/6 animate-pulse rounded-sm bg-band/30" />
                <div className="h-4 w-4/6 animate-pulse rounded-sm bg-band/30" />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="h-10 w-36 animate-pulse rounded-full bg-band/30" />
                <div className="size-10 animate-pulse rounded-full bg-band/30" />
              </div>
            </div>
          </Card>

          {/* Key Facts skeleton (4 cards) */}
          <section aria-label="Loading destination facts" className="mt-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} variant="editorial" className="animate-pulse p-5">
                  <div className="size-8 rounded-full bg-band/40" />
                  <div className="mt-3 h-3.5 w-20 rounded-sm bg-band/30" />
                  <div className="mt-1 h-5 w-28 rounded-sm bg-band/40" />
                  <div className="mt-1 h-3 w-32 rounded-sm bg-band/20" />
                </Card>
              ))}
            </div>
          </section>

          {/* Attractions skeleton */}
          <section aria-label="Loading destination sights" className="mt-14">
            <div className="mb-6 space-y-2">
              <div className="h-3.5 w-28 animate-pulse rounded-sm bg-band/40" />
              <div className="h-7 w-64 animate-pulse rounded-sm bg-band/40" />
              <div className="h-4 w-96 max-w-full animate-pulse rounded-sm bg-band/30" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} variant="app" className="animate-pulse bg-background p-6">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-20 rounded-full bg-band/30" />
                    <div className="h-4 w-12 rounded-sm bg-band/30" />
                  </div>
                  <div className="mt-4 h-6 w-40 rounded-sm bg-band/40" />
                  <div className="mt-2 space-y-1.5">
                    <div className="h-3.5 w-full rounded-sm bg-band/20" />
                    <div className="h-3.5 w-5/6 rounded-sm bg-band/20" />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
