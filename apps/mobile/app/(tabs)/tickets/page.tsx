'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../../lib/supabase-browser';
import Link from 'next/link';

import '@/app/globals.css';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;
      const res = await fetch('/api/tickets?userId=' + data.user.id);
      const json = await res.json();
      setTickets(json);
    } catch (err: any) {
      console.error('Error loading tickets:', err);
    }
  }

  async function signOut() {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  }

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TicketScan</h1>
          <p className="text-slate-500 text-sm">Tus tickets organizados</p>
        </div>
        <button onClick={signOut} className="btn-ghost text-sm">Salir</button>
      </div>
      <Link href="/tickets/add" className="btn-float">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Agregar ticket
      </Link>
      {tickets.length === 0 ? (
        <div className="card-padded text-center animate-in">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧾</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sin tickets aún</h2>
          <p className="text-slate-500 mb-6">Tu primer ticket está a un toque de distancia</p>
          <Link href="/tickets/add" className="btn-primary inline-flex">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Escanear ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <Link key={t.id} href={`/tickets/${t.id}`} className="card-padded group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🏪</span>
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{t.comercio}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{t.fecha}</span>
                    <span>·</span>
                    <span className="capitalize">{t.fuente}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-primary">{t.total}</span>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
