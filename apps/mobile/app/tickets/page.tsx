'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../../lib/supabase-browser';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import '@/app/globals.css';

interface Ticket {
  id: string;
  comercio: string;
  fecha: string;
  hora?: string;
  total: number;
  fuente: string;
  imagen_url?: string;
  sucursal?: string;
  metodo_pago?: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      setError(null);
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;

      const res = await fetch(`/api/tickets?userId=${data.user.id}`);
      if (!res.ok) throw new Error('Error al cargar tickets');
      const json = await res.json();
      setTickets(json.tickets || json);
    } catch (err: any) {
      console.error('Error loading tickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  async function signOut() {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(dateStr: string) {
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  }

  if (loading) {
    return (
      <main className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-padded">
              <div className="flex items-center gap-4">
                <div className="h-10 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 pb-24 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TicketScan</h1>
          <p className="text-slate-500 text-sm">Tus tickets organizados</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-ghost text-sm p-2"
            aria-label="Actualizar"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button onClick={signOut} className="btn-ghost text-sm">Salir</button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 animate-in flex items-center justify-between">
          <span>{error}</span>
          <button onClick={handleRefresh} className="text-red-600 hover:underline text-sm">Reintentar</button>
        </div>
      )}

      <Link href="/tickets/add" className="btn-float fixed bottom-24 right-4 z-40 shadow-float-lg" aria-label="Agregar ticket">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {tickets.length === 0 ? (
        <div className="card-padded text-center animate-in py-12">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧾</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sin tickets aún</h2>
          <p className="text-slate-500 mb-6">Tu primer ticket está a un toque de distancia</p>
          <Link href="/tickets/add" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Escanear ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Lista de tickets">
          {tickets.map(t => (
            <Link
              key={t.id}
              href={`/tickets/${t.id}`}
              className="card-padded group flex items-start justify-between gap-4 animate-in"
              role="listitem"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg" aria-hidden="true">🏪</span>
                  <h3 className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {t.comercio}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                  <span>{formatDate(t.fecha)}</span>
                  {t.hora && <span>·</span>}
                  {t.hora && <span>{t.hora.slice(0, 5)}</span>}
                  <span>·</span>
                  <span className="capitalize px-2 py-0.5 rounded-full bg-primary-light/50 text-primary text-xs">
                    {t.fuente}
                  </span>
                  {t.sucursal && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-[120px]">{t.sucursal}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xl font-bold text-primary">{formatCurrency(t.total)}</span>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}