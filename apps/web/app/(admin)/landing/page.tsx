'use client';

import { useState } from 'react';
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

const mockSections: LandingSection[] = [
  { id: '1', key: 'hero', title: 'Hero Section', enabled: true, sort_order: 1, content: { title: 'Escanea, categoriza y analiza', subtitle: 'tus tickets de supermercado', cta_text: 'Descargar APK', cta_url: '#' }, updated_at: '2025-01-15T10:00:00Z' },
  { id: '2', key: 'features', title: 'Características', enabled: true, sort_order: 2, content: { items: [] }, updated_at: '2025-01-15T10:00:00Z' },
  { id: '3', key: 'social-proof', title: 'Testimonios', enabled: true, sort_order: 3, content: { testimonials: [] }, updated_at: '2025-01-15T10:00:00Z' },
  { id: '4', key: 'cta-download', title: 'CTA Descarga', enabled: true, sort_order: 4, content: { primary_cta: 'Descargar', secondary_cta: 'Play Store' }, updated_at: '2025-01-15T10:00:00Z' },
  { id: '5', key: 'footer', title: 'Footer', enabled: true, sort_order: 5, content: { brand: 'TicketScan', description: 'Tu app de tickets' }, updated_at: '2025-01-15T10:00:00Z' },
];

export default function LandingPage() {
  const [sections, setSections] = useState<LandingSection[]>(mockSections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<LandingSection | null>(null);
  const [formData, setFormData] = useState({ key: '', title: '', enabled: true, sort_order: 0, content: {} });

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

  const handleToggle = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleSave = () => {
    if (editingSection) {
      setSections(sections.map(s => s.id === editingSection.id ? { ...s, ...formData, updated_at: new Date().toISOString() } : s));
    }
    setIsModalOpen(false);
    setEditingSection(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración Landing Page</h1>
          <p className="text-slate-500">Gestiona las secciones visibles en la página pública</p>
        </div>
      </div>

      <Card elevated>
        <Table columns={columns} data={sections} keyExtractor={s => s.id} hover divide />
      </Card>

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