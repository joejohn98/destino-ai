import type { Metadata } from "next";

import { AiAuthGuard } from "@/components/ai/ai-auth-guard";

export const metadata: Metadata = {
  title: {
    template: "%s | Destino AI",
    default: "AI Travel Assistant | Destino AI",
  },
};

export default function AiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AiAuthGuard>{children}</AiAuthGuard>;
}

