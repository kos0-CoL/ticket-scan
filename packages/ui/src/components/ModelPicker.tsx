'use client';
import { useState, useEffect } from 'react';
import styles from './ModelPicker.module.css';
import { Input } from './Input';
import { Button } from './Button';

export interface ModelInfo {
  id: string;
  name: string;
  free: boolean;
}

interface Props {
  /** Provider name (empty if not selected yet) */
  providerName: string;
  /** API key typed in form (optional; if not provided, server uses saved key) */
  apiKey?: string;
  /** Base URL override (optional) */
  baseUrl?: string;
  /** Currently selected model ID */
  value: string;
  /** Callback when model changes */
  onChange: (id: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

export function ModelPicker({
  providerName,
  apiKey,
  baseUrl,
  value,
  onChange,
  disabled = false,
  className = '',
}: Props) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedFor, setLoadedFor] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [filter, setFilter] = useState('');

  const load = async () => {
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
  };

  // Auto-load when provider changes
  useEffect(() => {
    if (providerName && providerName !== loadedFor) {
      load();
    }
  }, [providerName, loadedFor]);

  const shown = models.filter(
    (m) =>
      (!freeOnly || m.free) &&
      (!filter || m.id.toLowerCase().includes(filter.toLowerCase()) || m.name.toLowerCase().includes(filter.toLowerCase()))
  );
  const anyFree = models.some((m) => m.free);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.header}>
        <Button
          variant="secondary"
          size="sm"
          onClick={load}
          disabled={!providerName || loading}
          className={styles.loadButton}
        >
          {loading ? 'Cargando…' : '🔄 Cargar modelos'}
        </Button>

        {anyFree && (
          <label className={styles.filterCheckbox}>
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              disabled={disabled}
              className="accent-primary"
            />
            Solo FREE
          </label>
        )}

        {models.length > 0 && (
          <Input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por nombre…"
            className={styles.filterInput}
            aria-label="Filtrar modelos"
            disabled={disabled}
          />
        )}

        {models.length > 0 && (
          <span className={styles.count}>
            {shown.length}/{models.length} modelos
            {loadedFor && loadedFor !== providerName && ' (proveedor cambió, recargá)'}
          </span>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {models.length > 0 && (
        <select
          className={styles.select}
          value={models.some((m) => m.id === value) ? value : ''}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value);
          }}
          disabled={disabled}
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
        <p className={styles.emptyHint}>Ningún modelo coincide con el filtro.</p>
      )}

      {!providerName && (
        <p className={styles.providerHint}>Seleccioná un proveedor para poder cargar sus modelos.</p>
      )}
    </div>
  );
}

ModelPicker.displayName = 'ModelPicker';