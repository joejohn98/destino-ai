"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Compass,
  GitCompare,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "cn";
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

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

const navigation: NavItem[] = [
  { label: "Destinations", href: "/destinations", icon: Compass },
  { label: "Continents", href: "/continents", icon: Globe2 },
  { label: "Plan a trip", href: "/ai/plan-itinerary", icon: Sparkles },
  { label: "Compare", href: "/ai/compare", icon: GitCompare },
  { label: "Saved", href: "/favorites", icon: Bookmark },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, status, signOut } = useAuth();

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
    <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur-xs">
      <div className="mx-auto flex h-20 max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Zone 1: Wordmark & Contextual Back Navigation */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            aria-label="Destino AI home"
            className="rounded-sm text-xl font-semibold tracking-tight text-ink transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            Destino AI
          </Link>

          {backLink && (
            <Link
              href={backLink.href}
              className="hidden items-center gap-1.5 rounded-full border border-ink/20 px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:inline-flex"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              <span>{backLink.label}</span>
            </Link>
          )}
        </div>

        {/* Zone 2: Centered Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex xl:gap-2"
        >
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                  isActive
                    ? "bg-ink/10 font-semibold text-ink"
                    : "text-ink hover:bg-ink/5 hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Right Utility Cluster (Locale, Account / Auth CTAs, Mobile Trigger) */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Global Locale Pill */}
          <div className="hidden items-center gap-1.5 rounded-full border border-ink/20 px-3 py-1.5 text-xs font-semibold text-ink xl:inline-flex">
            <Globe2 className="size-3.5 text-ink" aria-hidden="true" />
            <span>EN</span>
          </div>

          {/* Desktop Authentication / User Profile */}
          <AccountNav next={next} />

          {/* Mobile Navigation Drawer Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={mobileMenuOpen}
              className="inline-flex size-11 items-center justify-center rounded-control text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden"
            >
              <Menu aria-hidden="true" className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="flex w-4/5 max-w-sm flex-col border-line bg-cream p-0 lg:hidden"
            >
              <SheetHeader className="border-b border-line px-6 py-5 text-left">
                <SheetTitle className="text-lg font-semibold tracking-tight text-ink">
                  Destino AI
                </SheetTitle>
              </SheetHeader>

              {/* Logged in user info banner */}
              {user && (
                <div className="border-b border-line bg-background/50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-ink/10">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt="" />
                      ) : null}
                      <AvatarFallback className="bg-ink text-xs font-semibold text-white">
                        {((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() ||
                          user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-ink/75">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <nav
                aria-label="Mobile main navigation"
                className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
              >
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-control px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                        isActive
                          ? "bg-ink/10 font-semibold text-ink"
                          : "text-ink hover:bg-accent"
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-ink" : "text-ink/80"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Additional profile routes if logged in */}
                {user && (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink/70">
                      Account
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      <User aria-hidden="true" className="size-4 shrink-0 text-ink/80" />
                      <span>Profile</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        <LayoutDashboard
                          aria-hidden="true"
                          className="size-4 shrink-0 text-ink/80"
                        />
                        <span>Admin dashboard</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        try {
                          await signOut();
                          toast.success("Signed out");
                        } catch {
                          toast.error("Sign out failed");
                        }
                      }}
                      className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                    >
                      <LogOut aria-hidden="true" className="size-4 shrink-0" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </nav>

              {/* Mobile unauthenticated auth actions */}
              {status === "unauthenticated" && (
                <div className="mt-auto flex flex-col gap-2.5 border-t border-line p-4">
                  <Link
                    href={"/signin" + next}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-ink bg-transparent px-4 text-sm font-medium text-ink transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    Sign in
                  </Link>
                  <Link
                    href={"/signup" + next}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function AccountNav({ next }: { next: string }) {
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
          href={"/signin" + next}
          className="inline-flex h-10 items-center justify-center rounded-full border border-ink bg-transparent px-5 text-sm font-medium text-ink transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Sign in
        </Link>
        <Link
          href={"/signup" + next}
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
        className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/20 bg-background/60 p-1 pl-1.5 pr-3 text-sm font-medium text-ink transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <Avatar className="size-8">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-ink text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate sm:inline-block">
          {user.firstName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate text-sm font-semibold text-ink">
              {user.firstName} {user.lastName}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/favorites" />}>
          <Bookmark aria-hidden="true" />
          Saved favorites
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
        <DropdownMenuItem onClick={handleSignOut} className="text-danger focus:text-danger">
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
