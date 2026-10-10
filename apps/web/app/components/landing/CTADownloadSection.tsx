'use client';

interface CTADownloadData {
  primary_cta?: string;
  secondary_cta?: string;
}

export function CTADownloadSection({ data }: { data: CTADownloadData }) {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden" aria-labelledby="cta-heading">
      {/* Background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          ¿Listo para empezar a <span className="text-primary">ahorrar?</span>
        </h2>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Descarga la APK ahora y escanea tu primer ticket en segundos. Sin registro, sin anuncios, tus datos nunca salen de tu teléfono.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://mediafire.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Descargar APK desde MediaFire
          </a>
          <button disabled className="inline-flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold cursor-not-allowed">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
            Play Store (Próximamente)
          </button>
        </div>

        {/* Features highlight */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list" aria-label="Características de la app">
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300" role="listitem">
            <span className="text-3xl mb-3 block" aria-hidden="true">📱</span>
            <h3 className="font-semibold text-slate-900 mb-1">Funciona offline</h3>
            <p className="text-slate-600 text-sm">Escanea sin conexión a internet</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300" role="listitem">
            <span className="text-3xl mb-3 block" aria-hidden="true">🔒</span>
            <h3 className="font-semibold text-slate-900 mb-1">Datos en tu teléfono</h3>
            <p className="text-slate-600 text-sm">Nada sale de tu dispositivo</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300" role="listitem">
            <span className="text-3xl mb-3 block" aria-hidden="true">⚡</span>
            <h3 className="font-semibold text-slate-900 mb-1">Escaneo instantáneo</h3>
            <p className="text-slate-600 text-sm">OCR en menos de 3 segundos</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300" role="listitem">
            <span className="text-3xl mb-3 block" aria-hidden="true">📊</span>
            <h3 className="font-semibold text-slate-900 mb-1">Gráficos automáticos</h3>
            <p className="text-slate-600 text-sm">Análisis sin configuración</p>
          </div>
        </div>
      </div>
    </section>
  );
}