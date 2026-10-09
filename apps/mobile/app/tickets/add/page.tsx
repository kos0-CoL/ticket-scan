'use client';

import { useState } from 'react';
import { getSupabaseClient } from '../../../lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@ticketscan/ui';

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
    <main style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-900)', marginBottom: '1rem' }}>Agregar ticket</h1>
      {error && (
        <div style={{ color: '#B91C1C', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{error}</div>
      )}
      <Card padded style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Button variant="primary" onClick={pickImage} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Procesando...' : 'Importar imagen'}
        </Button>
        <Button variant="ghost" style={{ width: '100%' }}>Modo panorámico (próximamente)</Button>
        <Button variant="ghost" size="sm" style={{ width: '100%', color: 'var(--color-500)', fontSize: '0.75rem' }}>Escanear QR (experimental)</Button>
        {preview && (
          <img src={preview} alt="Preview" style={{ marginTop: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(0, 171, 228, 0.1)', maxHeight: '16rem', width: '100%', objectFit: 'cover' }} />
        )}
      </Card>
    </main>
  );
}