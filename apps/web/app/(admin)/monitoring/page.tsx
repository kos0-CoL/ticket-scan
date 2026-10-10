'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Table, Select, Badge } from '@ticketscan/ui';
import type { Column } from '@ticketscan/ui';

interface MonitoringData {
  month: string;
  total_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  total_cost_usd: number;
  by_provider: Record<string, { requests: number; cost: number }>;
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/monitoring');
      const result = await res.json();
      if (result.ok) {
        setData(result.data);
        if (result.data.length > 0 && !selectedMonth) {
          setSelectedMonth(result.data[0].month);
        }
      }
    } catch (err) {
      console.error('Error fetching monitoring:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: Column<MonitoringData>[] = [
    { key: 'month', header: 'Mes', render: (d) => <span className="font-medium">{d.month}</span> },
    { key: 'total_requests', header: 'Peticiones', render: (d) => <span>{d.total_requests.toLocaleString()}</span> },
    { key: 'success_rate', header: 'Éxito', render: (d) => <span className="font-mono">{d.success_rate}%</span> },
    { key: 'avg_latency_ms', header: 'Latencia (ms)', render: (d) => <span className="font-mono">{d.avg_latency_ms}</span> },
    { key: 'total_cost_usd', header: 'Costo (USD)', render: (d) => <span className="font-mono">${d.total_cost_usd.toFixed(2)}</span> },
  ];

  const monthData = data.find(d => d.month === selectedMonth) || data[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monitorización IA</h1>
          <p className="text-slate-500">Rendimiento y costos de los proveedores de IA</p>
        </div>
        {data.length > 0 && (
          <Select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            options={data.map(d => ({ value: d.month, label: d.month }))}
            className="w-48"
          />
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {monthData && (
              <>
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
              </>
            )}
          </div>

          <Card elevated>
            <CardHeader title="Detalle por mes" />
            <CardContent>
              <Table columns={columns} data={data} keyExtractor={d => d.month} hover divide emptyMessage="Sin datos de monitorización" loading={loading} />
            </CardContent>
          </Card>

          {monthData && (
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
          )}
        </>
      )}
    </div>
  );
}