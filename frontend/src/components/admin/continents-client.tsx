"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { EntityForm } from "@/components/admin/entity-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type AdminContinent } from "@/lib/api";

export function AdminContinentsHome() {
  const [continents, setContinents] = useState<AdminContinent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContinentForm, setShowContinentForm] = useState(false);
  const [continentFormInstance, setContinentFormInstance] = useState(0);
  const [editingContinent, setEditingContinent] = useState<AdminContinent | null>(
    null,
  );

  const load = useCallback(() => {
    let cancelled = false;
    api
      .getAdminContinents()
      .then((res) => {
        if (cancelled) return;
        setContinents(res.data);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Couldn't load continents", {
          description: "Check your connection and try again.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return load();
  }, [load]);

  const continentFormOpen = showContinentForm || editingContinent !== null;
  const closeContinentForm = () => {
    setShowContinentForm(false);
    setEditingContinent(null);
  };

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow font-medium uppercase text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-1 text-title font-semibold text-ink">Continents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Click a continent to manage its countries and destinations.
          </p>
        </div>
        <Button
          variant="outline"
          size="pill"
          onClick={() => {
            setContinentFormInstance((instance) => instance + 1);
            setShowContinentForm(true);
          }}
        >
          <Plus aria-hidden="true" />
          New continent
        </Button>
      </div>

      {loading ? (
        <div
          role="status"
          aria-label="Loading continents"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} variant="editorial" className="animate-pulse p-0">
              <div className="h-36 w-full rounded-t-marketing bg-band/40" />
              <div className="flex flex-col gap-2 p-6">
                <div className="h-5 w-2/3 rounded-sm bg-band/40" />
                <div className="h-3.5 w-1/2 rounded-sm bg-band/30" />
              </div>
            </Card>
          ))}
        </div>
      ) : continents.length === 0 ? (
        <Card variant="editorial" className="p-10 text-center">
          <CardContent className="flex flex-col items-center gap-3 p-0">
            <CardTitle className="text-base text-ink">No continents yet</CardTitle>
            <CardDescription>
              Create a continent to start building your catalog.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {continents.map((continent) => (
            <div key={continent._id} className="group relative rounded-marketing">
              <Link
                href={`/admin/continents/${continent.slug}`}
                className="block rounded-marketing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <Card variant="editorial" className="h-full gap-0 p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-marketing bg-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={continent.imageUrl}
                      alt=""
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-title font-semibold text-ink">
                      {continent.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {continent.countryCount} countries · {continent.destinationCount} destinations
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="border-0 bg-transparent p-6 pt-3">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4">
                      Manage countries
                      <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
              <div className="absolute right-3 top-3 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${continent.name}`}
                  className="bg-canvas/80 hover:bg-accent"
                  onClick={() => setEditingContinent(continent)}
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remount on each create session and when switching edit targets. */}
      <EntityForm
        key={editingContinent?._id ?? `new-${continentFormInstance}`}
        open={continentFormOpen}
        title={editingContinent ? `Edit ${editingContinent.name}` : "New continent"}
        description="Add a new continent. An image is required for new continents."
        initial={
          editingContinent
            ? {
                _id: editingContinent._id,
                name: editingContinent.name,
                description: editingContinent.description,
                imageUrl: editingContinent.imageUrl,
              }
            : null
        }
        onClose={closeContinentForm}
        onSaved={() => {
          closeContinentForm();
          load();
        }}
        onSubmit={(fd) =>
          editingContinent
            ? api.updateContinent(editingContinent._id, fd)
            : api.createContinent(fd)
        }
      />
    </div>
  );
}
