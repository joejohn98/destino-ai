"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
  Pencil,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { DestinationForm, destinationToFormInitial } from "@/components/admin/destination-form";
import { Badge } from "@/components/ui/badge";
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
import {
  Field,
  FieldControl,
  FieldLabel,
} from "@/components/ui/field";
import { api, destinationHref, type AdminContinent, type Destination } from "@/lib/api";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "historical", label: "Historical" },
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "adventure", label: "Adventure" },
  { value: "wildlife", label: "Wildlife" },
] as const;

const PAGE_SIZE = 10;

export function AdminDestinationsHome() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Destination | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [continents, setContinents] = useState<AdminContinent[]>([]);

  // Load continents once on mount for form dropdowns
  useEffect(() => {
    let cancelled = false;
    api
      .getAdminContinents()
      .then((res) => {
        if (!cancelled) setContinents(res.data);
      })
      .catch(() => {
        /* country list is only needed when the form opens */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(
    (pageNumber: number) => {
      setLoading(true);
      let cancelled = false;

      api
        .getDestinations({
          page: pageNumber,
          limit: PAGE_SIZE,
          ...(search.trim().length >= 1 ? { search: search.trim() } : {}),
          ...(category !== "all" ? { category } : {}),
        })
        .then((res) => {
          if (cancelled) return;
          setDestinations(res.data ?? []);
          setTotalPages(res.totalPages || 1);
        })
        .catch(() => {
          if (cancelled) return;
          toast.error("Couldn't load destinations");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    },
    [search, category],
  );

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const timer = setTimeout(() => {
      cleanup = load(page);
    }, search ? 300 : 0);

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, [load, page, search]);

  const handleEdit = async (dest: Destination) => {
    try {
      const res = await api.getDestinationById(dest._id);
      setEditing(res.data);
    } catch {
      setEditing(dest);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.deleteDestination(pendingDelete._id);
      toast.success("Destination deleted");
      setPendingDelete(null);
      load(page);
    } catch {
      toast.error("Couldn't delete destination");
    } finally {
      setDeleting(false);
    }
  };

  const handleRegenerate = async (id: string) => {
    setRegeneratingId(id);
    try {
      const res = await api.regenerateAiSummary(id);
      toast.success(
        res.data?.summary ? "AI summary regenerated" : "AI summary generated",
      );
      load(page);
    } catch {
      toast.error("Couldn't regenerate AI summary", {
        description: "Not enough reviews, or the AI service is unavailable.",
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow font-medium uppercase text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-1 text-title font-semibold text-ink">Destinations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the full destination catalog with AI summaries.
          </p>
        </div>
        <Button
          variant="outline"
          size="pill"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
          New destination
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Field className="w-full lg:max-w-sm">
          <FieldLabel htmlFor="dest-search">Search destinations</FieldLabel>
          <FieldControl
            id="dest-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => {
          const selected = category === c.value;
          return (
            <Button
              key={c.value}
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCategory(c.value);
                setPage(1);
              }}
              aria-pressed={selected}
            >
              {c.label}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span aria-live="polite">
          {loading ? "Loading…" : `${destinations.length} results`}
        </span>
        {totalPages > 1 && (
          <span>
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {destinations.map((dest) => (
          <Card key={dest._id} variant="app" className="gap-3 p-4 sm:flex-row sm:items-center">
            <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-canvas sm:w-28">
              {dest.imageUrls?.[0] ? (
                <div className="relative size-full">
                  <Image
                    src={dest.imageUrls[0]}
                    alt={dest.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{dest.name}</p>
                <Badge variant="tag" className="rounded-full px-2 py-0.5 text-xs normal-case">
                  {dest.category}
                </Badge>
                {dest.aiReviewSummary && <Badge variant="ai">AI summary</Badge>}
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {dest.location?.city ? `${dest.location.city}, ` : ""}
                {dest.location?.country}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                {dest.averageRating > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star aria-hidden="true" className="size-3.5 fill-pastel-peach text-pastel-peach" />
                    {dest.averageRating.toFixed(1)} ({dest.ratingsCount})
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(dest)}>
                <Pencil aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link
                    href={destinationHref(dest)}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <ExternalLink aria-hidden="true" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRegenerate(dest._id)}
                disabled={regeneratingId === dest._id}
              >
                {regeneratingId === dest._id ? (
                  <Loader2 aria-hidden="true" className="animate-spin" />
                ) : (
                  <RefreshCw aria-hidden="true" />
                )}
                AI summary
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:text-danger"
                onClick={() => setPendingDelete(dest)}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!loading && destinations.length === 0 && (
        <Card variant="editorial" className="p-10 text-center">
          <CardContent className="flex flex-col items-center gap-3 p-0">
            <CardTitle className="text-base text-ink">No destinations match</CardTitle>
            <CardDescription>
              Try a different search or category filter.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Destinations pages"
          className="flex items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </nav>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete destination?</DialogTitle>
            <DialogDescription>
              This permanently deletes {pendingDelete?.name} and its reviews.
              This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
            >
              Keep
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(formOpen || editing) && (
        <DestinationForm
          continents={continents}
          initial={
            editing
              ? {
                  ...destinationToFormInitial(editing),
                  location: {
                    ...destinationToFormInitial(editing).location,
                    countryId:
                      continents
                        .flatMap((c) => c.countries)
                        .find(
                          (c) =>
                            c.name === editing.location?.country ||
                            c.slug === editing.location?.countrySlug,
                        )?._id ?? "",
                  },
                }
              : null
          }
          onSaved={() => {
            setFormOpen(false);
            setEditing(null);
            load(page);
          }}
        />
      )}
    </div>
  );
}
