'use client';

import { useEffect, useState } from 'react';

interface Provider {
  id: string;
  name: string;
  defaultModel: string;
  fallbackOrder: number;
  isActive: boolean;
}

interface MLConfig {
  id: string;
  provider_id: string;
  model_id: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  version: string;
  is_active: boolean;
  created_at: string;
}

export default function ModeloPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [config, setConfig] = useState<MLConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    provider_id: '',
    model_id: '',
    temperature: 0.1,
    max_tokens: 4096,
    system_prompt: '',
    version: '1.0.0',
    is_active: false,
  });

  async function load() {
    try {
      setLoading(true);
      const [providersRes, configRes] = await Promise.all([
        fetch('/api/admin/providers'),
        fetch('/api/admin/ml-config'),
      ]);
      const providersData = await providersRes.json();
      const configData = await configRes.json();
      setProviders(providersData);
      setConfig(configData?.[0] || null);
      if (configData?.[0]) {
        setFormData({
          provider_id: configData[0].provider_id || '',
          model_id: configData[0].model_id || '',
          temperature: configData[0].temperature || 0.1,
          max_tokens: configData[0].max_tokens || 4096,
          system_prompt: configData[0].system_prompt || '',
          version: configData[0].version || '1.0.0',
          is_active: configData[0].is_active || false,
        });
      }
    } catch (e) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/ml-config', {
        method: config ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: config?.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }

      setSuccess('Configuración guardada correctamente');
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    if (!formData.provider_id) {
      setError('Selecciona un proveedor primero');
      return;
    }
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: formData.provider_id }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(`✅ ${data.name} conectado correctamente`);
      } else {
        setError(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      setError('Error de conexión');
    }
  }

  if (loading) {
    return (
      <main className="page-container">
        <div className="page-content">
          <div className="animate-in text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando configuración...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="mb-8 animate-in">
          <h1 className="text-2xl font-bold text-slate-900">Configuración del Modelo IA</h1>
          <p className="text-slate-600 mt-1">Gestiona el proveedor, modelo, parámetros y prompt del sistema</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-2 space-y-6 animate-in">
            <form onSubmit={save} className="card-padded space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Proveedor y Modelo</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Proveedor IA</label>
                    <select
                      value={formData.provider_id}
                      onChange={e => setFormData({ ...formData, provider_id: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="">Seleccionar proveedor...</option>
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.defaultModel}) {p.isActive && '✓ Activo'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Modelo</label>
                    <input
                      type="text"
                      value={formData.model_id}
                      onChange={e => setFormData({ ...formData, model_id: e.target.value })}
                      className="input"
                      placeholder="ej: gemini-1.5-pro, gpt-4o, claude-3-sonnet"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={testConnection} className="btn-secondary" disabled={!formData.provider_id}>
                      Probar conexión
                    </button>
                    <span className="text-sm text-slate-500 self-center">Prueba la API key del proveedor seleccionado</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Parámetros de Generación</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Temperature <span className="text-sm font-normal text-slate-500">({formData.temperature})</span></label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-primary-light rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-xs text-slate-500 mt-1">0 = determinístico, 2 = muy creativo</p>
                  </div>
                  <div>
                    <label className="label">Max Tokens</label>
                    <input
                      type="number"
                      value={formData.max_tokens}
                      onChange={e => setFormData({ ...formData, max_tokens: parseInt(e.target.value) || 4096 })}
                      className="input"
                      min="100"
                      max="8192"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Prompt del Sistema</h2>
                <textarea
                  value={formData.system_prompt}
                  onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                  className="input font-mono text-sm min-h-[200px] resize-y"
                  placeholder="Eres un experto en extracción de datos de tickets de supermercado argentinos..."
                />
                <p className="text-xs text-slate-500 mt-1">Instrucciones para el modelo al procesar tickets</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Versionado</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Versión</label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={e => setFormData({ ...formData, version: e.target.value })}
                      className="input"
                      placeholder="1.0.0"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">Activar esta configuración</span>
                    </label>
                  </div>
                </div>
              </div>

              {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
              {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t border-primary-light/50">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : config ? 'Actualizar' : 'Crear configuración'}
                </button>
              </div>
            </form>
          </div>

          {/* Current Config Panel */}
          <div className="animate-in" style={{ animationDelay: "200ms" }}>
            <div className="card-padded">
              <h3 className="font-semibold text-slate-900 mb-4">Configuración Actual</h3>
              {config ? (
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Proveedor</dt>
                    <dd className="font-medium text-slate-900">
                      {providers.find(p => p.id === config.provider_id)?.name || config.provider_id}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Modelo</dt>
                    <dd className="font-medium text-slate-900 font-mono">{config.model_id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Temperature</dt>
                    <dd className="font-medium text-slate-900">{config.temperature}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Max Tokens</dt>
                    <dd className="font-medium text-slate-900">{config.max_tokens}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Versión</dt>
                    <dd className="font-medium text-slate-900">{config.version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Estado</dt>
                    <dd className={`font-medium ${config.is_active ? 'text-green-600' : 'text-slate-500'}`}>
                      {config.is_active ? '● Activo' : '○ Inactivo'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Creado</dt>
                    <dd className="font-medium text-slate-900">{new Date(config.created_at).toLocaleString('es-AR')}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-slate-500 text-center py-8">No hay configuración activa</p>
              )}
            </div>

            {/* Providers Quick View */}
            <div className="mt-6 card-padded">
              <h3 className="font-semibold text-slate-900 mb-4">Proveedores Configurados</h3>
              {providers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No hay proveedores. Ve a <a href="/providers" className="text-primary underline">Proveedores IA</a> para agregar.</p>
              ) : (
                <div className="space-y-2">
                  {providers.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.defaultModel}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}