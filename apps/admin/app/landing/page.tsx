'use client';

import { useEffect, useState } from 'react';

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

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="flex items-center justify-between mb-8 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Editor de Landing Page</h1>
            <p className="text-slate-600 mt-1">Gestiona las secciones modulares de la página pública</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            + Nueva sección
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="card-padded text-center py-12 animate-in">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay secciones aún</h3>
            <p className="text-slate-600 mb-6">Crea la primera sección para empezar a construir la landing page.</p>
            <button onClick={openCreate} className="btn-primary">Crear primera sección</button>
          </div>
        ) : (
          <div className="card animate-in overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface border-b border-primary-light/50">
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Clave</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Título</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Estado</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Orden</th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-light/50">
                  {sections.map((section) => (
                    <tr key={section.id} className="hover:bg-primary-light/20 transition-colors">
                      <td className="p-4 font-mono text-sm text-slate-900">{section.key}</td>
                      <td className="p-4 font-medium text-slate-900">{section.title}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${section.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                          {section.enabled ? '●' : '○'} {section.enabled ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{section.sort_order}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(section)}
                            className="btn-ghost text-sm px-3 py-1.5"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => remove(section.id)}
                            className="btn-ghost text-sm px-3 py-1.5 text-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in" onClick={() => setShowForm(false)}>
            <form onSubmit={save} className="bg-white rounded-2xl shadow-float-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">{editing ? 'Editar sección' : 'Nueva sección'}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost p-1">✕</button>
              </div>

              {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

              <div className="space-y-4">
                <div>
                  <label className="label">Clave única (slug)</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={e => setFormData({ ...formData, key: e.target.value })}
                    className="input"
                    placeholder="hero, features, downloads, testimonials, footer..."
                    required
                    disabled={!!editing}
                  />
                  <p className="text-xs text-slate-500 mt-1">Identificador único para el frontend. No editable al editar.</p>
                </div>

                <div>
                  <label className="label">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="Título de la sección"
                    required
                  />
                </div>

                <div>
                  <label className="label">Contenido (JSON)</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="input font-mono text-sm min-h-[200px] resize-y"
                    placeholder='{"subtitle": "Texto", "cta_text": "Botón", "cta_url": "/url", "image": "/img.png"}'
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Orden</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      className="input"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">Sección activa</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Preview Section */}
        <div className="mt-10 animate-in">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Vista previa de la configuración actual</h2>
          <div className="card-padded bg-slate-50">
            <pre className="text-sm text-slate-700 overflow-x-auto">{JSON.stringify(
              sections.filter(s => s.enabled).reduce((acc, s) => {
                acc[s.key] = { ...s.content, enabled: s.enabled, title: s.title };
                return acc;
              }, {} as Record<string, any>),
              null,
              2
            )}</pre>
          </div>
        </div>
      </div>
    </main>
  );
}