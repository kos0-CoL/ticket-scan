'use client';
import { useState } from 'react';

export interface ModelInfo {
  id: string;
  name: string;
  free: boolean;
}

interface Props {
  /** name del proveedor ('' si aún no seleccionó) */
  providerName: string;
  /** API key tipeada en el formulario (opcional; si no, el server usa la guardada) */
  apiKey?: string;
  baseUrl?: string;
  /** modelo seleccionado actualmente */
  value: string;
  onChange: (id: string) => void;
}

/**
 * Selector de modelos con lista cargada desde el server + filtros
 * (texto y "solo FREE"). El valor elegido queda en el input controlado
 * del padre; este componente solo lo elige.
 */
export default function ModelPicker({ providerName, apiKey, baseUrl, value, onChange }: Props) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedFor, setLoadedFor] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [filter, setFilter] = useState('');

  async function load() {
    if (!providerName) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/providers/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: providerName,
          apiKey: apiKey || undefined,
          baseUrl: baseUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al cargar modelos');
      setModels(data.models);
      setLoadedFor(providerName);
    } catch (e: any) {
      setModels([]);
      setError(e.message || 'Error al cargar modelos');
    } finally {
      setLoading(false);
    }
  }

  const shown = models.filter(
    (m) =>
      (!freeOnly || m.free) &&
      (!filter ||
        m.id.toLowerCase().includes(filter.toLowerCase()) ||
        m.name.toLowerCase().includes(filter.toLowerCase()))
  );
  const anyFree = models.some((m) => m.free);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={load}
          disabled={!providerName || loading}
          className="btn-secondary text-sm py-2"
        >
          {loading ? 'Cargando…' : '🔄 Cargar modelos'}
        </button>
        {anyFree && (
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            Solo FREE
          </label>
        )}
        {models.length > 0 && (
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por nombre…"
            className="input !w-auto flex-1 min-w-[160px] text-sm"
          />
        )}
        {models.length > 0 && (
          <span className="text-xs text-slate-500">
            {shown.length}/{models.length} modelos
            {loadedFor && loadedFor !== providerName ? ' (proveedor cambió, recargá)' : ''}
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {models.length > 0 && (
        <select
          className="input"
          value={models.some((m) => m.id === value) ? value : ''}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value);
          }}
        >
          <option value="">
            Elegí un modelo… ({shown.length} disponibles)
          </option>
          {shown.map((m) => (
            <option key={m.id} value={m.id}>
              {m.free ? '🆓 ' : ''}
              {m.name} — {m.id}
            </option>
          ))}
        </select>
      )}
      {models.length > 0 && shown.length === 0 && (
        <p className="text-sm text-slate-500">Ningún modelo coincide con el filtro.</p>
      )}
      {!providerName && (
        <p className="text-xs text-slate-500">Seleccioná un proveedor para poder cargar sus modelos.</p>
      )}
    </div>
  );
}
