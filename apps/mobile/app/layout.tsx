'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase-browser';

import '@/app/globals.css';

// Barra de tabs. Antes vivía en app/(tabs)/layout.tsx; los route groups con
// paréntesis generan rutas de chunk con `(` y `)`, que el deploy de Sites
// rechaza, así que los carpetas se aplanaron y la nav vive aquí.
function TabBar() {
  return (
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
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // undefined = cargando; null = sin sesión; objeto = sesión activa.
  // Antes arrancaba en null, y "session === null" devolvía el splash para
  // siempre: getSession() resuelve con null cuando no hay sesión, así que el
  // estado nunca cambiaba y el router.replace('/login') de abajo era
  // inalcanzable (splash eterno para cualquier usuario deslogueado).
  const [session, setSession] = useState<any>(undefined);
  const router = useRouter();
  const pathname = usePathname();
  // La barra de tabs solo en las rutas que tenían el layout (tabs)
  const showTabs = !!pathname && (pathname === '/tickets' || pathname.startsWith('/tickets/') || pathname === '/analisis' || pathname === '/config');

  useEffect(() => {
    try {
      const supabase = getSupabaseClient();
      supabase.auth.getSession().then(({ data }) => setSession(data?.session));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      return () => { listener.subscription.unsubscribe(); };
    } catch (err: any) {
      console.error('Supabase error:', err);
    }
  }, []);

  // Redirigir a /login fuera del render (y sin pisar la propia /login).
  useEffect(() => {
    if (session === null && pathname !== '/login') router.replace('/login');
  }, [session, pathname, router]);

  // Splash mientras carga, o mientras espera la redirección a /login.
  if (session === undefined || (session === null && pathname !== '/login')) return (
    <html lang="es">
      <body className="page-container flex items-center justify-center">
        <div className="text-center animate-in">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎫</span>
          </div>
          <p className="text-slate-500">Cargando TicketScan...</p>
        </div>
      </body>
    </html>
  );

  return (
    <html lang="es">
      <body className="page-container">
        {showTabs && <TabBar />}
        <div className={showTabs ? 'pb-20' : undefined}>{children}</div>
      </body>
    </html>
  );
}
