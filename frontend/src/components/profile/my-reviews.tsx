"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ReviewForm } from "@/components/reviews/review-form";
import { DeleteReviewDialog } from "@/components/reviews/delete-review-dialog";
import { MyReviewItem } from "@/components/profile/my-review-item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError, type MyReview } from "@/lib/api";
import type { ReviewFormData } from "@/schemas/review.schema";

const PAGE_SIZE = 6;

export function MyReviews() {
  const { status } = useAuth();

  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<MyReview | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MyReview | null>(null);
  const [mutating, setMutating] = useState(false);

  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    api
      .getMyReviews({ page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setReviews(res.data);
        setTotalPages(res.totalPages || 1);
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

  const handleEdit = async (reviewId: string, values: ReviewFormData) => {
    if (!editing) return;
    setMutating(true);
    try {
      await api.updateReview(reviewId, values);
      toast.success("Review updated");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error("Couldn't update the review", {
        description:
          error instanceof ApiError ? error.message : "Try again in a moment.",
      });
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!pendingDelete) return;
    setMutating(true);
    try {
      await api.deleteReview(pendingDelete._id);
      toast.success("Review deleted");
      setPendingDelete(null);
      reload();
    } catch (error) {
      toast.error("Couldn't delete the review", {
        description:
          error instanceof ApiError ? error.message : "Try again in a moment.",
      });
    } finally {
      setMutating(false);
    }
  };

  return (
    <section aria-labelledby="my-reviews-heading" className="flex flex-col gap-6">
      <div>
        <h2 id="my-reviews-heading" className="text-title font-semibold text-ink">
          My reviews
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Reviews you&apos;ve posted on destinations.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="app" className="animate-pulse bg-background p-6">
              <div className="h-4 w-1/4 rounded-sm bg-band/40" />
              <div className="mt-4 h-12 w-full rounded-sm bg-band/20" />
            </Card>
          ))}
        </div>
      ) : loadError ? (
        <Card variant="editorial" className="p-8 text-center">
          <CardContent className="px-0">
            <CardTitle role="heading" aria-level={3} className="text-title font-semibold text-ink">
              Couldn&apos;t load your reviews.
            </CardTitle>
            <CardDescription className="mt-2 text-sm">
              Please check your connection and try again.
            </CardDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                reload();
              }}
              className="mt-4"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card variant="editorial" className="p-8 text-center">
          <CardContent className="px-0">
            <MessageSquare
              aria-hidden="true"
              className="mx-auto size-8 text-muted-foreground"
            />
            <CardTitle role="heading" aria-level={3} className="mt-3 text-base font-medium text-ink">
              You haven&apos;t reviewed any destinations yet.
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Explore destinations and share your impressions.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review._id}>
              <MyReviewItem
                review={review}
                onEdit={() => setEditing(review)}
                onDelete={() => setPendingDelete(review)}
              />
            </li>
          ))}
        </ul>
      )}

      {!loading && !loadError && totalPages > 1 && (
        <nav
          aria-label="My reviews pages"
          className="flex items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              setLoading(true);
              setPage((current) => current - 1);
            }}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              setLoading(true);
              setPage((current) => current + 1);
            }}
          >
            Next
          </Button>
        </nav>
      )}

      {/* Edit dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit review</DialogTitle>
            <DialogDescription>
              {editing?.destination?.name
                ? `Update your review of ${editing.destination.name}.`
                : "Update your review."}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <ReviewForm
              initialValues={{
                rating: editing.rating,
                reviewText: editing.reviewText,
              }}
              submitLabel="Save changes"
              onCancel={() => setEditing(null)}
              onSubmit={(values) => handleEdit(editing._id, values)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteReviewDialog
        open={pendingDelete !== null}
        deleting={mutating}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteReview}
      />
    </section>
  );
}
