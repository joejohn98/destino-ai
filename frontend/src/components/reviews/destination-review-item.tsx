import { Pencil, Star, Trash2 } from "lucide-react";
import { ReviewForm } from "@/components/reviews/review-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Review } from "@/lib/api";
import type { ReviewFormData } from "@/schemas/review.schema";

export function DestinationReviewItem({
  review,
  destinationName,
  isOwn,
  canDelete,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onRequestDelete,
}: {
  review: Review;
  destinationName: string;
  isOwn: boolean;
  canDelete: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (values: ReviewFormData) => Promise<void>;
  onRequestDelete: () => void;
}) {
  return (
    <Card variant="app" className="h-full bg-background p-6">
      {isEditing ? (
        <>
          <h3 className="mb-4 text-lg font-semibold text-ink">
            Edit your review
          </h3>
          <ReviewForm
            initialValues={{
              rating: review.rating,
              reviewText: review.reviewText,
            }}
            submitLabel="Save changes"
            onSubmit={onUpdate}
            onCancel={onCancelEdit}
          />
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-words font-semibold text-ink">
                  {review.authorName || "Anonymous Traveler"}
                </span>
                {isOwn && (
                  <Badge variant="tag" className="text-xs">
                    You
                  </Badge>
                )}
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
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div
              role="img"
              aria-label={`Rated ${review.rating} out of 5`}
              className="flex shrink-0 items-center gap-1"
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
          </div>

          <p className="mt-4 break-words text-sm leading-relaxed text-ink/90">
            &ldquo;{review.reviewText}&rdquo;
          </p>

          {review.themes && review.themes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line/60 pt-3">
              {review.themes.map((theme, i) => (
                <span
                  key={i}
                  className="max-w-full break-words rounded-full bg-canvas px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  #{theme}
                </span>
              ))}
            </div>
          )}

          {(isOwn || canDelete) && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line/60 pt-3">
              {isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStartEdit}
                  aria-label={`Edit your review of ${destinationName}`}
                >
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRequestDelete}
                  aria-label={
                    isOwn
                      ? `Delete your review of ${destinationName}`
                      : `Delete review by ${review.authorName}`
                  }
                  className="text-danger hover:text-danger"
                >
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

