interface SocialProofSectionProps {
  data?: {
    enabled?: boolean;
    headline?: string;
    subtext?: string;
    testimonials?: Array<{
      name?: string;
      location?: string;
      text?: string;
      rating?: number;
    }>;
    stats?: Array<{
      value?: string | number;
      label?: string;
    }>;
  };
}

function StarRating({ rating = 5 }: { rating?: number }) {
  return [...Array(5)].map((_, i) => (
    <span
      key={i}
      aria-hidden="true"
      className={i < rating ? "text-accent" : "text-slate-300"}
    >
      ★
    </span>
  ));
}

export function SocialProofSection({ data }: SocialProofSectionProps) {
  if (!data) return null;

  return (
    <section className="py-[64px] lg:py-[80px] bg-surface">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-3xl mx-auto mb-16 animate-in">
          <h2
            className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4 animate-in"
            dangerouslySetInnerHTML={{
              __html:
                data.headline || "Confiada por <span class='text-primary'>miles de familias</span> argentinas",
            }}
          />
          <p className="mt-4 text-lg text-slate-600">
            {data.subtext || "Únete a quienes ya llevan el control de su presupuesto sin esfuerzo."}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {data.testimonials?.map((t, i) => (
            <article
              key={t.name || i}
              className="card-padded animate-in"
              style={{ animationDelay: `${800 + i * 100}ms` }}
            >
              <div className="flex gap-1 mb-3" aria-label={`${t.rating || 5} de 5 estrellas`}>
                <StarRating rating={t.rating || 5} />
              </div>
              <p className="text-slate-700 italic mb-4">"{t.text || ""}"</p>
              <footer className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-900">{t.name || "Anónimo"}</span>
                <span>·</span>
                <span>{t.location || "Ubicación"}</span>
              </footer>
            </article>
          ))}
        </div>

        {data.stats?.length && (
          <div className="text-center animate-in" style={{ animationDelay: "1100ms" }}>
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600">
              {data.stats.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                  <span className="font-bold text-3xl text-primary">{s.value || ""}</span>
                  <span>{s.label || ""}</span>
                  {i < (data.stats?.length || 0) - 1 && <span className="w-px h-8 bg-slate-200 mx-2" />}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
