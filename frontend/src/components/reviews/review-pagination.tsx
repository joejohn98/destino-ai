import { Button } from "@/components/ui/button";

export function ReviewPagination({
  page,
  totalPages,
  loading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Review pages"
      className="mt-6 flex items-center justify-center gap-3"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || loading}
      >
        Previous
      </Button>
      <span
        className="min-w-24 text-center text-sm text-muted-foreground"
        aria-live="polite"
      >
        Page {page} of {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || loading}
      >
        Next
      </Button>
    </nav>
  );
}

