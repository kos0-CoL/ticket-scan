'use client';
import { useEffect, useState } from 'react';

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

  return (
    <main className="page-container">
      <div className="page-content">
        <div className="section-header animate-in">
          <h1 className="section-title">Monitorización</h1>
          <p className="text-muted mt-1">Actividad de tickets y normalización</p>
        </div>

        {/* Filtros */}
        <div className="filters-card card-padded mb-6 animate-in">
          <div className="filters-grid">
            <div>
              <label className="label" htmlFor="f-month">Período</label>
              <select
                id="f-month"
                className="input input-inline"
                value={month}
                onChange={e => { setMonth(e.target.value); load(e.target.value, source); }}
              >
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="all">Todo</option>
                {(metrics?.months ?? []).map(m => (
                  <option key={m.month} value={m.month}>
                    {monthLabel(m.month)} ({m.total} tickets)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="f-source">Fuente</label>
              <select
                id="f-source"
                className="input input-inline"
                value={source}
                onChange={e => { setSource(e.target.value); load(month, e.target.value); }}
              >
                <option value="">Todos los comercios</option>
                <option value="recognized">Solo supermercados reconocidos</option>
                <option value="unrecognized">Solo comercios no reconocidos</option>
              </select>
            </div>
            {loading && <span className="loading-text">Cargando…</span>}
          </div>
        </div>

        {error && <div className="error-box mb-6">{error}</div>}

        {/* KPIs */}
        <div className="kpis-grid">
          <div className="card-padded">
            <h3 className="kpi-label">Tickets totales</h3>
            <p className="kpi-value">{n(metrics?.totalTickets)}</p>
          </div>
          <div className="card-padded">
            <h3 className="kpi-label">Tasa de éxito IA</h3>
            <p className="kpi-value kpi-primary">{((metrics?.successRate ?? 0) * 100).toFixed(1)}%</p>
          </div>
          <div className="card-padded">
            <h3 className="kpi-label">Reconocidos</h3>
            <p className="kpi-value kpi-success">
              {metrics?.bySource.recognized ?? 0}
              <span className="kpi-sub">
                de {n(metrics?.totalTickets) || (metrics ? metrics.bySource.recognized + metrics.bySource.unrecognized : 0)}
              </span>
            </p>
          </div>
          <div className="card-padded">
            <h3 className="kpi-label">No reconocidos</h3>
            <p className="kpi-value kpi-accent">{metrics?.bySource.unrecognized ?? 0}</p>
          </div>
        </div>

        <div className="main-grid">
          {/* Tickets por día */}
          <div className="card-padded main-col-span-2">
            <h3 className="section-title mb-4">Tickets por día</h3>
            {(metrics?.ticketsPerDay.length ?? 0) === 0 && !loading ? (
              <p className="empty-text">No hay tickets con los filtros seleccionados.</p>
            ) : (
              <div className="table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th className="text-right">Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metrics?.ticketsPerDay ?? []).map(d => (
                      <tr key={d.date} className="divide-y">
                        <td>{d.date}</td>
                        <td className="text-right font-medium">{n(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Normalización por método */}
          <div className="card-padded">
            <h3 className="section-title mb-4">Normalización por método</h3>
            {(metrics?.normalizationByMethod.length ?? 0) === 0 && !loading ? (
              <p className="empty-text">Sin datos de normalización.</p>
            ) : (
              <ul className="method-list">
                {(metrics?.normalizationByMethod ?? []).map(m => (
                  <li key={m.metodo} className="method-item">
                    <span className="method-name">{m.metodo}</span>
                    <span className="badge badge-primary-light">{n(m.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top comercios */}
        <div className="card-padded">
          <h3 className="section-title mb-4">Top comercios</h3>
          {(metrics?.topComercios.length ?? 0) === 0 && !loading ? (
            <p className="empty-text">No hay comercios con estos filtros.</p>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Comercio</th>
                    <th>Fuente</th>
                    <th className="text-right">Tickets</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics?.topComercios ?? []).map(c => (
                    <tr key={c.comercio} className="divide-y">
                      <td className="font-medium">{c.comercio}</td>
                      <td>
                        <span className={`badge ${c.recognized ? 'badge-success' : 'badge-accent'}`}>
                          {c.recognized ? 'Reconocido' : 'No reconocido'}
                        </span>
                      </td>
                      <td className="text-right font-medium">{n(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
