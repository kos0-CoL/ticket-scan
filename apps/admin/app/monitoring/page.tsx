'use client';
import { useEffect, useState } from 'react';

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(r => r.json())
      .then(data => { setMetrics(data); setLoading(false); });
  }, []);

  if (loading) return <main className="p-8"><p>Cargando...</p></main>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Monitorización</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Tickets totales</h3>
          <p className="text-3xl font-bold">{metrics?.totalTickets ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Tasa de éxito IA</h3>
          <p className="text-3xl font-bold">{(metrics?.successRate * 100 ?? 0).toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-medium mb-4">Tickets por día</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-100"><th className="p-2 text-left">Fecha</th><th className="p-2 text-right">Tickets</th></tr></thead>
          <tbody>
            {metrics?.ticketsPerDay?.map((d: any) => (
              <tr key={d.date} className="border-t">
                <td className="p-2">{d.date}</td>
                <td className="p-2 text-right">{d.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">Normalización por método</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-100"><th className="p-2 text-left">Método</th><th className="p-2 text-right">Total</th></tr></thead>
          <tbody>
            {metrics?.normalizationByMethod?.map((m: any) => (
              <tr key={m.metodo} className="border-t">
                <td className="p-2 capitalize">{m.metodo}</td>
                <td className="p-2 text-right">{m.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
