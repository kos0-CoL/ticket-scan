import { headers } from "next/headers";
import { HeroSection } from "./components/landing/HeroSection";
import { FeaturesSection } from "./components/landing/FeaturesSection";
import { SocialProofSection } from "./components/landing/SocialProofSection";
import { CTADownloadSection } from "./components/landing/CTADownloadSection";
import { FooterSection } from "./components/landing/FooterSection";

export const metadata = {
  title: "TicketScan - Escanea tus tickets de supermercado",
  description:
    "La app que escanea, categoriza y analiza tus compras de supermercado automáticamente. Disponible para Android.",
  openGraph: {
    title: "TicketScan - Tu asistente de compras inteligente",
    description:
      "Escanea tickets, categoriza gastos y controla tu presupuesto",
    type: "website",
  },
};

interface LandingConfig {
  hero?: any;
  features?: any;
  "social-proof"?: any;
  "cta-download"?: any;
  footer?: any;
}

async function getLandingConfig(): Promise<LandingConfig> {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "http";
    const host = h.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${proto}://${host}`;
    const res = await fetch(`${baseUrl}/api/landing`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch landing config");
    const data = await res.json();
    return data.config || {};
  } catch (error) {
    console.error("Error fetching landing config:", error);
    return {};
  }
}

export default async function Home() {
  const config = await getLandingConfig();

  return (
    <main className="min-h-screen bg-white">
      {config.hero && !config.hero.enabled && null}
      {config.hero && <HeroSection data={config.hero as any} />}
      {config.features && !config.features.enabled && null}
      {config.features && <FeaturesSection data={config.features as any} />}
      {config["social-proof"] && !config["social-proof"].enabled && null}
      {config["social-proof"] && <SocialProofSection data={config["social-proof"] as any} />}
      {config["cta-download"] && !config["cta-download"].enabled && null}
      {config["cta-download"] && <CTADownloadSection data={config["cta-download"] as any} />}
      {config.footer && !config.footer.enabled && null}
      {config.footer && <FooterSection data={config.footer as any} />}
    </main>
  );
}
