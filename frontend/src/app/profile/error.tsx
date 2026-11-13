"use client";

import { useEffect } from "react";
import { UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Profile route error:", error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4 py-20 text-foreground sm:px-6 lg:px-10">
      <Card variant="editorial" className="w-full max-w-lg p-6 text-center sm:p-10 lg:p-14">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-canvas text-ink">
            <UserCircle2 aria-hidden="true" className="size-8 text-pastel-lavender" />
          </div>
          <div>
            <CardTitle
              role="heading"
              aria-level={1}
              className="text-headline font-semibold text-ink"
            >
              We couldn&apos;t load your profile.
            </CardTitle>
            <CardDescription className="mx-auto mt-3 max-w-sm text-base leading-relaxed">
              Something went wrong while fetching your account details. Try again
              in a moment.
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
