'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase-browser';

import '@/app/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

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

  if (session === null) return (
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
  if (!session) router.replace('/login');

  return (
    <html lang="es">
      <body className="page-container">{children}</body>
    </html>
  );
}
