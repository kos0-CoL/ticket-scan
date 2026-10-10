'use client';

import { Card, CardHeader, CardContent, Badge, StatusBadge } from '@ticketscan/ui';

export default function AnalysisPage() {
  const monthlyData = [
    { month: 'Ene 2025', total: 189450, count: 12, avg: 15787 },
    { month: 'Dic 2024', total: 165200, count: 10, avg: 16520 },
    { month: 'Nov 2024', total: 143800, count: 9, avg: 15977 },
  ];

  const categoryData = [
    { categoria: 'Almacén', total: 89450, count: 45, percentage: 47 },
    { categoria: 'Frescos', total: 42100, count: 23, percentage: 22 },
    { categoria: 'Bebidas', total: 28900, count: 15, percentage: 15 },
    { categoria: 'Limpieza', total: 18500, count: 8, percentage: 10 },
    { categoria: 'Otros', total: 10500, count: 5, percentage: 6 },
  ];

  const topMerchants = [
    { comercio: 'Carrefour', total: 89450, count: 23 },
    { comercio: 'Dia', total: 45200, count: 18 },
    { comercio: 'Coto', total: 32100, count: 12 },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Análisis de gastos</h1>

      {/* Monthly summary */}
      <Card elevated>
        <CardHeader title="Resumen mensual" subtitle={`${monthlyData[0].count} tickets • $${monthlyData[0].total.toLocaleString()}`} />
        <CardContent className="space-y-3">
          {monthlyData.map((m) => (
            <div key={m.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="font-medium">{m.month}</p>
                <p className="text-sm text-slate-500">{m.count} tickets • Promedio $${m.avg.toLocaleString()}</p>
              </div>
              <span className="font-mono font-semibold text-lg">${m.total.toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card elevated>
        <CardHeader title="Por categoría" />
        <CardContent className="space-y-3">
          {categoryData.map((c) => (
            <div key={c.categoria} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.categoria}</span>
                <span className="font-mono">${c.total.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.percentage}%` }} />
              </div>
              <p className="text-xs text-slate-500 text-right">{c.percentage}% • {c.count} items</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top merchants */}
      <Card elevated>
        <CardHeader title="Top comercios" />
        <CardContent className="space-y-3">
          {topMerchants.map((m, i) => (
            <div key={m.comercio} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                  {i + 1}
                </span>
                <span className="font-medium">{m.comercio}</span>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold">${m.total.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{m.count} tickets</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}