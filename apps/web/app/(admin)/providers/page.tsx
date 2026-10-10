'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardContent, Table, Modal, ConfirmModal, Input, Select, StatusBadge } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface Provider {
  id: string;
  name: string;
  default_model: string;
  fallback_order: number;
  is_active: boolean;
  created_at: string;
  ml_configs?: any[];
}

interface Model {
  id: string;
  name: string;
  context_length: number;
  pricing: { input: number; output: number };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({ name: '', default_model: '', fallback_order: 1, is_active: true });
  const [models, setModels] = useState<Model[]>([]);
  const [showModelsFor, setShowModelsFor] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/providers');
      const data = await res.json();
      if (data.ok) {
        setProviders(data.data);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

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

  const handleModels = async (provider: Provider) => {
    try {
      const res = await fetch(`/api/providers/${provider.name.toLowerCase()}/models`);
      const data = await res.json();
      if (data.ok) {
        setModels(data.models);
        setShowModelsFor(provider.name);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  };

  const handleSave = async () => {
    const method = editingProvider ? 'PUT' : 'POST';
    const url = editingProvider ? `/api/admin/providers/${editingProvider.id}` : '/api/admin/providers';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.ok) {
      await fetchProviders();
      setIsModalOpen(false);
      setEditingProvider(null);
      setFormData({ name: '', default_model: '', fallback_order: 1, is_active: true });
    } else {
      alert(data.error || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    const res = await fetch(`/api/admin/providers/${deleteConfirm.id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (data.ok) {
      await fetchProviders();
      setDeleteConfirm(null);
    } else {
      alert(data.error || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores de IA</h1>
          <p className="text-slate-500">Gestiona los proveedores y modelos de IA disponibles</p>
        </div>
        <Button onClick={() => handleEdit({ id: '', name: '', default_model: '', fallback_order: (providers.length + 1), is_active: true, created_at: '' })}>Nuevo proveedor</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <Card elevated>
          <Table columns={columns} data={providers} keyExtractor={p => p.id} hover divide emptyMessage="No hay proveedores configurados" />
        </Card>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProvider ? 'Editar proveedor' : 'Nuevo proveedor'} size="md">
        <div className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="ej. OpenRouter" />
          <Input label="Modelo por defecto" value={formData.default_model} onChange={e => setFormData({ ...formData, default_model: e.target.value })} placeholder="ej. google/gemini-1.5-flash" />
          <Select label="Orden fallback" value={formData.fallback_order.toString()} onChange={e => setFormData({ ...formData, fallback_order: parseInt(e.target.value) })} options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} />
          <Select label="Estado" value={formData.is_active.toString()} onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })} options={[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Eliminar proveedor" message="¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer." />
    </div>
  );
}