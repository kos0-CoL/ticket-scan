'use client';
import { useEffect, useState } from 'react';

interface NormalizationEntry {
  id: string;
  nombre_raw: string;
  nombre_normalizado: string;
  categoria_asignada: string | null;
  metodo: string;
  confianza: number | null;
  status: string;
  created_at: string;
}

export default function NormalizationPage() {
  const [entries, setEntries] = useState<NormalizationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/admin/normalization');
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }

  async function approve(id: string, name: string, categoria: string) {
    await fetch('/api/admin/normalization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nombre_normalizado: name, categoria }),
    });
    load();
  }

  async function reject(id: string) {
    await fetch('/api/admin/normalization?id=' + id, { method: 'DELETE' });
    load();
  }

  if (loading) return <main className="p-8"><p>Cargando...</p></main>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Gestión de Normalización</h1>

      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="font-medium mb-2">Agregar regla manual</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const raw = (form.elements.namedItem('raw') as HTMLInputElement).value;
          const norm = (form.elements.namedItem('norm') as HTMLInputElement).value;
          const cat = (form.elements.namedItem('cat') as HTMLInputElement).value;
          await fetch('/api/admin/normalization', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw_name: raw, normalized_name: norm, categoria: cat }),
          });
          load();
          form.reset();
        }} className="space-y-3">
          <input name="raw" className="w-full rounded border px-3 py-2" placeholder="Nombre raw" required />
          <input name="norm" className="w-full rounded border px-3 py-2" placeholder="Nombre normalizado" required />
          <input name="cat" className="w-full rounded border px-3 py-2" placeholder="Categoría" required />
          <button className="btn-primary">Guardar regla</button>
        </form>
      </div>

      <table className="w-full border">
        <thead><tr className="bg-gray-100">
          <th className="p-2 text-left">Raw</th>
          <th className="p-2 text-left">Normalizado</th>
          <th className="p-2 text-left">Categoría</th>
          <th className="p-2 text-left">Método</th>
          <th className="p-2 text-left">Confianza</th>
          <th className="p-2 text-left">Estado</th>
          <th className="p-2 text-left">Acciones</th>
        </tr></thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id} className="border-t">
              <td className="p-2">{e.nombre_raw}</td>
              <td className="p-2">{e.nombre_normalizado}</td>
              <td className="p-2">{e.categoria_asignada ?? '-'}</td>
              <td className="p-2 capitalize">{e.metodo}</td>
              <td className="p-2">{e.confianza ?? '-'}</td>
              <td className="p-2 capitalize">{e.status}</td>
              <td className="p-2 space-x-1">
                <button onClick={() => approve(e.id, e.nombre_normalizado, e.categoria_asignada ?? '')}
                  className="rounded border px-2 py-1 text-xs">Aprobar</button>
                <button onClick={() => reject(e.id)}
                  className="rounded border px-2 py-1 text-xs text-red-600">Rechazar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
