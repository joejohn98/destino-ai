import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  count?: number;
  variant?: "peach" | "lime" | "default";
}

export function RatingBadge({
  rating,
  count,
  variant = "peach",
  className,
  ...props
}: RatingBadgeProps) {
  if (rating <= 0) return null;

  const starColor =
    variant === "lime"
      ? "fill-lime text-lime"
      : "fill-pastel-peach text-pastel-peach";

  const badgeBg =
    variant === "lime"
      ? "bg-canvas"
      : variant === "peach"
        ? "bg-pastel-peach/30"
        : "bg-muted";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold text-ink tabular-nums",
        badgeBg,
        className,
      )}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
      {...props}
    >
      <Star aria-hidden="true" className={cn("size-3.5", starColor)} />
      <span>{rating.toFixed(1)}</span>
      {count !== undefined && count > 0 && (
        <span className="text-muted-foreground font-normal">({count})</span>
      )}
    </div>
  );
}
