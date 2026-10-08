'use client';
import Link from 'next/link';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="sticky bottom-0 z-50 flex gap-1 p-2 bg-white/90 backdrop-blur-xl border-t border-primary-light/30 shadow-float">
        <Link href="/tickets" className="flex-1 flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition-all duration-200 hover:bg-primary-light hover:text-primary active:bg-primary-light/50" aria-label="Tickets">
          <span className="text-xl" aria-hidden="true">🧾</span> Tickets
        </Link>
        <Link href="/analisis" className="flex-1 flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition-all duration-200 hover:bg-primary-light hover:text-primary active:bg-primary-light/50" aria-label="Análisis">
          <span className="text-xl" aria-hidden="true">📊</span> Análisis
        </Link>
        <Link href="/config" className="flex-1 flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition-all duration-200 hover:bg-primary-light hover:text-primary active:bg-primary-light/50" aria-label="Configuración">
          <span className="text-xl" aria-hidden="true">⚙️</span> Config
        </Link>
      </nav>
      <div className="pb-20">{children}</div>
    </>
  );
}