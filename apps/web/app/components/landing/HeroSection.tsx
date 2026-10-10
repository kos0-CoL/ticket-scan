'use client';

import { Button } from '@ticketscan/ui';

interface HeroData {
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  image?: string;
  badge?: string;
}

export function HeroSection({ data }: { data: HeroData }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-in">
          <span className="text-2xl" aria-hidden="true">🎫</span>
          <span>TicketScan</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight animate-in">
          <span className="block">Escanea, categoriza y analiza tus</span>
          <span className="text-primary">tickets de supermercado</span>
          <span className="block text-slate-600 font-normal text-2xl md:text-3xl mt-2">— ahora más rápido</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto animate-in" style={{ animationDelay: '100ms' }}>
          La app que usa IA para leer tus tickets, organizar tus gastos por categoría y mostrarte gráficos claros de tu presupuesto familiar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: '200ms' }}>
          <a
            href="https://mediafire.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Descargar APK (MediaFire)
          </a>
          <button disabled className="inline-flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold cursor-not-allowed">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            Próximamente en Play Store
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-12 animate-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
            <span className="text-sm text-slate-600">Versión beta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
            <span className="text-sm text-slate-600">Sin anuncios</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
            <span className="text-sm text-slate-600">Datos 100% tuyos</span>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in" style={{ animationDelay: '400ms' }} role="img" aria-label="Indicadores de confianza">
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-slate-700">99% precisión OCR</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12a2 2 0 100-4h14a2 2 0 100 4M5 12a2 2 0 100-4h14a2 2 0 100 4zm0 0v12" />
          </svg>
          <span className="text-sm font-medium text-slate-700">Seguro y privado</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-medium text-slate-700">Hecho en Argentina 🇦🇷</span>
        </div>
      </div>
    </section>
  );
}