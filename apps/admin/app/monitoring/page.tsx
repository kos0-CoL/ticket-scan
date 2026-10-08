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
        <div className="mb-6 animate-in">
          <h1 className="text-2xl font-bold text-slate-900">Monitorización</h1>
          <p className="text-slate-500 mt-1">Actividad de tickets y normalización</p>
        </div>

        {/* ===== Filtros ===== */}
        <div className="card-padded mb-6 flex flex-wrap items-end gap-4 animate-in">
          <div>
            <label className="label" htmlFor="f-month">Período</label>
            <select
              id="f-month"
              className="input !w-auto"
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
              className="input !w-auto"
              value={source}
              onChange={e => { setSource(e.target.value); load(month, e.target.value); }}
            >
              <option value="">Todos los comercios</option>
              <option value="recognized">Solo supermercados reconocidos</option>
              <option value="unrecognized">Solo comercios no reconocidos</option>
            </select>
          </div>
          {loading && <span className="text-sm text-slate-400 pb-2">Cargando…</span>}
        </div>

        {error && <div className="mb-6 p-3 rounded-xl bg-danger-light text-danger-dark text-sm">{error}</div>}

        {/* ===== KPIs ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="card-padded">
            <h3 className="text-sm text-slate-500 mb-2">Tickets totales</h3>
            <p className="text-3xl font-bold text-slate-900">{n(metrics?.totalTickets)}</p>
          </div>
          <div className="card-padded">
            <h3 className="text-sm text-slate-500 mb-2">Tasa de éxito IA</h3>
            <p className="text-3xl font-bold text-primary">{(((metrics?.successRate ?? 0) * 100)).toFixed(1)}%</p>
          </div>
          <div className="card-padded">
            <h3 className="text-sm text-slate-500 mb-2">Reconocidos</h3>
            <p className="text-3xl font-bold text-success">
              {metrics?.bySource.recognized ?? 0}
              <span className="text-sm font-normal text-slate-400 ml-2">
                de {n(metrics?.totalTickets) || (metrics ? metrics.bySource.recognized + metrics.bySource.unrecognized : 0)}
              </span>
            </p>
          </div>
          <div className="card-padded">
            <h3 className="text-sm text-slate-500 mb-2">No reconocidos</h3>
            <p className="text-3xl font-bold text-accent-600">{metrics?.bySource.unrecognized ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* ===== Tickets por día ===== */}
          <div className="card-padded lg:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-4">Tickets por día</h3>
            {(metrics?.ticketsPerDay.length ?? 0) === 0 && !loading ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No hay tickets con los filtros seleccionados.
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-primary-light/50 text-left text-slate-500">
                      <th className="p-2">Fecha</th>
                      <th className="p-2 text-right">Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metrics?.ticketsPerDay ?? []).map(d => (
                      <tr key={d.date} className="border-b border-slate-50 last:border-0">
                        <td className="p-2 text-slate-700">{d.date}</td>
                        <td className="p-2 text-right font-medium">{n(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ===== Normalización por método ===== */}
          <div className="card-padded">
            <h3 className="font-semibold text-slate-900 mb-4">Normalización por método</h3>
            {(metrics?.normalizationByMethod.length ?? 0) === 0 && !loading ? (
              <p className="text-sm text-slate-400 py-6 text-center">Sin datos de normalización.</p>
            ) : (
              <ul className="space-y-3">
                {(metrics?.normalizationByMethod ?? []).map(m => (
                  <li key={m.metodo} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-700">{m.metodo}</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-light text-primary-dark font-medium">
                      {n(m.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ===== Top comercios ===== */}
        <div className="card-padded">
          <h3 className="font-semibold text-slate-900 mb-4">Top comercios</h3>
          {(metrics?.topComercios.length ?? 0) === 0 && !loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">No hay comercios con estos filtros.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-light/50 text-left text-slate-500">
                    <th className="p-2">Comercio</th>
                    <th className="p-2">Fuente</th>
                    <th className="p-2 text-right">Tickets</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics?.topComercios ?? []).map(c => (
                    <tr key={c.comercio} className="border-b border-slate-50 last:border-0">
                      <td className="p-2 font-medium text-slate-900">{c.comercio}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${c.recognized ? 'bg-success-light text-success-dark' : 'bg-accent-100 text-accent-800'}`}>
                          {c.recognized ? 'Reconocido' : 'No reconocido'}
                        </span>
                      </td>
                      <td className="p-2 text-right font-medium">{n(c.total)}</td>
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
