interface HeroSectionProps {
  data?: {
    enabled?: boolean;
    badge?: string;
    headline?: string;
    subtext?: string;
    cta_primary_text?: string;
    cta_primary_url?: string;
    cta_secondary_text?: string;
    cta_secondary_url?: string;
    cta_secondary_disabled?: boolean;
    footnote?: string;
  };
}

export function HeroSection({ data }: HeroSectionProps) {
  if (!data) return null;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/30 to-white py-[64px] lg:py-[96px]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary shadow-sm animate-in" style={{ animationDelay: "100ms" }}>
            {data.badge || "🎫 TicketScan"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-slate-900 mt-6 animate-in" style={{ animationDelay: "200ms" }}>
            <span
              dangerouslySetInnerHTML={{
                __html:
                  data.headline ||
                  "Escanea, categoriza y analiza tus <span class='text-primary'>tickets de supermercado</span>",
              }}
            />
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg leading-relaxed text-slate-600 animate-in" style={{ animationDelay: "300ms" }}>
            {data.subtext ||
              "La app que usa IA para leer tus tickets, organizar tus gastos por categoría y mostrarte gráficos claros de tu presupuesto familiar."}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: "400ms" }}>
            <a
              href={data.cta_primary_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-lg px-8 py-3.5 shadow-float"
            >
              {data.cta_primary_text || "Descargar APK (MediaFire)"}
            </a>
            {!data.cta_secondary_disabled && (
              <a
                href={data.cta_secondary_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-lg px-8 py-3.5"
              >
                {data.cta_secondary_text || "Próximamente en Play Store"}
              </a>
            )}
            {data.cta_secondary_disabled && (
              <button
                disabled
                className="btn btn-secondary text-lg px-8 py-3.5 cursor-not-allowed opacity-60"
              >
                {data.cta_secondary_text || "Próximamente en Play Store"}
              </button>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-500 animate-in" style={{ animationDelay: "500ms" }}>
            {data.footnote || "Versión beta • Sin anuncios • Datos 100% tuyos"}
          </p>
        </div>
      </div>
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl -translate-x-1/2 translate-y-1/2" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
    </section>
  );
}
