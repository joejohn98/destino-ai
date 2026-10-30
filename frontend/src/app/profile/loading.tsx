import { Card } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="size-16 animate-pulse rounded-full bg-band/40" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-36 animate-pulse rounded-sm bg-band/40" />
            <div className="h-3 w-56 animate-pulse rounded-sm bg-band/30" />
            <div className="h-3 w-44 animate-pulse rounded-sm bg-band/30" />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <Card variant="editorial" className="p-6">
              <div className="h-6 w-32 animate-pulse rounded-sm bg-band/40" />
              <div className="mt-6 flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="h-2.5 w-20 animate-pulse rounded-sm bg-band/30" />
                    <div className="h-9 w-full animate-pulse rounded-control bg-band/30" />
                  </div>
                ))}
                <div className="h-10 w-28 animate-pulse rounded-control bg-band/40" />
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="h-2.5 w-24 animate-pulse rounded-sm bg-band/40" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  variant="editorial"
                  className="animate-pulse gap-0 overflow-hidden p-0"
                >
                  <div className="h-28 w-full bg-band/30" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
