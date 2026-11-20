"use client";

import { Loader2 } from "lucide-react";
import type { Destination } from "@/lib/api";
import { DestinationFilters } from "./destination-filters";
import { DestinationResults } from "./destination-results";
import { useDestinationFilters } from "../_hooks/use-destination-filters";

interface DestinationClientProps {
  initialDestinations?: Destination[];
  initialTotalDestinations?: number;
  initialTotalPages?: number;
}

export function DestinationClient(props: DestinationClientProps) {
  const {
    query,
    selectedCategory,
    activeLocation,
    minRating,
    currentPage,
    destinations,
    totalDestinations,
    totalPages,
    isLoading,
    loadError,
    hasActiveFilters,
    handleSearch,
    handleCategoryChange,
    handleRatingChange,
    handleClearLocation,
    handlePageChange,
    handleReset,
  } = useDestinationFilters(props);

  return (
    <section aria-labelledby="destination-results-heading" className="mt-8">
      <DestinationFilters
        query={query}
        onSearch={handleSearch}
        activeLocation={activeLocation}
        onClearLocation={handleClearLocation}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
        minRating={minRating}
        onRatingChange={handleRatingChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Results Header */}
      <div className="mt-10 flex flex-col items-start gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-eyebrow font-medium uppercase text-muted-foreground">
            Verified database listings
          </p>
          <h2
            id="destination-results-heading"
            className="mt-1 wrap-break-word text-title font-semibold text-ink"
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

      <DestinationResults
        isLoading={isLoading}
        loadError={loadError}
        destinations={destinations}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onReset={handleReset}
        hasActiveFilters={hasActiveFilters}
      />
    </section>
  );
}
