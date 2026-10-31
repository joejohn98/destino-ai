"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, RefreshCw, Loader2, Trash2, Pencil, Plus } from "lucide-react";
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
import { api, type AdminContinent, type AdminCountryItem, type Destination } from "@/lib/api";

interface CountryDestProps {
  continentSlug: string;
  countrySlug: string;
}

interface CountryInfo {
  continent: string;
  country: AdminCountryItem | null;
}

export function AdminCountryDestinations({
  continentSlug,
  countrySlug,
}: CountryDestProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [country, setCountry] = useState<CountryInfo>({
    continent: continentSlug,
    country: null,
  });
  // Full continent list — needed for the country selector in DestinationForm.
  const [continents, setContinents] = useState<AdminContinent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Destination | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);

  const load = useCallback(() => {
    // Cancellation guard — prevents setState on an unmounted component.
    let cancelled = false;

    // Single call for the continent (includes its countries list).
    // Separately fetch all continents for the DestinationForm country dropdown.
    Promise.all([
      api.getAdminContinent(continentSlug),
      api.getAdminContinents(),
    ])
      .then(([single, all]) => {
        if (cancelled) return;

        const continent = single.data;
        const countryItem =
          continent?.countries.find((c) => c.slug === countrySlug) ?? null;

        setCountry({
          continent: continent?.name ?? continentSlug,
          country: countryItem,
        });
        setContinents(all.data);

        const countryName = countryItem?.name;
        if (countryName) {
          return api.getDestinations({ location: countryName, limit: 100 });
        }
        return null;
      })
      .then((res) => {
        if (cancelled) return;
        setDestinations(res?.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Couldn't load destinations for this country");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [continentSlug, countrySlug]);

  useEffect(() => {
    return load();
  }, [load]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.deleteDestination(pendingDelete._id);
      toast.success("Destination deleted");
      setPendingDelete(null);
      load();
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
      load();
    } catch {
      toast.error("Couldn't regenerate AI summary");
    } finally {
      setRegeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 flex flex-col gap-5" aria-busy="true">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-56 animate-pulse rounded-sm bg-band/30" />
          <div className="h-4 w-72 animate-pulse rounded-sm bg-band/20" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
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
            <Link
              href={`/admin/continents/${continentSlug}`}
              className="rounded-sm underline underline-offset-4 hover:text-ink"
            >
              {country.continent}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-ink">
              {country.country?.name ?? countrySlug}
            </span>
          </nav>
          <h1 className="mt-2 text-title font-semibold text-ink">
            {country.country?.name ?? countrySlug} · destinations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {destinations.length} verified destinations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <Button
            variant="outline"
            size="pill"
            nativeButton={false}
            render={<Link href={`/admin/continents/${continentSlug}`} />}
          >
            <ArrowLeft aria-hidden="true" />
            Back to {country.continent}
          </Button>
        </div>
      </div>

      {destinations.length === 0 ? (
        <Card variant="editorial" className="p-10 text-center">
          <CardContent className="flex flex-col items-center gap-3 p-0">
            <CardTitle className="text-base text-ink">
              No destinations in this country
            </CardTitle>
            <CardDescription>
              Add a destination to start curating this country.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        destinations.map((dest) => (
          <Card
            key={dest._id}
            variant="app"
            className="gap-3 p-4 sm:flex-row sm:items-center"
          >
            <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-canvas sm:w-28">
              {dest.imageUrls?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dest.imageUrls[0]} alt="" className="size-full object-cover" />
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
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(dest)}>
                <Pencil aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/destinations/${encodeURIComponent(dest.slug)}`} />}
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
        ))
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
                  // Inject the countryId by matching the destination's country name
                  // against the loaded countries list so the dropdown pre-selects correctly.
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
          presetCountry={editing ? undefined : country.country?._id}
          onSaved={() => {
            setFormOpen(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card variant="editorial" className="animate-pulse gap-0 p-0">
      <div className="flex items-center gap-4 p-4">
        <div className="h-20 w-28 shrink-0 rounded-lg bg-band/30" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-5 w-2/3 rounded-sm bg-band/30" />
          <div className="h-3.5 w-1/2 rounded-sm bg-band/20" />
        </div>
      </div>
    </Card>
  );
}
