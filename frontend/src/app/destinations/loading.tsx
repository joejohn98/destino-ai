import { Card } from "@/components/ui/card";

export default function DestinationsLoading() {
  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <div className="mx-auto max-w-page px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-10">
          <div className="max-w-3xl">
            <div className="h-4 w-24 animate-pulse rounded-sm bg-band/40" />
            <div className="mt-3 h-11 w-72 max-w-full animate-pulse rounded-sm bg-band/30 sm:h-14" />
            <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-sm bg-band/30" />
            <div className="mt-2 h-4 w-3/4 max-w-lg animate-pulse rounded-sm bg-band/30" />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-1">
            <Card variant="editorial" className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
              <div className="h-10 flex-1 animate-pulse rounded-full bg-band/30" />
              <div className="mx-1 flex items-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-band/30" />
                ))}
              </div>
            </Card>
          </div>

          <div
            role="status"
            aria-label="Loading destinations"
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
        </div>
      </main>
    </div>
  );
}
