"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";

// The backend sets the session cookie and redirects here after Google/GitHub
// sign-in. Re-read the session, then send the user on.
export default function OAuthSuccessPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void refresh().then((user) => {
      if (user) {
        toast.success("Welcome!", {
          description: `Signed in as ${user.email}.`,
        });
        router.replace("/");
      } else {
        toast.error("Sign in failed", {
          description: "We couldn't complete social sign-in. Try again.",
        });
        router.replace("/signin");
      }
    });
  }, [refresh, router]);

  return (
    <main
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center"
    >
      <Loader2 aria-hidden="true" className="size-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
    </main>
  );
}
