'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Badge, Card, CardHeader, CardContent } from '@ticketscan/ui';

interface LandingSection {
  id: string;
  key: string;
  title: string;
  content: Record<string, any>;
  enabled: boolean;
  sort_order: number;
}

export default function LandingPage() {
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LandingSection | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    title: '',
    content: '',
    enabled: true,
    sort_order: 0,
  });
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/api/admin/landing');
    const data = await res.json();
    setSections(data);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setFormData({ key: '', title: '', content: '{}', enabled: true, sort_order: 0 });
    setError('');
    setShowForm(true);
  }

  function openEdit(section: LandingSection) {
    setEditing(section);
    setFormData({
      key: section.key,
      title: section.title,
      content: JSON.stringify(section.content, null, 2),
      enabled: section.enabled,
      sort_order: section.sort_order,
    });
    setError('');
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    let content;
    try {
      content = JSON.parse(formData.content);
    } catch {
      setError('El campo "Contenido" debe ser JSON válido');
      return;
    }

    const payload = {
      ...formData,
      content,
      sort_order: Number(formData.sort_order),
    };

    const url = editing ? '/api/admin/landing' : '/api/admin/landing';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Error al guardar');
      return;
    }

    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar esta sección?')) return;
    const res = await fetch(`/api/admin/landing?id=${id}`, { method: 'DELETE' });
    if (res.ok) load();
    else alert('Error al eliminar');
  }

  const columns = [
    { key: 'key', header: 'Clave', className: 'font-mono text-sm' },
    { key: 'title', header: 'Título' },
    {
      key: 'enabled',
      header: 'Estado',
      render: (row: LandingSection) => (
        <Badge variant={row.enabled ? 'success' : 'muted'} dot>
          {row.enabled ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    { key: 'sort_order', header: 'Orden', className: 'text-muted' },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row: LandingSection) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => remove(row.id)}>Eliminar</Button>
                  </div>
      ),
    },
  ];

  return (
    <main className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Editor de Landing Page</h1>
            <p style={{ color: 'var(--color-500)', marginTop: '0.25rem' }}>Gestiona las secciones modulares de la página pública</p>
          </div>
          <Button onClick={openCreate}>+ Nueva sección</Button>
        </div>

        {sections.length === 0 ? (
          <Card padded className="text-center" style={{ padding: '3rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', margin: '0 0 0.5rem' }}>No hay secciones aún</h3>
            <p style={{ color: 'var(--color-500)', margin: '0 0 1.5rem' }}>Crea la primera sección para empezar a construir la landing page.</p>
            <Button onClick={openCreate}>Crear primera sección</Button>
          </Card>
        ) : (
          <Table
            columns={columns}
            data={sections}
            keyExtractor={(row) => row.id}
            hover
            divide
            emptyMessage="No hay secciones"
          />
        )}

        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={editing ? 'Editar sección' : 'Nueva sección'}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => { /* form submits via onSubmit */ }} type="submit" form="landing-form">
                {editing ? 'Actualizar' : 'Crear'}
              </Button>
            </>
          }
        >
          <form id="landing-form" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-danger-light)', color: '#B91C1C', fontSize: '0.875rem' }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Clave única (slug)</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={e => setFormData({ ...formData, key: e.target.value })}
                  style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }}
                  placeholder="hero, features, downloads, testimonials, footer..."
                  required
                  disabled={!!editing}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', marginTop: '0.25rem' }}>Identificador único para el frontend. No editable al editar.</p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }}
                  placeholder="Título de la sección"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Contenido (JSON)</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-900)', fontFamily: 'var(--font-mono)', minHeight: '200px', resize: 'vertical' }}
                  placeholder='{"subtitle": "Texto", "cta_text": "Botón", "cta_url": "/url", "image": "/img.png"}'
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Orden</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }}
                    min="0"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                      style={{ width: '1rem', height: '1rem', borderRadius: '0.375rem', border: '1px solid var(--color-300)', accentColor: 'var(--color-primary)' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>Sección activa</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </Modal>

        <Card padded style={{ marginTop: '2.5rem' }}>
          <CardHeader title="Vista previa de la configuración actual" />
          <CardContent>
            <pre style={{ fontSize: '0.875rem', color: 'var(--color-700)', overflowX: 'auto', margin: 0, fontFamily: 'var(--font-mono)' }}>
              {JSON.stringify(
                sections.filter(s => s.enabled).reduce((acc, s) => {
                  acc[s.key] = { ...s.content, enabled: s.enabled, title: s.title };
                  return acc;
                }, {} as Record<string, any>),
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}