"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BookmarkX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export default function FavoritesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Favorites route error:", error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4 py-20 text-foreground sm:px-6 lg:px-10">
      <Card
        variant="editorial"
        className="w-full max-w-lg p-10 text-center sm:p-14"
      >
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-canvas text-ink">
            <BookmarkX
              aria-hidden="true"
              className="size-8 text-pastel-peach"
            />
          </div>
          <div>
            <CardTitle
              role="heading"
              aria-level={1}
              className="text-headline font-semibold text-ink"
            >
              We couldn&apos;t load your favorites.
            </CardTitle>
            <CardDescription className="mx-auto mt-3 max-w-sm text-base leading-relaxed">
              Something went wrong while fetching your saved places. Try again,
              or head back to the destinations page.
            </CardDescription>
          </div>
          <div className="mt-2 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" size="pill" onClick={reset}>
              Try again
            </Button>
            <Button
              variant="outline"
              size="pill"
              nativeButton={false}
              render={<Link href="/destinations" />}
            >
              Browse destinations
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
