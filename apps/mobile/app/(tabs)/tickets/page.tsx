'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../../lib/supabase-browser';

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">TicketScan</h1>
        <button onClick={signOut} className="text-sm text-blue-600">Salir</button>
      </div>
      <button onClick={() => {}} className="w-full rounded bg-blue-600 py-3 text-white mb-4">
        + Agregar ticket
      </button>
      {tickets.map(t => (
        <div key={t.id} className="bg-white rounded shadow p-4 mb-2">
          <div className="flex justify-between"><span className="font-medium">{t.comercio}</span><span>{t.total}</span></div>
          <div className="text-sm text-gray-500">{t.fecha} · {t.fuente}</div>
        </div>
      ))}
      {tickets.length === 0 && <p className="text-center text-gray-400 mt-8">Sin tickets</p>}
    </main>
  );
}
