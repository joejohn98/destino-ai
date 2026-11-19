import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 bg-background text-foreground">
      <Suspense
        fallback={
          <div
            className="mx-auto w-full max-w-page px-4 py-6 sm:px-6 lg:px-10"
            aria-busy="true"
          >
            <Skeleton className="h-11 w-56" />
          </div>
        }
      >
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </main>
  );
}
