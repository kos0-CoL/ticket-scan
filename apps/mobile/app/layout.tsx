'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase-browser';

import '@/app/globals.css';

function TabBar() {
  return (
    <nav className="mobile-tab-bar">
      <Link href="/tickets" className="tab-item" aria-label="Tickets">
        <span aria-hidden="true">🧾</span> Tickets
      </Link>
      <Link href="/analisis" className="tab-item" aria-label="Análisis">
        <span aria-hidden="true">📊</span> Análisis
      </Link>
      <Link href="/config" className="tab-item" aria-label="Configuración">
        <span aria-hidden="true">⚙️</span> Config
      </Link>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(undefined);
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    if (session === null && pathname !== '/login') router.replace('/login');
  }, [session, pathname, router]);

  if (session === undefined || (session === null && pathname !== '/login')) return (
    <html lang="es">
      <body className="page-container loading-body">
        <div className="loading-screen">
          <div className="loading-icon"><span>🎫</span></div>
          <p className="text-muted">Cargando TicketScan...</p>
        </div>
      </body>
    </html>
  );

  return (
    <html lang="es">
      <body className="page-container">
        {showTabs && <TabBar />}
        <div className={showTabs ? 'pb-20' : ''}>{children}</div>
      </body>
    </html>
  );
}
