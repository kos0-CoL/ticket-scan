interface FeaturesSectionProps {
  data?: {
    enabled?: boolean;
    headline?: string;
    subtext?: string;
    items?: Array<{
      icon?: string;
      title?: string;
      desc?: string;
    }>;
  };
}

export function FeaturesSection({ data }: FeaturesSectionProps) {
  if (!data || !data.items?.length) return null;
  return (
    <section className="py-[64px] lg:py-[80px] bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-3xl mx-auto mb-16 animate-in">
          <h2
            className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4 animate-in"
            dangerouslySetInnerHTML={{
              __html: data.headline || "Todo lo que necesitas para <span class='text-primary'>controlar tus compras</span>",
            }}
          />
          <p className="mt-4 text-lg text-slate-600">
            {data.subtext || "Diseñada para el contexto argentino: supermercados locales, moneda ARS, facturación AFIP."}
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.items.map((feature, i) => (
            <article
              key={feature.title || i}
              className="card-padded animate-in flex flex-col"
              style={{ animationDelay: `${600 + i * 100}ms` }}
            >
              <div className="text-4xl mb-4" aria-hidden="true">
                {feature.icon || "⚡"}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {feature.title || "Sin título"}
              </h3>
              <p className="text-slate-600 flex-1">
                {feature.desc || "Descripción no disponible."}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
