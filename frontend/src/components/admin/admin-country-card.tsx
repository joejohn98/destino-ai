import Link from "next/link";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminCountryItem } from "@/lib/api";

export function AdminCountryCard({
  country,
  continentSlug,
  onEdit,
  onDelete,
}: {
  country: AdminCountryItem;
  continentSlug: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const destCount =
    country.destinationCount ?? country.destinations?.length ?? 0;
  const destHref = `/admin/continents/${continentSlug}/countries/${country.slug}`;

  return (
    <div className="relative group rounded-marketing border border-line bg-cream p-5">
      <Link
        href={destHref}
        className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <p className="text-title font-semibold text-ink">{country.name}</p>
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
          onClick={onEdit}
        >
          <Pencil aria-hidden="true" className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-danger hover:text-danger"
          onClick={onDelete}
          aria-label={`Delete ${country.name}`}
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

