'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase-browser';

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

  if (session === null) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  if (!session) router.replace('/login');

  return (
    <html lang="es">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
