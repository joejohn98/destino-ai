import { Card } from "@/components/ui/card";

export function AdminRowSkeleton() {
  return (
    <Card variant="app" className="gap-3 p-4 sm:flex-row sm:items-center">
      <div className="h-20 w-28 shrink-0 animate-pulse rounded-lg bg-band/30" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded-sm bg-band/40" />
        <div className="h-3 w-28 animate-pulse rounded-sm bg-band/20" />
      </div>
    </Card>
  );
}

