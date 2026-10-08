interface CTADownloadSectionProps {
  data?: {
    enabled?: boolean;
    headline?: string;
    subtext?: string;
    cta_primary_text?: string;
    cta_primary_url?: string;
    cta_secondary_text?: string;
    cta_secondary_url?: string;
    cta_secondary_disabled?: boolean;
  };
}

export function CTADownloadSection({ data }: CTADownloadSectionProps) {
  if (!data) return null;
  return (
    <section className="relative py-[64px] lg:py-[80px] bg-primary overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-12 animate-in">
          <h2
            className="text-3xl lg:text-4xl font-bold text-white mb-4 animate-in"
            dangerouslySetInnerHTML={{
              __html: data.headline || "¿Listo para empezar a ahorrar?",
            }}
          />
          <p className="mx-auto max-w-xl text-lg text-primary-light animate-in" style={{ animationDelay: "150ms" }}>
            {data.subtext || "Descarga la APK ahora y escanea tu primer ticket en segundos. Sin registro, sin anuncios, tus datos nunca salen de tu teléfono."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: "300ms" }}>
          <a
            href={data.cta_primary_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-white text-primary shadow-float-lg hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 px-8 py-3.5 text-lg"
          >
            {data.cta_primary_text || "Descargar APK desde MediaFire"}
          </a>
          {!data.cta_secondary_disabled && (
            <a
              href={data.cta_secondary_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 text-lg"
            >
              {data.cta_secondary_text || "Play Store (Próximamente)"}
            </a>
          )}
          {data.cta_secondary_disabled && (
            <button
              disabled
              className="btn border-2 border-white text-white px-8 py-3.5 text-lg cursor-not-allowed opacity-60"
            >
              {data.cta_secondary_text || "Play Store (Próximamente)"}
            </button>
          )}
        </div>
      </div>
      <div className="absolute top-0 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-16 left-1/2 h-64 w-64 rounded-full bg-white/5 blur-3xl -translate-x-1/2" aria-hidden="true" />
    </section>
  );
}
