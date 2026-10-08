import Link from "next/link";
import React from "react";
import { headers } from "next/headers";

export const metadata = {
  title: "TicketScan - Escanea tus tickets de supermercado",
  description: "La app que escanea, categoriza y analiza tus compras de supermercado automáticamente. Disponible para Android.",
  openGraph: {
    title: "TicketScan - Tu asistente de compras inteligente",
    description: "Escanea tickets, categoriza gastos y controla tu presupuesto",
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
    // Origen de la misma petición: en Netlify el SSR no puede usar
    // localhost ni conocer su dominio de antemano (el fetch previo a
    // http://localhost:3000 devolvía ECONNREFUSED y la landing salía vacía).
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

function renderStars(rating: number) {
  return [...Array(5)].map((_, i) => (
    <span key={i} className={i < rating ? "text-yellow-400" : "text-slate-300"} aria-hidden="true">
      ★
    </span>
  ));
}

function RenderHero({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/50 to-white py-20 lg:py-32">
      <div className="page-content animate-in">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium mb-6 animate-in" style={{ animationDelay: "100ms" }}>
            {data.badge || "🎫 TicketScan"}
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6 animate-in" style={{ animationDelay: "200ms" }}>
            <span dangerouslySetInnerHTML={{ __html: data.headline || "Escanea, categoriza y analiza tus <span class=\"text-primary\">tickets de supermercado</span>" }} />
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 mb-8 max-w-2xl mx-auto animate-in" style={{ animationDelay: "300ms" }}>
            {data.subtext || "La app que usa IA para leer tus tickets, organizar tus gastos por categoría y mostrarte gráficos claros de tu presupuesto familiar."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: "400ms" }}>
            <a
              href={data.cta_primary_url || "https://mediafire.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-8 py-3.5 shadow-float"
            >
              {data.cta_primary_text || "Descargar APK (MediaFire)"}
            </a>
            <button className="btn-secondary text-lg px-8 py-3.5" disabled={data.cta_secondary_disabled !== false}>
              {data.cta_secondary_text || "Próximamente en Play Store"}
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-500 animate-in" style={{ animationDelay: "500ms" }}>
            {data.footnote || "Versión beta • Sin anuncios • Datos 100% tuyos"}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
      </div>
    </section>
  );
}

function RenderFeatures({ data }: { data: any }) {
  if (!data?.items?.length) return null;
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="page-content">
        <header className="text-center max-w-2xl mx-auto mb-16 animate-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4" dangerouslySetInnerHTML={{ __html: data.headline || "Todo lo que necesitas para <span class=\"text-primary\">controlar tus compras</span>" }} />
          <p className="text-lg text-slate-600">{data.subtext || "Diseñada para el contexto argentino: supermercados locales, moneda ARS, facturación AFIP."}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.items.map((feature: any, i: number) => (
            <article key={feature.title || i} className="card-padded animate-in flex flex-col" style={{ animationDelay: `${600 + i * 100}ms` }}>
              <div className="text-4xl mb-4" aria-hidden="true">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 flex-1">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RenderSocialProof({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="page-content">
        <header className="text-center max-w-2xl mx-auto mb-16 animate-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4" dangerouslySetInnerHTML={{ __html: data.headline || "Confiada por <span class=\"text-primary\">miles de familias</span> argentinas" }} />
          <p className="text-lg text-slate-600">{data.subtext || "Únete a quienes ya llevan el control de su presupuesto sin esfuerzo."}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {data.testimonials?.map((t: any, i: number) => (
            <article key={t.name || i} className="card-padded animate-in" style={{ animationDelay: `${800 + i * 100}ms` }}>
              <div className="flex gap-1 mb-3" aria-label={`${t.rating || 5} de 5 estrellas`}>
                {renderStars(t.rating || 5)}
              </div>
              <p className="text-slate-700 mb-4 italic">"{t.text}"</p>
              <footer className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-900">{t.name}</span>
                <span>·</span>
                <span>{t.location}</span>
              </footer>
            </article>
          ))}
        </div>
        <div className="text-center mt-12 animate-in" style={{ animationDelay: "1100ms" }}>
          <div className="inline-flex items-center gap-4 text-slate-600 flex-wrap justify-center">
            {data.stats?.map((s: any, i: number) => (
              <React.Fragment key={i}>
                <span className="font-bold text-3xl text-primary">{s.value}</span>
                <span>{s.label}</span>
                {i < (data.stats?.length || 0) - 1 && <span className="w-px h-8 bg-slate-200 mx-2" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RenderCTADownload({ data }: { data: any }) {
  if (!data) return null;
  return (
    <section className="py-20 lg:py-28 bg-primary text-white">
      <div className="page-content text-center animate-in">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">{data.headline || "¿Listo para empezar a ahorrar?"}</h2>
        <p className="text-primary-light text-lg mb-8 max-w-xl mx-auto">{data.subtext || "Descarga la APK ahora y escanea tu primer ticket en segundos. Sin registro, sin anuncios, tus datos nunca salen de tu teléfono."}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={data.cta_primary_url || "https://mediafire.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-white text-primary shadow-float-lg hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 px-8 py-3.5 text-lg"
          >
            {data.cta_primary_text || "Descargar APK desde MediaFire"}
          </a>
          <button className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 text-lg" disabled={data.cta_secondary_disabled !== false}>
            {data.cta_secondary_text || "Play Store (Próximamente)"}
          </button>
        </div>
      </div>
    </section>
  );
}

function RenderFooter({ data }: { data: any }) {
  if (!data) return null;
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 lg:py-24">
      <div className="page-content">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              {data.brand || "🎫 TicketScan"}
            </div>
            <p className="text-slate-400 max-w-xs mb-6">{data.description || "La app que escanea, categoriza y analiza tus tickets de supermercado automáticamente. Hecha en Argentina 🇦🇷"}</p>
            <div className="flex gap-4">
              {data.social_links?.map((s: any, i: number) => (
                <a key={i} href={s.url} className="text-slate-400 hover:text-white transition-colors" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <nav>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              {data.nav_producto?.map((item: any, i: number) => (
                <li key={i}><Link href={item.url} className="hover:text-primary transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </nav>
          <nav>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {data.nav_legal?.map((item: any, i: number) => (
                <li key={i}><Link href={item.url} className="hover:text-primary transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>{data.copyright || "© 2025 TicketScan. Hecho con ❤️ en Argentina."}</p>
          <div className="flex items-center gap-4">
            <span>{data.version || "Versión 1.0.0-beta"}</span>
            <a href={data.admin_link || "https://admin.ticket-ar.netlify.app"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Panel de administración
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function Home() {
  const config = await getLandingConfig();

  return (
    <main className="page-container">
      <RenderHero data={config.hero} />
      <RenderFeatures data={config.features} />
      <RenderSocialProof data={config["social-proof"]} />
      <RenderCTADownload data={config["cta-download"]} />
      <RenderFooter data={config.footer} />
    </main>
  );
}