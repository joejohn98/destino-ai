"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DestinationCard } from "@/components/destination-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { api, Destination } from "@/lib/api";

const PAGE_SIZE = 12;

export function FavoritesClient() {
  const router = useRouter();
  const { status, favoriteIds } = useAuth();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Destination[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin?next=%2Ffavorites");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    api
      .getFavorites({ page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setTotalPages(res.totalPages);
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, page, reloadKey]);

  const goToPage = (next: number) => {
    setLoading(true);
    setPage(next);
  };

  // Unsaving a card (optimistically) removes it from the grid right away; a
  // failed request restores it because favoriteIds is rolled back.
  const visible = items.filter((item) => favoriteIds.has(item._id));
  const showSkeleton = status !== "authenticated" || loading;
  const pageExhausted = page > 1 && favoriteIds.size > 0;

  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <p className="text-eyebrow font-medium uppercase text-muted-foreground">
          Saved places
        </p>
        <h1 className="mt-2 text-headline font-semibold text-ink">
          Your favorites
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Destinations you&apos;ve bookmarked, newest first.
        </p>

        {showSkeleton ? (
          <div
            role="status"
            aria-label="Loading your favorites"
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} variant="editorial" className="animate-pulse p-0">
                <div className="aspect-video w-full rounded-t-marketing bg-band/30" />
                <div className="p-6">
                  <div className="h-6 w-3/4 rounded-sm bg-band/40" />
                  <div className="mt-3 h-4 w-1/2 rounded-sm bg-band/20" />
                  <div className="mt-4 h-12 w-full rounded-sm bg-band/20" />
                </div>
              </Card>
            ))}
          </div>
        ) : loadError ? (
          <Card variant="editorial" className="mt-8 p-12 text-center sm:p-16">
            <CardContent className="px-0">
              <CardTitle
                role="heading"
                aria-level={2}
                className="text-title font-semibold text-ink"
              >
                We couldn&apos;t load your favorites
              </CardTitle>
              <CardDescription className="mt-3 text-base">
                Check your connection and try again.
              </CardDescription>
              <Button
                className="mt-6"
                onClick={() => {
                  setLoading(true);
                  setReloadKey((key) => key + 1);
                }}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : visible.length === 0 ? (
          <Card variant="editorial" className="mt-8 p-12 text-center sm:p-16">
            <CardContent className="px-0">
              <Bookmark
                aria-hidden="true"
                className="mx-auto mb-4 size-8 text-muted-foreground"
              />
              <CardTitle
                role="heading"
                aria-level={2}
                className="text-title font-semibold text-ink"
              >
                {pageExhausted
                  ? "No more saved places on this page"
                  : "Nothing saved yet"}
              </CardTitle>
              <CardDescription className="mt-3 text-base">
                {pageExhausted
                  ? "Go back to see the rest of your favorites."
                  : "Tap the bookmark on any destination to keep it here."}
              </CardDescription>
              {pageExhausted ? (
                <Button className="mt-6" onClick={() => goToPage(page - 1)}>
                  Previous page
                </Button>
              ) : (
                <Link
                  href="/destinations"
                  className={buttonVariants({ size: "pill", className: "mt-6" })}
                >
                  Browse destinations
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((destination) => (
                <DestinationCard key={destination._id} destination={destination} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Favorites pagination"
                className="mt-10 flex items-center justify-center gap-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground" aria-live="polite">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                  <ChevronRight aria-hidden="true" />
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
