"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";

const navigation = [
  { label: "Destinations", href: "/destinations" },
  { label: "Continents", href: "/continents" },
  { label: "Plan a trip", href: "/ai/plan-itinerary" },
  { label: "Compare", href: "/ai/compare" },
] as const;

export function Header() {
  const pathname = usePathname();
  const backLink =
    pathname === "/continents" || pathname === "/destinations"
      ? { href: "/", label: "Back home" }
      : pathname.startsWith("/continents/")
        ? { href: "/continents", label: "All regions" }
        : pathname.startsWith("/destinations/")
          ? { href: "/destinations", label: "All destinations" }
          : undefined;

  return (
    <header className="bg-cream">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            aria-label="Destino AI home"
            className="rounded-sm text-xl font-semibold tracking-tight text-ink transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Destino AI
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 sm:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm text-sm font-medium text-ink transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {backLink ? (
            <Link
              href={backLink.href}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-2 rounded-full",
              })}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {backLink.label}
            </Link>
          ) : (
            <nav
              aria-label="Mobile navigation"
              className="flex items-center gap-4 sm:hidden"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-sm text-sm font-medium text-ink transition-colors hover:text-muted-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <AccountNav />
        </div>
      </div>
    </header>
  );
}

function AccountNav() {
  const { user, status, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return <Skeleton aria-hidden="true" className="size-9 rounded-full" />;
  }

  if (!user) {
    const next =
      pathname === "/signin" || pathname === "/signup"
        ? ""
        : `?next=${encodeURIComponent(pathname)}`;

    return (
      <nav
        aria-label="Account navigation"
        className="hidden items-center gap-2 sm:flex"
      >
        <Link
          href={`/signin${next}`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "rounded-full",
          })}
        >
          Sign in
        </Link>
        <Link
          href={`/signup${next}`}
          className={buttonVariants({
            size: "sm",
            className: "rounded-full",
          })}
        >
          Sign up
        </Link>
      </nav>
    );
  }

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    user.username.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out");
    } catch {
      toast.error("Sign out failed", {
        description: "Check your connection and try again.",
      });
    }
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${user.firstName}`}
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Avatar>
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate text-sm font-semibold text-ink">
              {user.firstName} {user.lastName}
            </span>
            <span className="block truncate">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/favorites" />}>
          <Bookmark aria-hidden="true" />
          Favorites
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
