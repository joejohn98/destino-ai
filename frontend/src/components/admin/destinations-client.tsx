"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { AdminDestinationRow } from "@/components/admin/admin-destination-row";
import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { AdminDestinationDialogs } from "@/components/admin/admin-destination-dialogs";
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
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [continents, setContinents] = useState<AdminContinent[]>([]);

  const { pendingDelete, deleting, setPendingDelete, handleDelete } =
    useAdminDelete({
      deleteFn: (id: string) => api.deleteDestination(id),
      successMessage: "Destination deleted",
      errorMessage: "Couldn't delete destination",
      itemName: "destination",
      onDeleted: () => load(page),
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
        {destinations.map((dest) => (
          <AdminDestinationRow
            key={dest._id}
            destination={dest}
            isRegenerating={regeneratingId === dest._id}
            onEdit={() => handleEdit(dest)}
            onRegenerate={() => handleRegenerate(dest._id)}
            onDelete={() => setPendingDelete(dest)}
          />
        ))}
      </div>

      {!loading && destinations.length === 0 && (
        <Card variant="editorial" className="p-8 text-center">
          <CardContent className="px-0">
            <CardTitle role="heading" aria-level={3} className="text-base font-semibold text-ink">
              No destinations found
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Try adjusting your search or category filter.
            </CardDescription>
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
        onSaved={() => load(page)}
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
