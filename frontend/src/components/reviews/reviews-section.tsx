"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ReviewForm } from "@/components/reviews/review-form";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, ApiError, type Review } from "@/lib/api";
import type { ReviewFormData } from "@/schemas/review.schema";
import { DeleteReviewDialog } from "@/components/reviews/delete-review-dialog";
import { DestinationReviewItem } from "@/components/reviews/destination-review-item";
import { ReviewPagination } from "@/components/reviews/review-pagination";

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
    toast.success("Review posted", {
      description: "Thanks for sharing your impressions.",
    });
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
      const nextPage = reviews.length === 1 && page > 1 ? page - 1 : page;
      await reload(nextPage);
    } catch (error) {
      toast.error("Couldn't delete the review", {
        description:
          error instanceof ApiError ? error.message : "Try again in a moment.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="mt-12">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow font-medium uppercase text-muted-foreground">
            Traveler impressions
          </p>
          <h2 id="reviews-heading" className="mt-1 text-headline font-semibold text-ink">
            Reviews & experiences
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"} recorded
        </p>
      </div>

      {canWrite && (
        <Card variant="editorial" className="mb-8 p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-semibold text-ink">
            Share your experience
          </h3>
          <ReviewForm onSubmit={handleCreate} submitLabel="Post review" />
        </Card>
      )}

      {status === "unauthenticated" && (
        <Card variant="editorial" className="mb-8 p-6 text-center sm:p-8">
          <p className="text-sm text-muted-foreground">
            Have you explored {destinationName}? Sign in to share your impressions.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/signin" className={buttonVariants({ size: "sm" })}>
              Sign in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Create account
            </Link>
          </div>
        </Card>
      )}

      {user?.role === "admin" && (
        <Card variant="editorial" className="mb-8 p-4">
          <p className="text-xs text-muted-foreground">
            Signed in as administrator. You can remove inappropriate reviews.
          </p>
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
                <DestinationReviewItem
                  review={review}
                  destinationName={destinationName}
                  isOwn={isOwn}
                  canDelete={canDelete}
                  isEditing={editing}
                  onStartEdit={() => setEditingId(review._id)}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={(values) => handleUpdate(review._id, values)}
                  onRequestDelete={() => setPendingDelete(review)}
                />
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

      <ReviewPagination
        page={page}
        totalPages={totalPages}
        loading={loadingReviews}
        onPageChange={(p) => void loadReviews(p)}
      />

      <DeleteReviewDialog
        open={pendingDelete !== null}
        deleting={deleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
