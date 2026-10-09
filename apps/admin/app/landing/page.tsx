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
        <div className="landing-header-row">
          <div>
            <h1 className="section-title">Editor de Landing Page</h1>
            <p className="text-muted mt-1">Gestiona las secciones modulares de la página pública</p>
          </div>
          <button onClick={openCreate} className="btn btn-primary">
            + Nueva sección
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="card-padded landing-empty">
            <div className="landing-empty-icon">📄</div>
            <h3 className="landing-empty-title">No hay secciones aún</h3>
            <p className="text-muted mb-4">Crea la primera sección para empezar a construir la landing page.</p>
            <button onClick={openCreate} className="btn btn-primary">Crear primera sección</button>
          </div>
        ) : (
          <div className="landing-table-card">
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Clave</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Orden</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sections.map((section) => (
                    <tr key={section.id} className="hover-row">
                      <td className="mono-cell">{section.key}</td>
                      <td className="cell-medium">{section.title}</td>
                      <td>
                        <span className={`badge ${section.enabled ? 'badge-success' : 'badge-muted'}`}>
                          {section.enabled ? '●' : '○'} {section.enabled ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-muted">{section.sort_order}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            onClick={() => openEdit(section)}
                            className="btn btn-ghost text-sm px-3 py-1.5"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => remove(section.id)}
                            className="btn btn-ghost text-sm px-3 py-1.5 text-danger"
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
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <form onSubmit={save} className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="section-title">{editing ? 'Editar sección' : 'Nueva sección'}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost p-1">✕</button>
              </div>

              {error && <div className="error-box">{error}</div>}

              <div className="form-grid">
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
                  <p className="text-xs text-muted mt-1">Identificador único para el frontend. No editable al editar.</p>
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

                <div className="form-row-2">
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
                        className="checkbox"
                      />
                      <span className="text-sm">Sección activa</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Preview Section */}
        <div className="preview-section mt-10">
          <h2 className="section-title mb-3">Vista previa de la configuración actual</h2>
          <div className="card-padded preview-box">
            <pre className="preview-json">{JSON.stringify(
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
