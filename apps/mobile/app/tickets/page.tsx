'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../../lib/supabase-browser';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button, Card, Badge } from '@ticketscan/ui';

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

  if (loading) return (
    <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ height: '2rem', backgroundColor: 'var(--color-200)', borderRadius: '0.5rem', width: '75%' }} />
        {[...Array(3)].map((_, i) => (
          <Card key={i} padded style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ height: '2.5rem', width: '6rem', backgroundColor: 'var(--color-200)', borderRadius: '0.5rem' }} />
            <div style={{ height: '1rem', width: '8rem', backgroundColor: 'var(--color-200)', borderRadius: '0.5rem' }} />
          </Card>
        ))}
      </div>
    </main>
  );

  return (
    <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>TicketScan</h1>
          <p style={{ color: 'var(--color-500)', fontSize: '0.875rem', margin: 0 }}>Tus tickets organizados</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Actualizar"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>Salir</Button>
        </div>
      </div>

      {error && (
        <div style={{ borderRadius: '0.75rem', backgroundColor: 'rgba(185, 28, 28, 0.1)', border: '1px solid rgba(185, 28, 28, 0.2)', padding: '0.75rem', fontSize: '0.875rem', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={handleRefresh} style={{ color: '#B91C1C', padding: 0 }}>Reintentar</Button>
        </div>
      )}

      <Link href="/tickets/add" style={{ position: 'fixed', bottom: '6rem', right: '1rem', zIndex: 40, boxShadow: 'var(--shadow-float)' }}>
        <Button variant="primary" size="icon" aria-label="Agregar ticket">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </Link>

      {tickets.length === 0 ? (
        <Card padded style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', backgroundColor: 'rgba(0, 171, 228, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem' }}>🧾</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-900)', marginBottom: '0.5rem' }}>Sin tickets aún</h2>
          <p style={{ color: 'var(--color-500)', marginBottom: '1.5rem' }}>Tu primer ticket está a un toque de distancia</p>
          <Link href="/tickets/add">
            <Button variant="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Escanear ticket
            </Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} role="list" aria-label="Lista de tickets">
          {tickets.map(t => (
            <Link key={t.id} href={`/tickets/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card padded className="group flex items-start justify-between gap-1 animate-in" role="listitem">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.25rem' }} aria-hidden="true">🏪</span>
                    <h3 style={{ fontWeight: '600', color: 'var(--color-900)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.comercio}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-500)', flexWrap: 'wrap' }}>
                    <span>{formatDate(t.fecha)}</span>
                    {t.hora && <span>·</span>}
                    {t.hora && <span>{t.hora.slice(0, 5)}</span>}
                    <span>·</span>
                    <Badge variant="primary" style={{ backgroundColor: 'rgba(0, 171, 228, 0.1)', color: 'var(--color-primary)', fontSize: '0.75rem' }}>
                      {t.fuente}
                    </Badge>
                    {t.sucursal && (
                      <>
                        <span>·</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{t.sucursal}</span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>{formatCurrency(t.total)}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--color-300)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}