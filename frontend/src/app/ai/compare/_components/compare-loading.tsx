import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentProgress } from "@/components/ai/agent-progress";

export function LoadingState() {
  return (
    <section aria-busy="true" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="font-semibold">Researching the destinations</h2>
          <AgentProgress label="Thinking through the trade-offs" className="mt-1" />
          <p className="text-sm text-muted-foreground">
            Checking destination details and traveller reviews.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item}>
            <CardContent className="flex flex-col gap-4 p-5">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

