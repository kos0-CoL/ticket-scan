'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Table, Select } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface MetricRow {
  day: string;
  metric_type: string;
  provider: string;
  model_id: string | null;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
}

export default function MLMetricsPage() {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cost' | 'latency' | 'ocr_accuracy' | 'categorization_accuracy'>('all');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('period', period);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const response = await fetch(`/api/admin/ml-metrics?${params}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.ok) {
        setMetrics(data.data || []);
      } else {
        setError(data.error || 'Error al cargar métricas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [period, typeFilter]);

  const columns: Column<MetricRow>[] = [
    { key: 'day', header: 'Día', render: (m) => <span>{m.day}</span> },
    { key: 'metric_type', header: 'Métrica', render: (m) => <Badge variant={getBadgeVariant(m.metric_type)}>{m.metric_type}</Badge> },
    { key: 'provider', header: 'Proveedor', render: (m) => <span className="font-mono text-xs">{m.provider}</span> },
    { key: 'model_id', header: 'Modelo', render: (m) => <span className="text-slate-500 text-xs">{m.model_id || '-'}</span> },
    { key: 'count', header: 'Requests', render: (m) => <span className="font-mono">{m.count}</span> },
    { key: 'avg', header: 'Promedio', render: (m) => <span className="font-mono font-semibold">{formatValue(m.metric_type, m.avg)}</span> },
    { key: 'sum', header: 'Total', render: (m) => <span className="text-slate-500 font-mono">{formatValue(m.metric_type, m.sum)}</span> },
    { key: 'min', header: 'Mín', render: (m) => <span className="text-slate-400 font-mono text-xs">{formatValue(m.metric_type, m.min)}</span> },
    { key: 'max', header: 'Máx', render: (m) => <span className="text-slate-400 font-mono text-xs">{formatValue(m.metric_type, m.max)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Métricas IA</h1>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
          options={[
            { value: '7d', label: 'Últimos 7 días' },
            { value: '30d', label: 'Últimos 30 días' },
            { value: '90d', label: 'Últimos 90 días' },
          ]}
          placeholder="Período"
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'cost', label: 'Costo (USD)' },
            { value: 'latency', label: 'Latencia (ms)' },
            { value: 'ocr_accuracy', label: 'Accuracy OCR' },
            { value: 'categorization_accuracy', label: 'Accuracy Categorización' },
          ]}
          placeholder="Tipo de métrica"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <Card elevated>
        <CardContent>
          <Table
            columns={columns}
            data={metrics}
            keyExtractor={(m) => `${m.day}_${m.metric_type}_${m.provider}`}
            hover
            divide
            emptyMessage="No hay métricas para el período seleccionado"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function getBadgeVariant(type: string) {
  switch (type) {
    case 'cost': return 'danger';
    case 'latency': return 'warning';
    case 'ocr_accuracy':
    case 'categorization_accuracy': return 'success';
    default: return 'muted';
  }
}

function formatValue(type: string, value: number) {
  if (type === 'cost') return `$${value.toFixed(4)}`;
  if (type === 'latency') return `${Math.round(value)}ms`;
  if (type.includes('accuracy')) return `${(value * 100).toFixed(1)}%`;
  return value.toFixed(2);
}