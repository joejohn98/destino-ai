import { Card } from "@/components/ui/card";

export default function FavoritesLoading() {
  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <p className="h-3.5 w-24 animate-pulse rounded-sm bg-band/40" />
        <h1 className="mt-2 h-8 w-52 max-w-full animate-pulse rounded-sm bg-band/30 sm:h-9">
          <span className="sr-only">Loading favorites</span>
        </h1>
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-sm bg-band/30" />

        <div
          role="status"
          aria-label="Loading favorite destinations"
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
  );
}
