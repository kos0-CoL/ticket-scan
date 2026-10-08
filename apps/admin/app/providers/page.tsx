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
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Proveedores IA</h1>
      <button onClick={() => setShowForm(true)} className="rounded bg-blue-600 px-4 py-2 text-white">
        Agregar proveedor
      </button>
      <table className="mt-6 w-full border">
        <thead><tr className="bg-gray-100">
          <th className="p-2 text-left">Nombre</th><th className="p-2 text-left">Modelo</th>
          <th className="p-2 text-left">Fallback</th><th className="p-2 text-left">Activo</th>
          <th className="p-2 text-left">Acción</th>
        </tr></thead>
        <tbody>
          {providers.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.name}</td><td className="p-2">{p.defaultModel}</td>
              <td className="p-2">{p.fallbackOrder}</td>
              <td className="p-2">{p.isActive ? '✅' : '❌'}</td>
              <td className="p-2">
                <button onClick={() => testConnection(p.id)} disabled={testing === p.id}
                  className="rounded border px-2 py-1 text-xs">
                  {testing === p.id ? '...' : 'Test'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <ProviderForm onClose={() => { setShowForm(false); load(); }} />}
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
    <form onSubmit={save} className="mt-6 space-y-3 rounded-lg border bg-white p-6 shadow">
      <h2 className="font-bold">Nuevo proveedor</h2>
      {error && <p className="text-red-600">{error}</p>}
      <select value={name} onChange={e => setName(e.target.value)} required>
        <option value="">Seleccionar...</option>
        <option value="gemini">Gemini</option>
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="openrouter">OpenRouter</option>
      </select>
      <input className="w-full rounded border px-3 py-2" placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} required />
      <input className="w-full rounded border px-3 py-2" placeholder="Base URL (opcional)" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
      <div>
        <label className="block text-sm font-medium mb-1">Modelo default</label>
        <ModelPicker
          providerName={name}
          apiKey={apiKey}
          baseUrl={baseUrl}
          value={defaultModel}
          onChange={setDefaultModel}
        />
        <input
          className="w-full rounded border px-3 py-2 mt-2 font-mono text-sm"
          placeholder="ID del modelo (elegilo arriba o escribilo)"
          value={defaultModel}
          onChange={e => setDefaultModel(e.target.value)}
          required
        />
      </div>
      <input className="w-full rounded border px-3 py-2" type="number" placeholder="Orden fallback" value={fallbackOrder} onChange={e => setFallbackOrder(+e.target.value)} />
      <div className="flex gap-2">
        <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">Guardar</button>
        <button type="button" onClick={onClose} className="rounded border px-4 py-2">Cancelar</button>
      </div>
    </form>
  );
}
