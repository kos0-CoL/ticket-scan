'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Select, Modal, Badge, ModelPicker } from '@ticketscan/ui';

interface Provider {
  id: string;
  name: string;
  defaultModel: string;
  fallbackOrder: number;
  isActive: boolean;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/admin/providers');
    const data = await res.json();
    setProviders(data);
  }

  useEffect(() => { load(); }, []);

  async function testConnection(id: string) {
    setTesting(id);
    const res = await fetch('/api/admin/providers/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    alert(data.ok ? `✅ ${data.name} conectado` : `❌ Error: ${data.error}`);
    setTesting(null);
  }

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'defaultModel', header: 'Modelo' },
    { key: 'fallbackOrder', header: 'Fallback' },
    {
      key: 'isActive',
      header: 'Activo',
      render: (row: Provider) => (
        <Badge variant={row.isActive ? 'success' : 'muted'} dot>
          {row.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acción',
      render: (row: Provider) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => testConnection(row.id)}
          disabled={testing === row.id}
        >
          {testing === row.id ? '...' : 'Test'}
        </Button>
      ),
    },
  ];

  return (
    <main className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Proveedores IA</h1>
          <Button onClick={() => setShowForm(true)}>Agregar proveedor</Button>
        </div>

        <Table
          columns={columns}
          data={providers}
          keyExtractor={(row) => row.id}
          hover
          divide
          emptyMessage="No hay proveedores configurados"
        />

        <ProviderForm
          open={showForm}
          onClose={() => { setShowForm(false); load(); }}
          onSaved={load}
        />
      </div>
    </main>
  );
}

interface ProviderFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function ProviderForm({ open, onClose, onSaved }: ProviderFormProps) {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [defaultModel, setDefaultModel] = useState('');
  const [fallbackOrder, setFallbackOrder] = useState(0);
  const [error, setError] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, apiKey, baseUrl, defaultModel, fallbackOrder }),
    });
    if (!res.ok) { setError('Error al guardar'); return; }
    onClose();
    onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo proveedor"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="provider-form">Guardar</Button>
        </>
      }
    >
      <form id="provider-form" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-danger-light)', color: '#B91C1C', fontSize: '0.875rem' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Nombre</label>
            <Select
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              options={[
                { value: 'gemini', label: 'Gemini' },
                { value: 'openai', label: 'OpenAI' },
                { value: 'anthropic', label: 'Anthropic' },
                { value: 'openrouter', label: 'OpenRouter' },
              ]}
              placeholder="Seleccionar..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }}
              placeholder="API Key"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Base URL (opcional)</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }}
              placeholder="Base URL (opcional)"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Modelo default</label>
            <ModelPicker
              providerName={name}
              apiKey={apiKey}
              baseUrl={baseUrl}
              value={defaultModel}
              onChange={setDefaultModel}
            />
            <input
              type="text"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-900)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}
              placeholder="ID del modelo (elegilo arriba o escribilo)"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Orden fallback</label>
            <input
              type="number"
              value={fallbackOrder}
              onChange={(e) => setFallbackOrder(+e.target.value)}
              style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--color-200)', backgroundColor: 'var(--color-white)', padding: '0.75rem 1rem', fontSize: '0.9375rem', color: 'var(--color-900)', fontFamily: 'var(--font-sans)' }}
              placeholder="Orden fallback"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}