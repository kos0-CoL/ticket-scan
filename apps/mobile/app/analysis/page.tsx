'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Badge } from '@ticketscan/ui';
import { getAnalytics, AnalyticsData, MonthlySpending, CategorySpending, TopMerchant } from '../../lib/api';

export default function AnalysisPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAnalytics();
      if (response.ok && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Error al cargar análisis');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Análisis de gastos</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Análisis de gastos</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Análisis de gastos</h1>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-center">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const { currentMonth, previousMonth, monthlyTrend, byCategory, topMerchants } = data;

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  function renderCategories() {
    if (byCategory.length === 0) {
      return <p className="text-slate-500 text-center py-4">No hay datos de categorías</p>;
    }
    return byCategory.map((c: CategorySpending) => (
      <div key={c.categoria} className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{c.categoria}</span>
          <span className="font-mono">{new Intl.NumberFormat('es-AR').format(c.total)}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.percentage}%` }} />
        </div>
        <p className="text-xs text-slate-500 text-right">{c.percentage}% • {c.count} items</p>
      </div>
    ));
  }

  function renderMerchants() {
    if (topMerchants.length === 0) {
      return <p className="text-slate-500 text-center py-4">No hay datos de comercios</p>;
    }
    return topMerchants.map((m: TopMerchant, i: number) => (
      <div key={m.comercio} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
            {i + 1}
          </span>
          <span className="font-medium">{m.comercio}</span>
        </div>
        <div className="text-right">
          <p className="font-mono font-semibold">{new Intl.NumberFormat('es-AR').format(m.total)}</p>
          <p className="text-xs text-slate-500">{m.count} tickets</p>
        </div>
      </div>
    ));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Análisis de gastos</h1>

      {/* Monthly summary */}
      <Card elevated>
        <CardHeader title="Resumen mensual" subtitle={`${currentMonth.count} tickets • ${formatCurrency(currentMonth.total)}`} />
        <CardContent className="space-y-3">
          {monthlyTrend.map((m: MonthlySpending) => (
            <div key={m.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="font-medium">{m.month}</p>
                <p className="text-sm text-slate-500">{m.count} tickets • Promedio ${new Intl.NumberFormat('es-AR').format(Math.round(m.average))}</p>
              </div>
              <span className="font-mono font-semibold text-lg">${formatCurrency(m.total)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comparison with previous month */}
      <Card elevated>
        <CardHeader title="Comparación mensual" />
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">Mes actual</p>
            <p className="font-mono font-semibold text-lg">{formatCurrency(currentMonth.total)}</p>
            <p className="text-xs text-slate-500">{currentMonth.count} tickets • Promedio ${new Intl.NumberFormat('es-AR').format(Math.round(currentMonth.average))}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">Mes anterior</p>
            <p className="font-mono font-semibold text-lg">{formatCurrency(previousMonth.total)}</p>
            <p className="text-xs text-slate-500">{previousMonth.count} tickets • Promedio ${new Intl.NumberFormat('es-AR').format(Math.round(previousMonth.average))}</p>
          </div>
          <div className="col-span-2 p-3 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">Variación</p>
            <p className="font-mono font-semibold text-lg text-primary">
              {currentMonth.total >= previousMonth.total ? '+' : ''}
              {formatCurrency(currentMonth.total - previousMonth.total)}
              {' '}
              ({previousMonth.total > 0 
                ? `${((currentMonth.total - previousMonth.total) / previousMonth.total * 100).toFixed(1)}%` 
                : 'N/A'}
              )
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card elevated>
        <CardHeader title="Por categoría" />
        <CardContent className="space-y-3">
          {renderCategories()}
        </CardContent>
      </Card>

      {/* Top merchants */}
      <Card elevated>
        <CardHeader title="Top comercios" />
        <CardContent className="space-y-3">
          {renderMerchants()}
        </CardContent>
      </Card>
    </div>
  );
}