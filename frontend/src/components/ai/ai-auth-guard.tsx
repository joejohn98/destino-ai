"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function AiAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const nextQuery = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/signin${nextQuery}`);
    }
  }, [status, router, pathname]);

  if (status === "loading" || (status === "authenticated" && !user)) {
    return (
      <main className="flex-1 bg-background" aria-busy="true">
        <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 py-12 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <Skeleton className="h-96 rounded-marketing" />
            <Skeleton className="h-96 rounded-marketing" />
          </div>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated" || !user) {
    return null;
  }

  return <>{children}</>;
}

