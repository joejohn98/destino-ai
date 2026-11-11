import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentProgress } from "@/components/ai/agent-progress";

export function LoadingState() {
  return (
    <section aria-busy="true" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="font-semibold">Researching your itinerary</h2>
          <AgentProgress label="Thinking through your itinerary" className="mt-1" />
          <p className="text-sm text-muted-foreground">
            Checking destinations, traveller notes, and the trip estimate.
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

