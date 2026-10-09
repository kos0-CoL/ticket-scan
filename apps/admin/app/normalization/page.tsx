'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Badge, Card, CardHeader, CardContent } from '@ticketscan/ui';

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

  const columns = [
    { key: 'nombre_raw', header: 'Raw' },
    { key: 'nombre_normalizado', header: 'Normalizado' },
    { key: 'categoria_asignada', header: 'Categoría', render: (e: NormalizationEntry) => <span>{e.categoria_asignada ?? '-'}</span> },
    { key: 'metodo', header: 'Método', render: (e: NormalizationEntry) => <span style={{ textTransform: 'capitalize' }}>{e.metodo}</span> },
    { key: 'confianza', header: 'Confianza', render: (e: NormalizationEntry) => <span>{e.confianza ?? '-'}</span> },
    { key: 'status', header: 'Estado', render: (e: NormalizationEntry) => <Badge variant={e.status === 'approved' ? 'success' : e.status === 'pending' ? 'warning' : 'muted'} dot>{e.status}</Badge> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (e: NormalizationEntry) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={() => approve(e.id, e.nombre_normalizado, e.categoria_asignada ?? '')}>
            Aprobar
          </Button>
          <Button variant="danger" size="sm" onClick={() => reject(e.id)}>
            Rechazar
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <main className="page-container"><div className="page-content"><p className="text-muted">Cargando normalización...</p></div></main>;

  return (
    <main className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Gestión de Normalización</h1>
        </div>

        <Card padded style={{ marginBottom: '1.5rem' }}>
          <CardHeader title="Agregar regla manual" />
          <CardContent>
            <form
              onSubmit={async (e) => {
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
              }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Nombre raw</label>
                <input name="raw" style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }} placeholder="Nombre raw" required />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Nombre normalizado</label>
                <input name="norm" style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }} placeholder="Nombre normalizado" required />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Categoría</label>
                <input name="cat" style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }} placeholder="Categoría" required />
              </div>
              <Button type="submit">Guardar regla</Button>
            </form>
          </CardContent>
        </Card>

        <Table
          columns={columns}
          data={entries}
          keyExtractor={(e) => e.id}
          hover
          divide
          emptyMessage="No hay entradas de normalización"
        />
      </div>
    </main>
  );
}