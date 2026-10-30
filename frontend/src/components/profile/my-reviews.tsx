"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ReviewForm } from "@/components/reviews/review-form";
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
  DialogFooter,
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

    setLoading(true);
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
    <section aria-labelledby="my-reviews-heading" className="flex flex-col gap-4">
      <div>
        <p className="text-eyebrow font-medium uppercase text-muted-foreground">
          Activity
        </p>
        <h2 id="my-reviews-heading" className="mt-1 text-title font-semibold text-ink">
          My reviews
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="editorial" className="animate-pulse gap-0 p-0">
              <div className="h-24 w-full bg-band/30" />
            </Card>
          ))}
        </div>
      ) : loadError ? (
        <Card variant="editorial" className="p-8 text-center">
          <CardContent className="flex flex-col items-center gap-3 p-0">
            <CardTitle className="text-base text-ink">
              We couldn&apos;t load your reviews.
            </CardTitle>
            <CardDescription>Check your connection and try again.</CardDescription>
            <Button type="button" variant="outline" onClick={reload}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card variant="editorial" className="p-8 text-center">
          <CardContent className="flex flex-col items-center gap-3 p-0">
            <MessageSquare aria-hidden="true" className="size-8 text-muted-foreground" />
            <CardTitle className="text-base text-ink">No reviews yet</CardTitle>
            <CardDescription>
              Review a destination you&apos;ve visited and it will show up here.
            </CardDescription>
            <Button
              size="pill"
              variant="outline"
              render={<Link href="/destinations" />}
            >
              Browse destinations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => {
            const destHref = review.destination?.slug
              ? `/destinations/${encodeURIComponent(review.destination.slug)}${
                  review.destination.countrySlug
                    ? `?country=${encodeURIComponent(review.destination.countrySlug)}`
                    : ""
                }`
              : "/destinations";

            return (
              <li key={review._id}>
                <Card variant="editorial" className="gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          aria-hidden="true"
                          className={
                            value <= review.rating
                              ? "size-4 fill-pastel-peach text-pastel-peach"
                              : "size-4 text-line-strong"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {review.reviewText}
                  </p>
                  <div className="flex items-center justify-between gap-3 border-t border-line/60 pt-3">
                    <Link
                      href={destHref}
                      className="rounded-sm text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-muted-foreground"
                    >
                      {review.destination?.name ?? "Deleted destination"}
                      <span className="text-muted-foreground">
                        {review.destination?.countryName
                          ? ` · ${review.destination.countryName}`
                          : ""}
                      </span>
                    </Link>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(review)}
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
                        onClick={() => setPendingDelete(review)}
                        aria-label="Delete review"
                      >
                        <Trash2 aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
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
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
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
              initialValues={{ rating: editing.rating, reviewText: editing.reviewText }}
              submitLabel="Save changes"
              onCancel={() => setEditing(null)}
              onSubmit={(values) => handleEdit(editing._id, values)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && !mutating && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this review?</DialogTitle>
            <DialogDescription>
              This can&apos;t be undone. The destination&apos;s rating will be
              recalculated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={mutating}
            >
              Keep review
            </Button>
            <Button variant="destructive" onClick={handleDeleteReview} disabled={mutating}>
              {mutating ? "Deleting…" : "Delete review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
