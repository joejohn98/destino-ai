import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/auth-provider";

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
        <AuthProvider>
          <TooltipProvider>
            <Header />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer />
          </TooltipProvider>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
