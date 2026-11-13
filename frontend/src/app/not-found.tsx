import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NotFoundGlitch } from "@/components/not-found-glitch";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6 lg:px-10">
        <Card variant="editorial" className="max-w-lg p-6 text-center sm:p-10 lg:p-14">
          <CardContent className="p-0">
            <NotFoundGlitch />
            <p className="mt-6 text-eyebrow font-medium uppercase text-muted-foreground">
              404 — Destination Not Found
            </p>
            <h1 className="mt-3 text-headline font-semibold text-ink">
              Lost off the map?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The page or destination you are searching for might have moved, or is not yet registered in our database.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/destinations" className={buttonVariants({ size: "pill" })}>
                Explore destinations
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="/"
                className={buttonVariants({ variant: "outline", size: "pill" })}
              >
                Return home
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
