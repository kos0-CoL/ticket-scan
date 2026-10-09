'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Textarea, Select, Card, CardHeader, CardContent, Badge, ModelPicker } from '@ticketscan/ui';

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

  if (loading) return (
    <main className="page-container">
      <div className="page-content">
        <div className="animate-in text-center py-12">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Cargando configuración...</p>
        </div>
      </div>
    </main>
  );

  return (
    <main className="page-container">
      <div className="page-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Configuración del Modelo IA</h1>
          <p style={{ color: 'var(--color-500)', marginTop: '0.25rem' }}>Gestiona el proveedor, modelo, parámetros y prompt del sistema</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Form Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', margin: '0 0 1rem' }}>Proveedor y Modelo</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Proveedor IA</label>
                    <Select
                      value={formData.provider_id}
                      onChange={e => setFormData({ ...formData, provider_id: e.target.value })}
                      required
                      options={providers.map(p => ({ value: p.id, label: `${p.name} (${p.defaultModel})${p.isActive ? ' ✓ Activo' : ''}` }))}
                      placeholder="Seleccionar proveedor..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Modelo</label>
                    <ModelPicker
                      providerName={providers.find(p => p.id === formData.provider_id)?.name ?? ''}
                      value={formData.model_id}
                      onChange={id => setFormData({ ...formData, model_id: id })}
                    />
                    <Input
                      type="text"
                      value={formData.model_id}
                      onChange={e => setFormData({ ...formData, model_id: e.target.value })}
                      placeholder="ej: gemini-1.5-pro, gpt-4o, google/gemma-2-9b-it:free"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Button variant="secondary" onClick={testConnection} disabled={!formData.provider_id}>
                      Probar conexión
                    </Button>
                    <span style={{ color: 'var(--color-500)', fontSize: '0.875rem' }}>Prueba la API key del proveedor seleccionado</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', margin: '0 0 1rem' }}>Parámetros de Generación</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Temperature <span style={{ color: 'var(--color-500)', fontSize: '0.8125rem' }}>({formData.temperature})</span></label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', marginTop: '0.25rem' }}>0 = determinístico, 2 = muy creativo</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Max Tokens</label>
                    <Input
                      type="number"
                      value={formData.max_tokens}
                      onChange={e => setFormData({ ...formData, max_tokens: parseInt(e.target.value) || 4096 })}
                      min={100}
                      max={8192}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', margin: '0 0 1rem' }}>Prompt del Sistema</h2>
                <Textarea
                  value={formData.system_prompt}
                  onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                  placeholder="Eres un experto en extracción de datos de tickets de supermercado argentinos..."
                  style={{ minHeight: '200px' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', marginTop: '0.25rem' }}>Instrucciones para el modelo al procesar tickets</p>
              </div>

              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', margin: '0 0 1rem' }}>Versionado</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Versión</label>
                    <Input
                      type="text"
                      value={formData.version}
                      onChange={e => setFormData({ ...formData, version: e.target.value })}
                      placeholder="1.0.0"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', width: '100%' }}>
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        style={{ width: '1rem', height: '1rem', borderRadius: '0.375rem', border: '1px solid var(--color-300)', accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>Activar esta configuración</span>
                    </label>
                  </div>
                </div>
              </div>

              {error && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-danger-light)', color: '#B91C1C', fontSize: '0.875rem' }}>{error}</div>}
              {success && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-success-light)', color: '#047857', fontSize: '0.875rem' }}>{success}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0, 171, 228, 0.08)' }}>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Guardando...' : config ? 'Actualizar' : 'Crear configuración'}
                </Button>
              </div>
            </form>
          </div>

          {/* Current Config Panel */}
          <div>
            <Card padded>
              <CardHeader title="Configuración Actual" />
              <CardContent>
                {config ? (
                  <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--color-500)' }}>Proveedor</dt>
                      <dd style={{ fontWeight: '500' }}>
                        {providers.find(p => p.id === config.provider_id)?.name || config.provider_id}
                      </dd>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--color-500)' }}>Modelo</dt>
                      <dd style={{ fontWeight: '500', fontFamily: 'var(--font-mono)' }}>{config.model_id}</dd>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--color-500)' }}>Temperature</dt>
                      <dd style={{ fontWeight: '500' }}>{config.temperature}</dd>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--color-500)' }}>Max Tokens</dt>
                      <dd style={{ fontWeight: '500' }}>{config.max_tokens}</dd>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--color-500)' }}>Versión</dt>
                      <dd style={{ fontWeight: '500' }}>{config.version}</dd>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--color-500)' }}>Estado</dt>
                      <dd style={{ fontWeight: '500', color: config.is_active ? 'var(--color-success)' : 'var(--color-500)' }}>
                        {config.is_active ? '● Activo' : '○ Inactivo'}
                      </dd>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <dt style={{ fontSize: '0.8125rem', color: 'var(--color-500)' }}>Creado</dt>
                      <dd style={{ fontWeight: '500' }}>{new Date(config.created_at).toLocaleString('es-AR')}</dd>
                    </div>
                  </dl>
                ) : (
                  <p style={{ color: 'var(--color-500)', textAlign: 'center', padding: '2rem' }}>No hay configuración activa</p>
                )}
              </CardContent>
            </Card>

            {/* Providers Quick View */}
            <Card padded style={{ marginTop: '1.5rem' }}>
              <CardHeader title="Proveedores Configurados" />
              <CardContent>
                {providers.length === 0 ? (
                  <p style={{ color: 'var(--color-500)', textAlign: 'center', padding: '1rem' }}>No hay proveedores. Ve a <a href="/providers" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Proveedores IA</a> para agregar.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {providers.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid rgba(0, 171, 228, 0.08)', borderRadius: '0.75rem' }}>
                        <div>
                          <p style={{ fontWeight: '500' }}>{p.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-500)' }}>{p.defaultModel}</p>
                        </div>
                        <Badge variant={p.isActive ? 'success' : 'muted'} dot>
                          {p.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}