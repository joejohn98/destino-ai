import { Button } from "@/components/ui/button";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";

export const ADMIN_DESTINATION_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "historical", label: "Historical" },
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "adventure", label: "Adventure" },
  { value: "wildlife", label: "Wildlife" },
] as const;

export function AdminDestinationsFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Field className="w-full lg:max-w-sm">
          <FieldLabel htmlFor="dest-search">Search destinations</FieldLabel>
          <FieldControl
            id="dest-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ADMIN_DESTINATION_CATEGORIES.map((c) => {
          const selected = category === c.value;
          return (
            <Button
              key={c.value}
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(c.value)}
              aria-pressed={selected}
            >
              {c.label}
            </Button>
          );
        })}
      </div>
    </>
  );
}

export function AdminDestinationsPagination({
  page,
  totalPages,
  loading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Admin destination pages"
      className="flex items-center justify-center gap-4"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}

