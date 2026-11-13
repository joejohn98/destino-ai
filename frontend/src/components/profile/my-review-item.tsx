import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MyReview } from "@/lib/api";

export function MyReviewItem({
  review,
  onEdit,
  onDelete,
}: {
  review: MyReview;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const continentSlug = review.destination?.continentSlug;
  const countrySlug = review.destination?.countrySlug;
  const destSlug = review.destination?.slug;

  const destHref =
    continentSlug && countrySlug && destSlug
      ? `/continents/${encodeURIComponent(continentSlug)}/countries/${encodeURIComponent(countrySlug)}/${encodeURIComponent(destSlug)}`
      : countrySlug
        ? `/destinations?location=${encodeURIComponent(countrySlug)}`
        : "/destinations";

  return (
    <Card variant="app" className="h-full bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div
            role="img"
            aria-label={`Rated ${review.rating} out of 5`}
            className="flex items-center gap-1"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                aria-hidden="true"
                className={`size-3.5 ${
                  i < review.rating
                    ? "fill-pastel-peach text-pastel-peach"
                    : "text-line-strong"
                }`}
              />
            ))}
          </div>
          {review.sentiment && (
            <Badge
              variant={
                review.sentiment === "positive"
                  ? "success"
                  : review.sentiment === "negative"
                    ? "danger"
                    : "info"
              }
              className="text-xs capitalize"
            >
              {review.sentiment}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground">
        {review.reviewText}
      </p>
      <div className="mt-4 flex flex-col items-start gap-3 border-t border-line/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={destHref}
          className="min-w-0 break-words rounded-sm text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-muted-foreground"
        >
          {review.destination?.name ?? "Deleted destination"}
          <span className="text-muted-foreground">
            {review.destination?.countryName
              ? ` · ${review.destination.countryName}`
              : ""}
          </span>
        </Link>
        <div className="flex w-full flex-wrap justify-end gap-1 sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={!review.destination?.slug}
            aria-label={
              review.destination?.name
                ? `Edit your review of ${review.destination.name}`
                : "Edit review"
            }
          >
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:text-danger"
            onClick={onDelete}
            aria-label="Delete review"
          >
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

