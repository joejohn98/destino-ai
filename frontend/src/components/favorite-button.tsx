"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  destinationId: string;
  destinationName: string;
  /** "icon" is a round overlay for cards; "labeled" is a pill for page headers. */
  variant?: "icon" | "labeled";
  className?: string;
}

export function FavoriteButton({
  destinationId,
  destinationName,
  variant = "icon",
  className,
}: FavoriteButtonProps) {
  const { status, isFavorite, toggleFavorite } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const saved = isFavorite(destinationId);
  const label = saved
    ? `Remove ${destinationName} from favorites`
    : `Save ${destinationName} to favorites`;

  const handleClick = async () => {
    if (pending) return;

    if (status === "unauthenticated") {
      const next = `${window.location.pathname}${window.location.search}`;
      toast.info("Sign in to save favorites");
      router.push(`/signin?next=${encodeURIComponent(next)}`);
      return;
    }

    setPending(true);
    try {
      const nowSaved = await toggleFavorite(destinationId);
      toast.success(nowSaved ? "Saved to favorites" : "Removed from favorites", {
        description: destinationName,
      });
    } catch {
      toast.error("Couldn't update favorites", {
        description: "Check your connection and try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      aria-pressed={saved}
      aria-label={variant === "icon" ? label : undefined}
      className={cn(
        variant === "icon"
          ? "grid size-9 place-items-center rounded-full border border-background bg-background/90 text-ink shadow-sm backdrop-blur-xs transition hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          : buttonVariants({ variant: "outline", size: "pill" }),
        className,
      )}
    >
      <Bookmark
        aria-hidden="true"
        className={cn("size-4", saved && "fill-current")}
      />
      {variant === "labeled" ? (saved ? "Saved" : "Save") : null}
    </button>
  );
}
