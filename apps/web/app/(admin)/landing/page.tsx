'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Table, Button, Input, Textarea, Modal, Badge, StatusBadge, Select } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface LandingSection {
  id: string;
  key: string;
  title: string;
  enabled: boolean;
  sort_order: number;
  content: Record<string, unknown>;
  updated_at: string;
}

interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
}

export default function LandingPage() {
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<LandingSection | null>(null);
  const [formData, setFormData] = useState({ key: '', title: '', enabled: true, sort_order: 0, content: {} });

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/landing');
      const result: PaginatedResponse<LandingSection> = await res.json();
      if (result.ok) {
        setSections(result.data);
      }
    } catch (err) {
      console.error('Error fetching landing sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const columns: Column<LandingSection>[] = [
    { key: 'title', header: 'Sección', render: (s) => <span className="font-medium">{s.title}</span> },
    { key: 'key', header: 'Clave', render: (s) => <span className="font-mono text-sm">{s.key}</span> },
    { key: 'enabled', header: 'Estado', render: (s) => <StatusBadge status={s.enabled ? 'active' : 'inactive'} /> },
    { key: 'sort_order', header: 'Orden', render: (s) => <span>{s.sort_order}</span> },
    { key: 'actions', header: 'Acciones', render: (s) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}>Editar</Button>
        <Button variant="secondary" size="sm" onClick={() => handleToggle(s.id)}>{s.enabled ? 'Desactivar' : 'Activar'}</Button>
      </div>
    )},
  ];

  const handleEdit = (section: LandingSection) => {
    setEditingSection(section);
    setFormData({ key: section.key, title: section.title, enabled: section.enabled, sort_order: section.sort_order, content: section.content });
    setIsModalOpen(true);
  };

  const handleToggle = async (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    try {
      const res = await fetch(`/api/admin/landing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !section.enabled }),
      });
      const result = await res.json();
      if (result.ok) {
        await fetchSections();
      } else {
        alert(result.error || 'Error al actualizar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleSave = async () => {
    if (!formData.key || !formData.title) {
      alert('Clave y título requeridos');
      return;
    }

    const method = editingSection ? 'PUT' : 'POST';
    const url = editingSection ? `/api/admin/landing/${editingSection.id}` : '/api/admin/landing';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.ok) {
        await fetchSections();
        setIsModalOpen(false);
        setEditingSection(null);
        setFormData({ key: '', title: '', enabled: true, sort_order: 0, content: {} });
      } else {
        alert(result.error || 'Error al guardar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración Landing Page</h1>
          <p className="text-slate-500">Gestiona las secciones visibles en la página pública</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <Card elevated>
          <Table columns={columns} data={sections} keyExtractor={s => s.id} hover divide emptyMessage="No hay secciones configuradas" />
        </Card>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSection ? 'Editar sección' : 'Nueva sección'} size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <Input label="Clave (key)" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} placeholder="ej. hero" disabled={!!editingSection} />
          <Input label="Título" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="ej. Hero Section" />
          <Select label="Estado" value={formData.enabled.toString()} onChange={e => setFormData({ ...formData, enabled: e.target.value === 'true' })} options={[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]} />
          <Input label="Orden" type="number" value={formData.sort_order.toString()} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} />
          <Textarea label="Contenido (JSON)" value={JSON.stringify(formData.content, null, 2)} onChange={e => { try { setFormData({ ...formData, content: JSON.parse(e.target.value) }); } catch {} }} rows={10} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}