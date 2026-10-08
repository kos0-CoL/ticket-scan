'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { getSupabaseClient } from '../../../lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function AddTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  async function pickImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      await processImage(file);
    };
    input.click();
  }

  async function processImage(file: File) {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const buffer = await file.arrayBuffer();
      const ext = file.name.split('.').pop() || 'jpg';

      // Generate random ID - simple approach to avoid build issues
      const randomId = Math.random().toString(36).substr(2, 9);
      const path = user.id + '/' + randomId + '.' + ext;

      const { data: upload } = await supabase.storage.from('tickets').upload(path, buffer);
      if (!upload) throw new Error('Upload falló');
      const { data: url } = supabase.storage.from('tickets').getPublicUrl(path);

      const res = await fetch('/api/tickets/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, imageUrl: url.publicUrl })
      });
      if (!res.ok) throw new Error('Procesamiento falló');
      router.push('/tickets');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Agregar ticket</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <button onClick={pickImage} disabled={loading} className="w-full rounded bg-blue-600 py-3 text-white">
        {loading ? 'Procesando...' : ' Importar imagen'}
      </button>
      <button className="w-full rounded border py-3 mt-2">Modo panorámico (próximamente)</button>
      <button className="w-full rounded border py-3 mt-2 text-xs text-gray-500">Escanear QR (experimental)</button>
      {preview && <img src={preview} className="mt-4 rounded border max-h-64" />}
    </main>
  );
}
