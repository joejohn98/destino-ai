"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Home, ShieldAlert } from "lucide-react";
import { cn } from "cn";

import { useAuth } from "@/components/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const adminNav = [
  { label: "Destinations", href: "/admin/destinations" },
  { label: "Continents", href: "/admin/continents" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Hooks must run unconditionally before any early return.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin?next=%2Fadmin");
    }
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && !user)) {
    return (
      <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 py-16 sm:px-6 lg:px-10" aria-busy="true">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-marketing" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return null;
  }

  if (user.role !== "admin") {
    return (
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-20 text-foreground sm:px-6 lg:px-10">
        <Card variant="editorial" className="w-full max-w-lg p-6 text-center sm:p-10 lg:p-14">
          <CardContent className="flex flex-col items-center gap-4 p-0">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-danger-soft text-ink">
              <ShieldAlert aria-hidden="true" className="size-8 text-danger" />
            </div>
            <div>
              <CardTitle role="heading" aria-level={1} className="text-headline font-semibold text-ink">
                Admin access required
              </CardTitle>
              <CardDescription className="mx-auto mt-3 max-w-sm text-base leading-relaxed">
                This area is only available to administrator accounts. If you
                think this is a mistake, sign in with an admin account.
              </CardDescription>
            </div>
            <Link href="/" className={buttonVariants({ variant: "outline", size: "pill", className: "mt-2" })}>
              <Home aria-hidden="true" />
              Back home
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="mx-auto w-full max-w-page px-4 pb-24 pt-6 sm:px-6 lg:px-10">
      <nav aria-label="Admin sections" className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-px">
        <span className="mr-2 inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <Compass aria-hidden="true" className="size-4 text-pastel-sky" />
          Admin
        </span>
        {adminNav.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-sm border-b-2 px-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                isActive
                  ? "border-ink text-ink"
                  : "border-transparent text-muted-foreground hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
