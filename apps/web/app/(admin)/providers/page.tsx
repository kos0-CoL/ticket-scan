'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardContent, Table, Modal, ConfirmModal, Input, Select, Badge, StatusBadge } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface Provider {
  id: string;
  name: string;
  default_model: string;
  fallback_order: number;
  is_active: boolean;
  created_at: string;
}

interface Model {
  id: string;
  name: string;
  context_length: number;
  pricing: { input: number; output: number };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([
    { id: '1', name: 'OpenRouter', default_model: 'google/gemini-1.5-flash', fallback_order: 1, is_active: true, created_at: '2025-01-15' },
    { id: '2', name: 'OpenAI', default_model: 'gpt-4o-mini', fallback_order: 2, is_active: true, created_at: '2025-01-15' },
    { id: '3', name: 'Anthropic', default_model: 'claude-3.5-sonnet', fallback_order: 3, is_active: false, created_at: '2025-01-15' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({ name: '', default_model: '', fallback_order: 1, is_active: true });
  const [models, setModels] = useState<Model[]>([]);
  const [showModelsFor, setShowModelsFor] = useState<string | null>(null);

  const columns: Column<Provider>[] = [
    { key: 'name', header: 'Proveedor', render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'default_model', header: 'Modelo por defecto', render: (p) => <span className="font-mono text-sm">{p.default_model}</span> },
    { key: 'fallback_order', header: 'Orden fallback', render: (p) => <span>{p.fallback_order}</span> },
    { key: 'is_active', header: 'Estado', render: (p) => <StatusBadge status={p.is_active ? 'active' : 'inactive'} /> },
    { key: 'actions', header: 'Acciones', render: (p) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>Editar</Button>
        <Button variant="ghost" size="sm" onClick={() => handleModels(p)}>Modelos</Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(p)}>Eliminar</Button>
      </div>
    )},
  ];

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({ name: provider.name, default_model: provider.default_model, fallback_order: provider.fallback_order, is_active: provider.is_active });
    setIsModalOpen(true);
  };

  const handleModels = (provider: Provider) => {
    setShowModelsFor(provider.id);
    // Fetch models would go here
  };

  const handleSave = async () => {
    if (editingProvider) {
      setProviders(providers.map(p => p.id === editingProvider.id ? { ...p, ...formData } : p));
    } else {
      setProviders([...providers, { id: Date.now().toString(), ...formData, created_at: new Date().toISOString() }]);
    }
    setIsModalOpen(false);
    setEditingProvider(null);
    setFormData({ name: '', default_model: '', fallback_order: 1, is_active: true });
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setProviders(providers.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores de IA</h1>
          <p className="text-slate-500">Gestiona los proveedores y modelos de IA disponibles</p>
        </div>
        <Button onClick={() => handleEdit({ id: '', name: '', default_model: '', fallback_order: providers.length + 1, is_active: true, created_at: '' })}>Nuevo proveedor</Button>
      </div>

      <Card elevated>
        <Table columns={columns} data={providers} keyExtractor={p => p.id} hover divide />
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProvider ? 'Editar proveedor' : 'Nuevo proveedor'} size="md">
        <div className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="ej. OpenRouter" />
          <Input label="Modelo por defecto" value={formData.default_model} onChange={e => setFormData({ ...formData, default_model: e.target.value })} placeholder="ej. google/gemini-1.5-flash" />
          <Select label="Orden fallback" value={formData.fallback_order.toString()} onChange={e => setFormData({ ...formData, fallback_order: parseInt(e.target.value) })} options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} />
          <Select label="Estado" value={formData.is_active.toString()} onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })} options={[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={false}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Eliminar proveedor" message="¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer." />
    </div>
  );
}