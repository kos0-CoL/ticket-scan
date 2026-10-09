'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase-browser';
import { TabBar } from '@ticketscan/ui';

import '@/app/globals.css';

const mobileTabs = [
  { href: '/tickets', label: 'Tickets', icon: '🧾' },
  { href: '/analisis', label: 'Análisis', icon: '📊' },
  { href: '/config', label: 'Configuración', icon: '⚙️' },
];

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
      <head>
        <title>TicketScan</title>
        <meta name="description" content="Escanea y organiza tus tickets de supermercado" />
      </head>
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
      <head>
        <title>TicketScan</title>
        <meta name="description" content="Escanea y organiza tus tickets de supermercado" />
      </head>
      <body className="page-container">
        {showTabs && <TabBar items={mobileTabs} pathname={pathname} hideOnPaths={['/login', '/tickets/add']} />}
        <div className={showTabs ? 'pb-24' : ''}>{children}</div>
      </body>
    </html>
  );
}