"use client";

import { useEffect } from "react";
import { Globe2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export default function ContinentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Continents route error:", error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4 py-20 text-foreground sm:px-6 lg:px-10">
      <Card variant="editorial" className="w-full max-w-lg p-6 text-center sm:p-10 lg:p-14">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-canvas text-ink">
            <Globe2 aria-hidden="true" className="size-8 text-pastel-sky" />
          </div>
          <div>
            <CardTitle
              role="heading"
              aria-level={1}
              className="text-headline font-semibold text-ink"
            >
              We couldn&apos;t load the regions.
            </CardTitle>
            <CardDescription className="mx-auto mt-3 max-w-sm text-base leading-relaxed">
              Something went wrong while fetching the continent information. Your
              connection may have dropped — try again.
            </CardDescription>
          </div>
          <Button type="button" size="pill" onClick={reset} className="mt-2">
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
