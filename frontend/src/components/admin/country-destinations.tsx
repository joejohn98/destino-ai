"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";

import { AdminDestinationDialogs } from "@/components/admin/admin-destination-dialogs";
import { AdminDestinationRow } from "@/components/admin/admin-destination-row";
import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { AdminRowSkeleton } from "@/components/admin/admin-row-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  api,
  destinationHref,
  type AdminContinent,
  type AdminCountryDetail,
  type AdminCountryItem,
  type Destination,
} from "@/lib/api";
import { useAdminDelete } from "@/hooks/use-admin-delete";

interface CountryDestProps {
  continentSlug: string;
  countrySlug: string;
}

interface CountryInfo {
  continent: string;
  country: AdminCountryDetail | AdminCountryItem | null;
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
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);

  const load = useCallback(() => {
    let cancelled = false;

    Promise.all([
      api.getAdminCountry(continentSlug, countrySlug),
      api.getAdminContinents(),
    ])
      .then(([countryRes, allContinentsRes]) => {
        if (cancelled) return;

        const countryData = countryRes.data;
        const continentObj =
          typeof countryData.continent === "object" &&
          countryData.continent !== null
            ? countryData.continent
            : null;

        setCountry({
          continent: continentObj?.name ?? continentSlug,
          country: countryData,
        });
        setContinents(allContinentsRes.data ?? []);
        setDestinations(countryData.destinations ?? []);
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

  const { pendingDelete, deleting, setPendingDelete, handleDelete } =
    useAdminDelete({
      deleteFn: (id: string) => api.deleteDestination(id),
      successMessage: "Destination deleted",
      errorMessage: "Couldn't delete destination",
      itemName: "destination",
      onDeleted: load,
    });

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
          <AdminRowSkeleton key={i} />
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
        <Card variant="editorial" className="p-6 text-center sm:p-10">
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
          <AdminDestinationRow
            key={dest._id}
            destination={dest}
            previewHref={destinationHref(dest, countrySlug, continentSlug)}
            isRegenerating={regeneratingId === dest._id}
            onEdit={() => handleEdit(dest)}
            onRegenerate={() => handleRegenerate(dest._id)}
            onDelete={() => setPendingDelete(dest)}
          />
        ))
      )}

      <AdminDestinationDialogs
        continents={continents}
        presetCountry={country.country?._id}
        createOpen={formOpen}
        onCloseCreate={() => setFormOpen(false)}
        editing={editing}
        onCloseEdit={() => setEditing(null)}
        onSaved={load}
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
