import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

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
      <body className="min-h-dvh flex flex-col bg-background text-foreground antialiased">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
