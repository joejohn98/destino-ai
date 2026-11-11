"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { EntityForm } from "@/components/admin/entity-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { api, type AdminContinent, type AdminCountryItem } from "@/lib/api";

interface State {
  continent: AdminContinent | null;
  countries: AdminCountryItem[];
}

export function AdminContinentCountries({ slug }: { slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ continent: null, countries: [] });
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<AdminCountryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCountryForm, setShowCountryForm] = useState(false);
  const [countryFormInstance, setCountryFormInstance] = useState(0);
  const [editingCountry, setEditingCountry] = useState<AdminCountryItem | null>(
    null,
  );

  const countryFormOpen = showCountryForm || editingCountry !== null;
  const closeCountryForm = () => {
    setShowCountryForm(false);
    setEditingCountry(null);
  };

  const load = useCallback(() => {
    // Cancellation guard — prevents setState on an unmounted component.
    let cancelled = false;
    api
      .getAdminContinent(slug)
      .then((res) => {
        if (cancelled) return;
        const continent = res.data ?? null;
        setState({ continent, countries: continent?.countries ?? [] });
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Couldn't load this continent's countries");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    return load();
  }, [load]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.deleteCountry(pendingDelete._id);
      toast.success("Country deleted");
      setPendingDelete(null);
      load();
    } catch {
      toast.error("Couldn't delete country", {
        description:
          "A country with destinations can't be deleted until they're removed.",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 flex flex-col gap-8" aria-busy="true">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-52 animate-pulse rounded-sm bg-band/30" />
          <div className="h-4 w-72 animate-pulse rounded-sm bg-band/20" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="editorial" className="animate-pulse gap-0 p-0">
              <div className="h-28 w-full bg-band/30" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!state.continent) {
    return (
      <div className="mt-6 flex flex-col gap-6">
        <Card variant="editorial" className="p-10 text-center">
          <CardContent className="flex flex-col items-center gap-3 p-0">
            <CardTitle className="text-base text-ink">
              Continent not found
            </CardTitle>
            <CardDescription>
              This continent may have been deleted.
            </CardDescription>
            <Button
              variant="outline"
              onClick={() => router.replace("/admin/continents")}
            >
              Back to continents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href="/admin/continents"
              className="rounded-sm underline underline-offset-4 hover:text-ink"
            >
              Continents
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-ink">{state.continent.name}</span>
          </nav>
          <h1 className="mt-2 text-title font-semibold text-ink">
            {state.continent.name} · countries
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {state.countries.length} countries ·{" "}
            {state.continent.destinationCount} destinations
          </p>
        </div>
        <Button
          variant="outline"
          size="pill"
          onClick={() => {
            setCountryFormInstance((instance) => instance + 1);
            setShowCountryForm(true);
          }}
        >
          <Plus aria-hidden="true" />
          New country
        </Button>
      </div>

      {state.countries.length === 0 ? (
        <Card variant="editorial" className="p-10 text-center">
          <CardContent className="flex flex-col items-center gap-3 p-0">
            <CardTitle className="text-base text-ink">
              No countries in {state.continent.name} yet
            </CardTitle>
            <CardDescription>
              Add a country to start associating destinations.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {state.countries.map((country) => {
            const destCount =
              country.destinationCount ?? country.destinations?.length ?? 0;
            const destHref = `/admin/continents/${slug}/countries/${country.slug}`;
            return (
              <div
                key={country._id}
                className="relative group rounded-marketing border border-line bg-cream p-5"
              >
                <Link
                  href={destHref}
                  className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <p className="text-title font-semibold text-ink">
                    {country.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {destCount} destination{destCount === 1 ? "" : "s"}
                  </p>
                  <Badge variant="tag" className="mt-3">
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                    Manage destinations
                  </Badge>
                </Link>
                <div className="absolute right-3 top-3 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${country.name}`}
                    className="hover:bg-accent"
                    onClick={() => setEditingCountry(country)}
                  >
                    <Pencil aria-hidden="true" className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-danger hover:text-danger"
                    onClick={() => setPendingDelete(country)}
                    aria-label={`Delete ${country.name}`}
                  >
                    <Trash2 aria-hidden="true" className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete?.name}?</DialogTitle>
            <DialogDescription>
              This permanently deletes this country. Any destinations linked to
              it must be removed first. This can&apos;t be undone.
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

      {/* Remount on each create session and when switching edit targets. */}
      <EntityForm
        key={editingCountry?._id ?? `new-${countryFormInstance}`}
        open={countryFormOpen}
        title={editingCountry ? `Edit ${editingCountry.name}` : "New country"}
        description="Create a new country within this continent. An image is required for new countries."
        initial={
          editingCountry
            ? {
                _id: editingCountry._id,
                name: editingCountry.name,
                imageUrl: editingCountry.imageUrl,
              }
            : null
        }
        onClose={closeCountryForm}
        onSaved={() => {
          closeCountryForm();
          load();
        }}
        onSubmit={(fd) =>
          editingCountry
            ? api.updateCountry(editingCountry._id, fd)
            : api.createCountry(state.continent!._id, fd)
        }
      />
    </div>
  );
}
