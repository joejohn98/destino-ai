"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { AdminDestinationRow } from "@/components/admin/admin-destination-row";
import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { AdminDestinationDialogs } from "@/components/admin/admin-destination-dialogs";
import { AdminRowSkeleton } from "@/components/admin/admin-row-skeleton";
import {
  AdminDestinationsFilter,
  AdminDestinationsPagination,
} from "@/components/admin/admin-destinations-filter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { triggerRevalidation } from "@/lib/api/revalidate";
import { api, type AdminContinent, type Destination } from "@/lib/api";
import { useAdminDelete } from "@/hooks/use-admin-delete";

const PAGE_SIZE = 10;

export function AdminDestinationsHome() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [regeneratingTipsId, setRegeneratingTipsId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [continents, setContinents] = useState<AdminContinent[]>([]);

  const { pendingDelete, deleting, setPendingDelete, handleDelete } =
    useAdminDelete({
      deleteFn: (id: string) => api.deleteDestination(id),
      successMessage: "Destination deleted",
      errorMessage: "Couldn't delete destination",
      itemName: "destination",
      onDeleted: () => {
        void triggerRevalidation("destinations");
        load(page);
      },
    });

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
    const timer = setTimeout(
      () => {
        cleanup = load(page);
      },
      search ? 300 : 0,
    );

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

  const handleRegenerate = (id: string) => {
    setRegeneratingId(id);

    toast.promise(
      async () => {
        const res = await api.regenerateAiSummary(id);
        if (!res.data?.summary && res.data?.message) {
          throw new Error(res.data.message);
        }
        await load(page);
        return res;
      },
      {
        loading: "Synthesizing AI review summary with AI...",
        success: () => "AI review summary generated successfully.",
        error: (err: unknown) =>
          err instanceof Error
            ? err.message
            : "Couldn't regenerate AI review summary.",
        finally: () => setRegeneratingId(null),
      },
    );
  };

  const handleRegenerateTips = (id: string) => {
    setRegeneratingTipsId(id);

    toast.promise(
      async () => {
        const res = await api.regenerateAiTips(id);
        if (!res.data?.tips?.length) {
          throw new Error("No travel tips were returned by the AI service.");
        }
        await load(page);
        return res;
      },
      {
        loading: "Generating practical travel tips with AI...",
        success: (res) =>
          `Generated ${res.data.tips.length} travel tips successfully.`,
        error: (err: unknown) =>
          err instanceof Error
            ? err.message
            : "Couldn't regenerate travel tips.",
        finally: () => setRegeneratingTipsId(null),
      },
    );
  };

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow font-medium uppercase text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-1 text-title font-semibold text-ink">
            Destinations
          </h1>
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

      <AdminDestinationsFilter
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
      />

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
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <AdminRowSkeleton key={i} />
          ))
        ) : (
          destinations.map((dest) => (
            <AdminDestinationRow
              key={dest._id}
              destination={dest}
              isRegenerating={regeneratingId === dest._id}
              isRegeneratingTips={regeneratingTipsId === dest._id}
              onEdit={() => handleEdit(dest)}
              onRegenerate={() => handleRegenerate(dest._id)}
              onRegenerateTips={() => handleRegenerateTips(dest._id)}
              onDelete={() => setPendingDelete(dest)}
            />
          ))
        )}
      </div>

      {!loading && destinations.length === 0 && (
        <Card variant="editorial" className="p-8 text-center">
          <CardContent className="flex flex-col items-center px-0">
            <CardTitle role="heading" aria-level={3} className="text-base font-semibold text-ink">
              No destinations found
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {search.trim().length > 0 || category !== "all"
                ? "No destinations match your current filters. Try resetting them or adjusting your search."
                : "No destinations have been added yet."}
            </CardDescription>
            {(search.trim().length > 0 || category !== "all") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setPage(1);
                }}
              >
                Reset all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AdminDestinationsPagination
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
      />

      <AdminDestinationDialogs
        continents={continents}
        createOpen={formOpen}
        onCloseCreate={() => setFormOpen(false)}
        editing={editing}
        onCloseEdit={() => setEditing(null)}
        onSaved={() => {
          void triggerRevalidation("destinations");
          load(page);
        }}
      />

      <AdminDeleteDialog
        open={pendingDelete !== null}
        deleting={deleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
