"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ReviewForm } from "@/components/reviews/review-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError, type Review } from "@/lib/api";
import type { ReviewFormData } from "@/schemas/review.schema";

interface ReviewsSectionProps {
  destinationName: string;
  countrySlug?: string;
  destinationSlug: string;
  initialReviews: Review[];
  initialTotalReviews: number;
  initialTotalPages: number;
}

const PAGE_SIZE = 12;

const byNewest = (a: Review, b: Review) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
  b._id.localeCompare(a._id);

export function ReviewsSection({
  destinationName,
  countrySlug,
  destinationSlug,
  initialReviews,
  initialTotalReviews,
  initialTotalPages,
}: ReviewsSectionProps) {
  const router = useRouter();
  const { user, status } = useAuth();

  const [reviews, setReviews] = useState(() => [...initialReviews].sort(byNewest));
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ownReview = user
    ? reviews.find((review) => review.user?._id === user._id)
    : undefined;
  const canWrite = !!countrySlug && user?.role === "user" && !ownReview;

  // Re-read the list after any change (the API returns the user as an id on
  // create/update), then refresh the server-rendered header so the average
  // rating and review count stay in sync.
  const loadReviews = async (requestedPage: number) => {
    if (!countrySlug) return;

    setLoadingReviews(true);
    try {
      const res = await api.getDestinationReviews(countrySlug, destinationSlug, {
        page: requestedPage,
        limit: PAGE_SIZE,
      });
      setReviews([...(res.data ?? [])].sort(byNewest));
      setPage(res.currentPage);
      setTotalReviews(res.totalReviews);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast.error("Couldn't load reviews", {
        description:
          error instanceof ApiError
            ? error.message
            : "Check your connection and try again.",
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  const reload = async (requestedPage = page) => {
    await loadReviews(requestedPage);
    router.refresh();
  };

  const handleCreate = async (values: ReviewFormData) => {
    if (!countrySlug) return;
    await api.createReview(countrySlug, destinationSlug, values);
    toast.success("Thanks for your review!");
    await reload(1);
  };

  const handleUpdate = async (reviewId: string, values: ReviewFormData) => {
    await api.updateReview(reviewId, values);
    toast.success("Review updated");
    setEditingId(null);
    await reload();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.deleteReview(pendingDelete._id);
      toast.success("Review deleted");
      setPendingDelete(null);
      const pageAfterDelete =
        page > 1 && (page - 1) * PAGE_SIZE >= totalReviews - 1
          ? page - 1
          : page;
      await reload(pageAfterDelete);
    } catch (error) {
      toast.error("Couldn't delete the review", {
        description:
          error instanceof ApiError
            ? error.message
            : "Check your connection and try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const destPath = countrySlug
    ? `/destinations/${encodeURIComponent(countrySlug)}/${encodeURIComponent(destinationSlug)}`
    : `/destinations/${encodeURIComponent(destinationSlug)}`;
  const signInHref = `/signin?next=${encodeURIComponent(destPath)}`;

  return (
    <section aria-labelledby="reviews-heading" className="mt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow font-medium uppercase text-muted-foreground">
            Community feedback
          </p>
          <h2
            id="reviews-heading"
            className="mt-1 text-title font-semibold text-ink"
          >
            Authentic Traveler Reviews
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"} recorded
        </span>
      </div>

      {/* Write a review */}
      {status !== "loading" && (
        <Card variant="editorial" className="mb-6 p-6 sm:p-8">
          {canWrite ? (
            <>
              <h3 className="text-lg font-semibold text-ink">
                Share your experience of {destinationName}
              </h3>
              <p className="mb-5 mt-1 text-sm text-muted-foreground">
                One review per destination. We tag its sentiment and themes
                automatically.
              </p>
              <ReviewForm submitLabel="Post review" onSubmit={handleCreate} />
            </>
          ) : !user ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Been to {destinationName}? Sign in to leave a review.
              </p>
              <Link
                href={signInHref}
                className={buttonVariants({ size: "sm", className: "rounded-full" })}
              >
                Sign in to review
              </Link>
            </div>
          ) : user.role !== "user" ? (
            <p className="text-sm text-muted-foreground">
              Admin accounts can moderate reviews but can&apos;t post them.
            </p>
          ) : ownReview ? (
            <p className="text-sm text-muted-foreground">
              You&apos;ve reviewed {destinationName}. You can edit or delete
              your review below.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Reviews can&apos;t be posted for this destination right now.
            </p>
          )}
        </Card>
      )}

      {reviews.length > 0 ? (
        <ul className="grid gap-5 md:grid-cols-2">
          {reviews.map((review) => {
            const isOwn = !!user && review.user?._id === user._id;
            const canDelete = isOwn || user?.role === "admin";
            const editing = editingId === review._id;

            return (
              <li key={review._id} className={editing ? "md:col-span-2" : undefined}>
                <Card variant="app" className="h-full bg-background p-6">
                  {editing ? (
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
                        onSubmit={(values) => handleUpdate(review._id, values)}
                        onCancel={() => setEditingId(null)}
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-ink">
                              {review.authorName ||
                                "Anonymous Traveler"}
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
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-ink/90">
                        &ldquo;{review.reviewText}&rdquo;
                      </p>

                      {review.themes && review.themes.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line/60 pt-3">
                          {review.themes.map((theme, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-canvas px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              #{theme}
                            </span>
                          ))}
                        </div>
                      )}

                      {(isOwn || canDelete) && (
                        <div className="mt-4 flex gap-2 border-t border-line/60 pt-3">
                          {isOwn && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(review._id)}
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
                              onClick={() => setPendingDelete(review)}
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
              </li>
            );
          })}
        </ul>
      ) : (
        <Card variant="editorial" className="p-8 text-center">
          <MessageSquare aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-base font-medium text-ink">
            No traveler reviews recorded yet for {destinationName}.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be among the first explorers to share verified impressions.
          </p>
        </Card>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Review pages"
          className="mt-6 flex items-center justify-center gap-3"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadReviews(page - 1)}
            disabled={page <= 1 || loadingReviews}
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
            onClick={() => void loadReviews(page + 1)}
            disabled={page >= totalPages || loadingReviews}
          >
            Next
          </Button>
        </nav>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
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
              disabled={deleting}
            >
              Keep review
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
