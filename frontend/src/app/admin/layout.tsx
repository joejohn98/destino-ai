import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 bg-background text-foreground">
      <AdminShell>{children}</AdminShell>
    </main>
  );
}
