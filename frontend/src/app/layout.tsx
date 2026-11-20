import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/auth-provider";
import { FavoritesProvider } from "@/components/favorites-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Destino AI",
    default: "Destino AI — Discover & Plan Trips",
  },
  description:
    "Explore verified destinations, discover sights, and plan authentic trips across the globe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body
        suppressHydrationWarning
        className="min-h-dvh flex flex-col bg-background text-foreground antialiased"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
        >
          Skip to content
        </a>
        <AuthProvider>
          <FavoritesProvider>
            <TooltipProvider>
              <Suspense fallback={<div className="h-20" aria-hidden="true" />}>
                <Header />
              </Suspense>
              <div
                id="main-content"
                tabIndex={-1}
                className="flex flex-1 flex-col outline-none"
              >
                <Suspense
                  fallback={
                    <div
                      className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-page flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10"
                      aria-busy="true"
                    >
                      <div className="h-8 w-48 animate-pulse rounded-sm bg-muted" />
                      <div className="h-48 animate-pulse rounded-marketing bg-muted" />
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </div>
              <Footer />
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
