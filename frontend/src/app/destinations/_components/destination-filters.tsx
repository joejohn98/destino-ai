import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "historical", label: "Historical" },
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "adventure", label: "Adventure" },
  { value: "wildlife", label: "Wildlife" },
] as const;

export function DestinationFilters({
  query,
  onSearch,
  activeLocation,
  onClearLocation,
  hasActiveFilters,
  onReset,
  minRating,
  onRatingChange,
  selectedCategory,
  onCategoryChange,
}: {
  query: string;
  onSearch: (val: string) => void;
  activeLocation: string;
  onClearLocation: () => void;
  hasActiveFilters: boolean;
  onReset: () => void;
  minRating: number;
  onRatingChange: (val: number) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
}) {
  return (
    <>
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
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by destination name, city, or country..."
            className="h-11 border-0 bg-transparent px-0 text-ink shadow-none focus-visible:border-0 focus-visible:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => onSearch("")}
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
                onClick={onClearLocation}
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
            onClick={onReset}
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
          <Star
            aria-hidden="true"
            className="size-4 fill-pastel-peach text-pastel-peach"
          />
          Minimum rating
        </label>
        <input
          id="minimum-rating"
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={minRating}
          onChange={(event) => onRatingChange(Number(event.target.value))}
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
          onValueChange={(val) => onCategoryChange(val[0] ?? "all")}
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
    </>
  );
}

