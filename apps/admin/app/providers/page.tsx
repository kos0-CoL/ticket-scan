'use client';
import { useEffect, useState } from 'react';
import ModelPicker from '../../components/ModelPicker';

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

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="section-header">
          <h1 className="section-title">Proveedores IA</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Agregar proveedor
        </button>
        <div className="table-scroll mt-6">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Modelo</th>
                <th>Fallback</th>
                <th>Activo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.id} className="border-t divide-y">
                  <td>{p.name}</td>
                  <td>{p.defaultModel}</td>
                  <td>{p.fallbackOrder}</td>
                  <td>{p.isActive ? '✅' : '❌'}</td>
                  <td>
                    <button onClick={() => testConnection(p.id)} disabled={testing === p.id}
                      className="btn btn-ghost text-sm">
                      {testing === p.id ? '...' : 'Test'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showForm && <ProviderForm onClose={() => { setShowForm(false); load(); }} />}
      </div>
    </main>
  );
}

function ProviderForm({ onClose }: { onClose: () => void }) {
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
  }

  return (
    <form onSubmit={save} className="card-padded mt-6 space-y-4 animate-in">
      <h2 className="panel-title">Nuevo proveedor</h2>
      {error && <p className="text-danger text-sm">{error}</p>}
      <select
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="input"
      >
        <option value="">Seleccionar...</option>
        <option value="gemini">Gemini</option>
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="openrouter">OpenRouter</option>
      </select>
      <input
        className="input"
        placeholder="API Key"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Base URL (opcional)"
        value={baseUrl}
        onChange={e => setBaseUrl(e.target.value)}
      />
      <div>
        <label className="form-label">Modelo default</label>
        <ModelPicker
          providerName={name}
          apiKey={apiKey}
          baseUrl={baseUrl}
          value={defaultModel}
          onChange={setDefaultModel}
        />
        <input
          className="input mt-2 font-mono text-sm"
          placeholder="ID del modelo (elegilo arriba o escribilo)"
          value={defaultModel}
          onChange={e => setDefaultModel(e.target.value)}
          required
        />
      </div>
      <input
        className="input"
        type="number"
        placeholder="Orden fallback"
        value={fallbackOrder}
        onChange={e => setFallbackOrder(+e.target.value)}
      />
      <div className="flex gap-2">
        <button className="btn btn-primary" type="submit">Guardar</button>
        <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}
