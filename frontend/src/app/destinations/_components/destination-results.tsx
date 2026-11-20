import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { DestinationCard } from "@/components/destination-card";
import type { Destination } from "@/lib/api";

interface DestinationResultsProps {
  isLoading: boolean;
  loadError: string;
  destinations: Destination[];
  totalPages: number;
  currentPage: number;
  hasActiveFilters?: boolean;
  onPageChange: (newPage: number) => void;
  onReset: () => void;
}

export function DestinationResults({
  isLoading,
  loadError,
  destinations,
  totalPages,
  currentPage,
  hasActiveFilters = false,
  onPageChange,
  onReset,
}: DestinationResultsProps) {
  if (isLoading) {
    return (
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
    );
  }

  if (loadError) {
    return (
      <Card variant="editorial" className="mt-8 p-6 text-center sm:p-12 lg:p-16">
        <CardContent className="px-0">
          <CardTitle role="heading" aria-level={3} className="text-title font-semibold text-ink">
            Destinations could not be loaded.
          </CardTitle>
          <CardDescription className="mt-3 text-base">
            {loadError}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (destinations.length === 0) {
    return (
      <Card variant="editorial" className="mt-8 p-6 text-center sm:p-12 lg:p-16">
        <CardContent className="flex flex-col items-center gap-3 p-0">
          <div className="grid size-14 place-items-center rounded-full bg-cream">
            <Compass className="size-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <CardTitle
            role="heading"
            aria-level={3}
            className="text-title font-semibold text-ink"
          >
            {hasActiveFilters
              ? "No destinations match your search."
              : "No destinations added yet."}
          </CardTitle>
          <CardDescription className="mt-1 max-w-sm text-base">
            {hasActiveFilters
              ? "Try adjusting your search terms or selecting a different category."
              : "We're still building out the destinations database. Check back soon."}
          </CardDescription>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="pill"
              onClick={onReset}
              className="mt-4"
            >
              Show all destinations
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => (
          <DestinationCard key={destination._id} destination={destination} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Destination pages"
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </>
  );
}

