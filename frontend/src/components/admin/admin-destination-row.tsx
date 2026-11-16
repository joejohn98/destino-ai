import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Loader2,
  Pencil,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { destinationHref, type Destination } from "@/lib/api";

export function AdminDestinationRow({
  destination,
  previewHref,
  isRegenerating,
  isRegeneratingTips,
  onEdit,
  onRegenerate,
  onRegenerateTips,
  onDelete,
}: {
  destination: Destination;
  previewHref?: string;
  isRegenerating: boolean;
  isRegeneratingTips?: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
  onRegenerateTips?: () => void;
  onDelete: () => void;
}) {
  const href = previewHref ?? destinationHref(destination);

  return (
    <Card variant="app" className="gap-3 p-4 sm:flex-row sm:items-center">
      <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-canvas sm:w-28">
        {destination.imageUrls?.[0] ? (
          <div className="relative size-full">
            <Image
              src={destination.imageUrls[0]}
              alt={destination.name}
              fill
              sizes="(max-width: 639px) calc(100vw - 4rem), 112px"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 wrap-break-word font-semibold text-ink">
            {destination.name}
          </p>
          <Badge
            variant="tag"
            className="rounded-full px-2 py-0.5 text-xs normal-case"
          >
            {destination.category}
          </Badge>
          {destination.aiReviewSummary && (
            <Badge variant="ai">AI summary</Badge>
          )}
          {destination.travelTips && destination.travelTips.length > 0 && (
            <Badge variant="ai">AI tips</Badge>
          )}
        </div>
        <p className="mt-1 min-w-0 wrap-break-word text-sm text-muted-foreground">
          {[destination.location?.city, destination.location?.state]
            .filter(Boolean)
            .join(", ")}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {destination.averageRating > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star
                aria-hidden="true"
                className="size-3.5 fill-pastel-peach text-pastel-peach"
              />
              {destination.averageRating.toFixed(1)} ({destination.ratingsCount}
              )
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil aria-hidden="true" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href={href} target="_blank" rel="noopener noreferrer" />
          }
        >
          <ExternalLink aria-hidden="true" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}
          AI summary
        </Button>
        {onRegenerateTips && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateTips}
            disabled={isRegeneratingTips}
          >
            {isRegeneratingTips ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <Sparkles aria-hidden="true" />
            )}
            AI tips
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-danger hover:text-danger"
          onClick={onDelete}
          aria-label={`Delete ${destination.name}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
