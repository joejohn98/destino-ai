"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";

const navigation = [
  { label: "Destinations", href: "/destinations" },
  { label: "Continents", href: "/continents" },
  { label: "Plan a trip", href: "/ai/plan-itinerary" },
  { label: "Compare", href: "/ai/compare" },
] as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useAuth();
  const backLink =
    pathname === "/continents" || pathname === "/destinations"
      ? { href: "/", label: "Back home" }
      : pathname.startsWith("/continents/")
        ? { href: "/continents", label: "All regions" }
        : undefined;
  const next =
    pathname === "/signin" || pathname === "/signup"
      ? ""
      : "?next=" + encodeURIComponent(pathname);

  return (
    <header className="bg-cream">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            aria-label="Destino AI home"
            className="shrink-0 rounded-sm text-xl font-semibold tracking-tight text-ink transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Destino AI
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-4 lg:flex xl:gap-6"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-sm px-1 text-sm font-medium text-ink transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {backLink && (
            <Link
              href={backLink.href}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "hidden gap-2 rounded-full sm:inline-flex",
              })}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {backLink.label}
            </Link>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={mobileMenuOpen}
              className="inline-flex size-11 items-center justify-center rounded-control text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
            >
              <Menu aria-hidden="true" className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-4/5 max-w-sm border-line p-0 lg:hidden"
            >
              <SheetHeader className="border-b border-line px-6 py-4">
                <SheetTitle className="text-base font-semibold text-ink">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Mobile main navigation"
                className="flex flex-col gap-1 p-4"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-control px-3 text-sm font-medium text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {status === "unauthenticated" && (
                <nav
                  aria-label="Mobile account navigation"
                  className="mt-auto flex flex-col gap-2 border-t border-line p-4"
                >
                  <Link
                    href={"/signin" + next}
                    onClick={() => setMobileMenuOpen(false)}
                    className={buttonVariants({
                      variant: "outline",
                      size: "default",
                      className: "w-full rounded-full",
                    })}
                  >
                    Sign in
                  </Link>
                  <Link
                    href={"/signup" + next}
                    onClick={() => setMobileMenuOpen(false)}
                    className={buttonVariants({
                      size: "default",
                      className: "w-full rounded-full",
                    })}
                  >
                    Sign up
                  </Link>
                </nav>
              )}
            </SheetContent>
          </Sheet>

          <AccountNav />
        </div>
      </div>
    </header>
  );
}

function AccountNav() {
  const { user, status, signOut } = useAuth();
  const router = useRouter();

  if (status === "loading") {
    return <Skeleton aria-hidden="true" className="size-9 rounded-full" />;
  }

  if (!user) {
    return (
      <nav
        aria-label="Account navigation"
        className="hidden items-center gap-2 sm:flex"
      >
        <Link
          href="/signin"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "rounded-full",
          })}
        >
          Sign in
        </Link>
        <Link
          href="/signup"
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
    ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() ||
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
        aria-label={"Account menu for " + user.firstName}
        className="inline-flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Avatar className="size-9">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
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
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/favorites" />}>
          <Bookmark aria-hidden="true" />
          Favorites
        </DropdownMenuItem>
        {user.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin" />}>
              <LayoutDashboard aria-hidden="true" />
              Admin dashboard
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}