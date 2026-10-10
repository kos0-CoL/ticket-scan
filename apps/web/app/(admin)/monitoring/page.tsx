'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, Table, Select, Badge, StatusBadge } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface MonitoringData {
  month: string;
  total_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  total_cost_usd: number;
  by_provider: Record<string, { requests: number; cost: number }>;
}

const mockData: MonitoringData[] = [
  { month: '2025-01', total_requests: 12450, success_rate: 98.5, avg_latency_ms: 1240, total_cost_usd: 45.23, by_provider: { openrouter: { requests: 8900, cost: 28.45 }, openai: { requests: 3550, cost: 16.78 } } },
  { month: '2024-12', total_requests: 11200, success_rate: 97.8, avg_latency_ms: 1380, total_cost_usd: 41.12, by_provider: { openrouter: { requests: 7800, cost: 24.12 }, openai: { requests: 3400, cost: 17.00 } } },
  { month: '2024-11', total_requests: 9800, success_rate: 98.2, avg_latency_ms: 1420, total_cost_usd: 36.89, by_provider: { openrouter: { requests: 6500, cost: 20.11 }, openai: { requests: 3300, cost: 16.78 } } },
];

export default function MonitoringPage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const monthData = mockData.find(d => d.month === selectedMonth) || mockData[0];

  const columns: Column<MonitoringData>[] = [
    { key: 'month', header: 'Mes', render: (d) => <span className="font-medium">{d.month}</span> },
    { key: 'total_requests', header: 'Peticiones', render: (d) => <span>{d.total_requests.toLocaleString()}</span> },
    { key: 'success_rate', header: 'Éxito', render: (d) => <span className="font-mono">{d.success_rate}%</span> },
    { key: 'avg_latency_ms', header: 'Latencia (ms)', render: (d) => <span className="font-mono">{d.avg_latency_ms}</span> },
    { key: 'total_cost_usd', header: 'Costo (USD)', render: (d) => <span className="font-mono">${d.total_cost_usd.toFixed(2)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monitorización IA</h1>
          <p className="text-slate-500">Rendimiento y costos de los proveedores de IA</p>
        </div>
        <Select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          options={mockData.map(d => ({ value: d.month, label: d.month }))}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card elevated padded>
          <CardHeader title="Peticiones totales" subtitle={monthData.total_requests.toLocaleString()} />
        </Card>
        <Card elevated padded>
          <CardHeader title="Tasa de éxito" subtitle={`${monthData.success_rate}%`} />
        </Card>
        <Card elevated padded>
          <CardHeader title="Latencia media" subtitle={`${monthData.avg_latency_ms} ms`} />
        </Card>
        <Card elevated padded>
          <CardHeader title="Costo total" subtitle={`$${monthData.total_cost_usd.toFixed(2)}`} />
        </Card>
      </div>

      <Card elevated>
        <CardHeader title="Detalle por mes" />
        <CardContent>
          <Table columns={columns} data={mockData} keyExtractor={d => d.month} hover divide />
        </CardContent>
      </Card>

      <Card elevated>
        <CardHeader title={`Desglose por proveedor - ${selectedMonth}`} />
        <CardContent>
          <div className="space-y-3">
            {Object.entries(monthData.by_provider).map(([provider, stats]) => (
              <div key={provider} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{provider === 'openrouter' ? '🔄' : '🤖'}</span>
                  <span className="font-medium capitalize">{provider}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <span>Peticiones: <span className="font-mono text-slate-900">{stats.requests.toLocaleString()}</span></span>
                  <span>Costo: <span className="font-mono text-slate-900">$${stats.cost.toFixed(2)}</span></span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}