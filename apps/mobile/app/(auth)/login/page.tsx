'use client';
export const dynamic = 'force-dynamic';
import { getSupabaseClient } from '../../../lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.replace('/tickets');
    } catch (err: any) {
      setError('Error de conexión: ' + err.message);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) setError(error.message);
    } catch (err: any) {
      setError('Error de conexión: ' + err.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">TicketScan</h1>
        <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full rounded border px-3 py-2" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-blue-600 py-2 text-white" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" onClick={handleGoogle} className="w-full rounded border py-2 text-sm">
          Continuar con Google
        </button>
        <p className="text-center text-xs text-gray-400">Sin registro: se crea cuenta al subir primer ticket</p>
      </form>
    </main>
  );
}
