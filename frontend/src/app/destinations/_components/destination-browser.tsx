"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
import { Destination, api } from "@/lib/api";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "historical", label: "Historical" },
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "adventure", label: "Adventure" },
  { value: "wildlife", label: "Wildlife" },
] as const;

interface DestinationBrowserProps {
  initialDestinations?: Destination[];
}

export function DestinationBrowser({
  initialDestinations = [],
}: DestinationBrowserProps) {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get("location") || "";

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeLocation, setActiveLocation] = useState(locationParam);
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [isLoading, setIsLoading] = useState(initialDestinations.length === 0);
  const [, startTransition] = useTransition();

  // Load destinations based on active filters
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      try {
        let result: Destination[] = [];

        if (query.trim().length >= 2) {
          const res = await api.searchDestinations(query.trim());
          result = res.data || [];
        } else if (activeLocation) {
          const res = await api.getDestinationsByLocation(activeLocation);
          result = res.data || [];
        } else if (selectedCategory !== "all") {
          const res = await api.getDestinationsByCategory(selectedCategory);
          result = res.data || [];
        } else {
          const res = await api.getDestinations({ limit: 24 });
          result = res.data || [];
        }

        // Apply local category filter if searching or filtering by location
        if ((query.trim().length >= 2 || activeLocation) && selectedCategory !== "all") {
          result = result.filter(
            (d) => d.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        if (!isCancelled) {
          startTransition(() => {
            setDestinations(result);
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error("Failed to load destinations:", error);
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, query ? 300 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, selectedCategory, activeLocation]);

  const hasActiveFilters =
    query.length > 0 || selectedCategory !== "all" || Boolean(activeLocation);

  const handleReset = () => {
    setQuery("");
    setSelectedCategory("all");
    setActiveLocation("");
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by destination name, city, or country..."
            className="h-11 border-0 bg-transparent px-0 text-ink shadow-none focus-visible:border-0 focus-visible:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
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
                onClick={() => setActiveLocation("")}
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

      {/* Categories Segmented Control */}
      <div className="mt-6 max-w-full overflow-x-auto pb-1">
        <ToggleGroup
          aria-label="Filter destinations by category"
          value={[selectedCategory]}
          multiple={false}
          onValueChange={(val) => setSelectedCategory(val[0] ?? "all")}
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
            <span>{destinations.length} {destinations.length === 1 ? "place" : "places"}</span>
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
      ) : destinations.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              key={destination._id}
              href={`/destinations/${destination.slug || destination._id}`}
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
    </section>
  );
}
