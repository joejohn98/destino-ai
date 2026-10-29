"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Destination, api, destinationHref } from "@/lib/api";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "historical", label: "Historical" },
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "adventure", label: "Adventure" },
  { value: "wildlife", label: "Wildlife" },
] as const;

interface DestinationClientProps {
  initialDestinations?: Destination[];
  initialTotalDestinations?: number;
  initialTotalPages?: number;
}

export function DestinationClient({
  initialDestinations = [],
  initialTotalDestinations = 0,
  initialTotalPages = 0,
}: DestinationClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Derive initial state from URL so refresh / shared links work ──────────
  const locationParam = searchParams.get("location") ?? "";
  const searchParam = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const ratingParam = Number(searchParams.get("minRating") ?? "0");
  const ratingFromUrl =
    Number.isFinite(ratingParam) && ratingParam >= 0 && ratingParam <= 5
      ? ratingParam
      : 0;
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10) || 1;

  const [query, setQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.some((c) => c.value === categoryParam) ? categoryParam : "all",
  );
  const [activeLocation, setActiveLocation] = useState(locationParam);
  const [minRating, setMinRating] = useState(ratingFromUrl);
  const [currentPage, setCurrentPage] = useState(pageParam);

  const [destinations, setDestinations] =
    useState<Destination[]>(initialDestinations);
  const [totalDestinations, setTotalDestinations] = useState(
    initialTotalDestinations,
  );
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [, startTransition] = useTransition();

  // ── Sync filter state → URL ────────────────────────────────────────────────
  // KEY FIX: Every filter change is reflected in the browser URL so filters
  // are shareable, bookmarkable, and survive page refresh. The server
  // component in page.tsx reads the same params for the initial SSR render.
  const syncUrl = useCallback(
    (params: {
      q: string;
      category: string;
      location: string;
      minRating: number;
      page: number;
    }) => {
      const qs = new URLSearchParams();
      if (params.q.trim().length >= 2) qs.set("q", params.q.trim());
      if (params.category && params.category !== "all")
        qs.set("category", params.category);
      if (params.location) qs.set("location", params.location);
      if (params.minRating > 0)
        qs.set("minRating", String(params.minRating));
      if (params.page > 1) qs.set("page", String(params.page));

      const newUrl = qs.toString() ? `${pathname}?${qs.toString()}` : pathname;
      // Use replace (not push) so the Back button doesn't replay every keystroke
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setLoadError("");
      try {
        const search = query.trim();
        const res = await api.getDestinations({
          page: currentPage,
          limit: 24,
          ...(search.length >= 2 ? { search } : {}),
          ...(activeLocation ? { location: activeLocation } : {}),
          ...(selectedCategory !== "all" ? { category: selectedCategory } : {}),
          ...(minRating > 0 ? { minRating } : {}),
        });

        if (!isCancelled) {
          startTransition(() => {
            setDestinations(res.data || []);
            setTotalDestinations(res.totalDestinations);
            setTotalPages(res.totalPages);
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error("Failed to load destinations:", error);
        if (!isCancelled) {
          setDestinations([]);
          setTotalDestinations(0);
          setTotalPages(0);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load destinations. Please try again.",
          );
          setIsLoading(false);
        }
      }
    }

    // Debounce text search to avoid hammering the server on every keystroke
    const timer = setTimeout(loadData, query ? 300 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, selectedCategory, activeLocation, minRating, currentPage]);

  // ── Handlers — update React state and sync URL atomically ─────────────────
  const handleSearch = (value: string) => {
    setQuery(value);
    setCurrentPage(1);
    syncUrl({ q: value, category: selectedCategory, location: activeLocation, minRating, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    const cat = value ?? "all";
    setSelectedCategory(cat);
    setCurrentPage(1);
    syncUrl({ q: query, category: cat, location: activeLocation, minRating, page: 1 });
  };

  const handleRatingChange = (value: number) => {
    setMinRating(value);
    setCurrentPage(1);
    syncUrl({
      q: query,
      category: selectedCategory,
      location: activeLocation,
      minRating: value,
      page: 1,
    });
  };

  const handleClearLocation = () => {
    setActiveLocation("");
    setCurrentPage(1);
    syncUrl({ q: query, category: selectedCategory, location: "", minRating, page: 1 });
  };

  const handlePageChange = (next: number) => {
    setCurrentPage(next);
    syncUrl({ q: query, category: selectedCategory, location: activeLocation, minRating, page: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    query.length > 0 ||
    selectedCategory !== "all" ||
    Boolean(activeLocation) ||
    minRating > 0;

  const handleReset = () => {
    setQuery("");
    setSelectedCategory("all");
    setActiveLocation("");
    setMinRating(0);
    setCurrentPage(1);
    syncUrl({ q: "", category: "all", location: "", minRating: 0, page: 1 });
  };

  return (
    <section aria-labelledby="destination-results-heading" className="mt-8">
      {/* Search and Filter Controls */}
      <Card
        variant="editorial"
        className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"
      >
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-background px-5 py-1 text-muted-foreground shadow-xs">
          <Search aria-hidden="true" className="size-5 shrink-0 text-ink" />
          <span className="sr-only">Search destinations or countries</span>
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by destination name, city, or country..."
            className="h-11 border-0 bg-transparent px-0 text-ink shadow-none focus-visible:border-0 focus-visible:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="rounded-full p-1 text-muted-foreground hover:text-ink"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        <div className="flex items-center gap-2">
          {activeLocation && (
            <Badge
              variant="tag"
              className="flex items-center gap-1.5 border-ink bg-white px-3 py-1 text-xs capitalize"
            >
              <span>{activeLocation}</span>
              <button
                type="button"
                onClick={handleClearLocation}
                aria-label={`Remove ${activeLocation} filter`}
                className="hover:text-danger"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasActiveFilters}
            onClick={handleReset}
            className="rounded-full"
          >
            <SlidersHorizontal data-icon="inline-start" />
            Reset filters
          </Button>
        </div>
      </Card>

      <div className="mt-5 flex flex-col gap-2 rounded-marketing border border-line bg-background px-5 py-4 sm:max-w-md sm:flex-row sm:items-center sm:gap-5">
        <label
          htmlFor="minimum-rating"
          className="flex min-w-36 items-center gap-2 text-sm font-medium text-ink"
        >
          <Star aria-hidden="true" className="size-4 fill-pastel-peach text-pastel-peach" />
          Minimum rating
        </label>
        <input
          id="minimum-rating"
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={minRating}
          onChange={(event) => handleRatingChange(Number(event.target.value))}
          aria-valuetext={
            minRating === 0 ? "Any rating" : `${minRating} stars and above`
          }
          className="h-2 w-full cursor-pointer accent-ink"
        />
        <output
          htmlFor="minimum-rating"
          className="min-w-24 text-right text-sm text-muted-foreground"
        >
          {minRating === 0 ? "Any rating" : `${minRating.toFixed(1)}+ stars`}
        </output>
      </div>

      {/* Categories Segmented Control */}
      <div className="mt-6 max-w-full overflow-x-auto pb-1">
        <ToggleGroup
          aria-label="Filter destinations by category"
          value={[selectedCategory]}
          multiple={false}
          onValueChange={(val) => handleCategoryChange(val[0] ?? "all")}
          variant="segmented"
          size="lg"
          className="min-w-max"
        >
          {CATEGORIES.map((cat) => (
            <ToggleGroupItem
              key={cat.value}
              value={cat.value}
              className="px-4 py-2 font-medium"
            >
              {cat.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Results Header */}
      <div className="mt-10 flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-eyebrow font-medium uppercase text-muted-foreground">
            Verified database listings
          </p>
          <h2
            id="destination-results-heading"
            className="mt-1 text-title font-semibold text-ink"
          >
            {activeLocation ? `Destinations in ${activeLocation}` : "All Destinations"}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-4 animate-spin" />
              Loading...
            </span>
          ) : (
            <span>
              Showing {destinations.length} of {totalDestinations}{" "}
              {totalDestinations === 1 ? "place" : "places"}
            </span>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
            <CardTitle role="heading" aria-level={3} className="text-title font-semibold text-ink">
              Destinations could not be loaded.
            </CardTitle>
            <CardDescription className="mt-3 text-base">
              {loadError}
            </CardDescription>
          </CardContent>
        </Card>
      ) : destinations.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              key={destination._id}
              href={destinationHref(destination)}
              aria-label={`Explore ${destination.name}, ${destination.location?.country}`}
              className="group block rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Card
                variant="editorial"
                className="h-full gap-0 p-0 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-t-marketing bg-cream">
                  {destination.imageUrls?.[0] ? (
                    <Image
                      src={destination.imageUrls[0]}
                      alt={destination.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-full bg-cream" />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
                  />
                  <Badge
                    variant="tag"
                    className="absolute bottom-4 left-4 border-background bg-background/90 text-ink capitalize"
                  >
                    {destination.category}
                  </Badge>
                </div>

                <CardHeader className="gap-2 p-6 pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle
                      role="heading"
                      aria-level={3}
                      className="text-title font-semibold text-ink"
                    >
                      {destination.name}
                    </CardTitle>
                    {destination.averageRating > 0 && (
                      <span className="flex shrink-0 items-center gap-1 rounded-sm bg-pastel-peach/30 px-2 py-0.5 text-xs font-semibold text-ink">
                        <Star className="size-3.5 fill-pastel-peach text-pastel-peach" />
                        {destination.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                    {destination.location?.city ? `${destination.location.city}, ` : ""}
                    {destination.location?.country}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-3">
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {destination.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {destination.ratingsCount > 0
                        ? `${destination.ratingsCount} traveler reviews`
                        : "Verified destination"}
                    </span>
                    {destination.bestTimeToVisit && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {destination.bestTimeToVisit}
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="justify-end border-0 bg-transparent p-6 pt-0">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4">
                    Explore
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card variant="editorial" className="mt-8 p-12 text-center sm:p-16">
          <CardContent className="px-0">
            <CardTitle
              role="heading"
              aria-level={3}
              className="text-title font-semibold text-ink"
            >
              No destinations match your search.
            </CardTitle>
            <CardDescription className="mt-3 text-base">
              Try adjusting your search terms or selecting a different category.
            </CardDescription>
            <Button
              type="button"
              variant="outline"
              size="pill"
              onClick={handleReset}
              className="mt-6"
            >
              Show all destinations
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !loadError && totalPages > 1 && (
        <nav
          aria-label="Destination pages"
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </section>
  );
}
