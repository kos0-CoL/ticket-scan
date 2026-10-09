'use client';

import { useEffect, useState } from 'react';
import { Table, Select, Badge, Card, CardHeader, CardContent } from '@ticketscan/ui';

interface Metrics {
  window: { month: string | null; since: string; until: string | null; source: string | null };
  ticketsPerDay: { date: string; total: number | string }[];
  totalTickets: number | string;
  ticketsWithItems: number | string;
  successRate: number;
  normalizationByMethod: { metodo: string; total: number | string }[];
  bySource: { recognized: number; unrecognized: number };
  months: { month: string; total: number }[];
  topComercios: { comercio: string; total: number; recognized: boolean }[];
}

const MES_LABELS: Record<string, string> = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
};

function monthLabel(m: string) {
  const [y, mm] = m.split('-');
  return `${MES_LABELS[mm] ?? mm} ${y}`;
}

function buildQuery(month: string, source: string) {
  const p = new URLSearchParams();
  if (month === '30d') p.set('days', '30');
  else if (month === '90d') p.set('days', '90');
  else if (month === 'all') p.set('days', '3650');
  else if (month) p.set('month', month);
  if (source) p.set('source', source);
  return p.toString();
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState('30d');
  const [source, setSource] = useState('');

  async function load(m: string, s: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/metrics?' + buildQuery(m, s));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar métricas');
      setMetrics(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(month, source); }, []);

  const n = (v: number | string | undefined) => Number(v ?? 0);

  const ticketsColumns = [
    { key: 'date', header: 'Fecha' },
    { key: 'total', header: 'Tickets', className: 'text-right', render: (d: { total: number | string }) => <span className="font-medium">{n(d.total)}</span> },
  ];

  const topComerciosColumns = [
    { key: 'comercio', header: 'Comercio' },
    {
      key: 'recognized',
      header: 'Fuente',
      render: (c: { recognized: boolean }) => <Badge variant={c.recognized ? 'success' : 'accent'}>{c.recognized ? 'Reconocido' : 'No reconocido'}</Badge>,
    },
    { key: 'total', header: 'Tickets', className: 'text-right', render: (c: { total: number | string }) => <span className="font-medium">{n(c.total)}</span> },
  ];

  const monthOptions = [
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: 'all', label: 'Todo' },
    ...(metrics?.months ?? []).map(m => ({ value: m.month, label: `${monthLabel(m.month)} (${m.total} tickets)` })),
  ];

  const sourceOptions = [
    { value: '', label: 'Todos los comercios' },
    { value: 'recognized', label: 'Solo supermercados reconocidos' },
    { value: 'unrecognized', label: 'Solo comercios no reconocidos' },
  ];

  return (
    <main className="page-container">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Monitorización</h1>
            <p style={{ color: 'var(--color-500)', marginTop: '0.25rem' }}>Actividad de tickets y normalización</p>
          </div>
        </div>

        <Card padded style={{ marginBottom: '1.5rem' }}>
          <CardHeader title="Filtros" />
          <CardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
              <div style={{ minWidth: '180px' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Período</label>
                <Select
                  value={month}
                  onChange={e => { setMonth(e.target.value); load(e.target.value, source); }}
                  options={monthOptions}
                />
              </div>
              <div style={{ minWidth: '180px' }}>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-700)' }}>Fuente</label>
                <Select
                  value={source}
                  onChange={e => { setSource(e.target.value); load(month, e.target.value); }}
                  options={sourceOptions}
                />
              </div>
              {loading && <span style={{ color: 'var(--color-400)', fontSize: '0.875rem' }}>Cargando…</span>}
            </div>
          </CardContent>
        </Card>

        {error && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-danger-light)', color: '#B91C1C', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <Card padded>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: '0 0 0.5rem' }}>Tickets totales</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-900)', margin: 0, lineHeight: 1.1 }}>{n(metrics?.totalTickets)}</p>
          </Card>
          <Card padded>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: '0 0 0.5rem' }}>Tasa de éxito IA</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', margin: 0, lineHeight: 1.1 }}>{((metrics?.successRate ?? 0) * 100).toFixed(1)}%</p>
          </Card>
          <Card padded>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: '0 0 0.5rem' }}>Reconocidos</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-success)', margin: 0, lineHeight: 1.1 }}>
              {n(metrics?.bySource?.recognized)}
              <span style={{ fontSize: '0.875rem', fontWeight: '400', color: 'var(--color-400)', marginLeft: '0.5rem' }}>
                de {n(metrics?.totalTickets) || n(metrics?.bySource?.recognized) + n(metrics?.bySource?.unrecognized)}
              </span>
            </p>
          </Card>
          <Card padded>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-500)', margin: '0 0 0.5rem' }}>No reconocidos</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-accent)', margin: 0, lineHeight: 1.1 }}>{n(metrics?.bySource?.unrecognized)}</p>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <Card padded style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', margin: '0 0 1rem' }}>Tickets por día</h3>
            {(metrics?.ticketsPerDay.length ?? 0) === 0 && !loading ? (
              <p style={{ color: 'var(--color-400)', padding: '1.5rem 0', textAlign: 'center' }}>No hay tickets con los filtros seleccionados.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={ticketsColumns}
                  data={metrics?.ticketsPerDay ?? []}
                  keyExtractor={d => d.date}
                  hover
                  divide
                  emptyMessage="No hay datos"
                />
              </div>
            )}
          </Card>

          <Card padded>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', margin: '0 0 1rem' }}>Normalización por método</h3>
            {(metrics?.normalizationByMethod.length ?? 0) === 0 && !loading ? (
              <p style={{ color: 'var(--color-400)', padding: '1.5rem 0', textAlign: 'center' }}>Sin datos de normalización.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(metrics?.normalizationByMethod ?? []).map(m => (
                  <li key={m.metodo} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-100)' }}>
                    <span style={{ color: 'var(--color-700)' }}>{m.metodo}</span>
                    <Badge variant="primary">{n(m.total)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card padded>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-900)', margin: '0 0 1rem' }}>Top comercios</h3>
          {(metrics?.topComercios.length ?? 0) === 0 && !loading ? (
            <p style={{ color: 'var(--color-400)', padding: '1.5rem 0', textAlign: 'center' }}>No hay comercios con estos filtros.</p>
          ) : (
            <Table
              columns={topComerciosColumns}
              data={metrics?.topComercios ?? []}
              keyExtractor={c => c.comercio}
              hover
              divide
              emptyMessage="No hay comercios con estos filtros"
            />
          )}
        </Card>
      </div>
    </main>
  );
}