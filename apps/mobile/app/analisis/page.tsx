'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../../lib/supabase-browser';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import '@/app/globals.css';

interface MonthlySpending {
  month: string;
  total: number;
  count: number;
}

interface CategorySpending {
  categoria: string;
  total: number;
  count: number;
  percentage: number;
}

interface TopMerchant {
  comercio: string;
  total: number;
  count: number;
}

interface AnalyticsData {
  currentMonth: { total: number; count: number; average: number };
  previousMonth: { total: number; count: number; average: number };
  monthlyTrend: MonthlySpending[];
  byCategory: CategorySpending[];
  topMerchants: TopMerchant[];
  loading: boolean;
  error: string | null;
}



const CATEGORY_COLORS: Record<string, string> = {
  'Almacén': '#00ABE4', 'Frescos': '#10B981', 'Lácteos': '#F59E0B',
  'Bebidas': '#8B5CF6', 'Limpieza': '#EF4444', 'Congelados': '#06B6D4',
  'Carnes': '#F97316', 'Frutas y Verduras': '#22C55E', 'Panadería': '#EAB308',
  'Otros': '#64748B'
};

export default function AnalisisPage() {
  const [data, setData] = useState<AnalyticsData>({
    currentMonth: { total: 0, count: 0, average: 0 },
    previousMonth: { total: 0, count: 0, average: 0 },
    monthlyTrend: [],
    byCategory: [],
    topMerchants: [],
    loading: true,
    error: null,
  });

  const loadAnalytics = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`/api/analytics?userId=${user.id}`);
      if (!res.ok) throw new Error('Error al cargar análisis');
      const json = await res.json();
      setData({ ...json, loading: false });
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setData(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat('es-AR').format(value);
  }

  function getTrendIcon(current: number, previous: number) {
    if (previous === 0) return current > 0 ? '📈' : '➖';
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return '📈';
    if (change < -5) return '📉';
    return '➡️';
  }

  function getTrendColor(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 'text-green-600' : 'text-slate-500';
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'text-green-600';
    if (change < -5) return 'text-red-600';
    return 'text-slate-500';
  }

  if (data.loading) {
    return (
      <main className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-padded h-24 bg-slate-50 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-50 rounded-xl" />
          <div className="h-64 bg-slate-50 rounded-xl" />
        </div>
      </main>
    );
  }

  if (data.error) {
    return (
      <main className="p-4">
        <div className="card-padded text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar análisis</h2>
          <p className="text-slate-500 mb-6">{data.error}</p>
          <button onClick={loadAnalytics} className="btn-primary">Reintentar</button>
        </div>
      </main>
    );
  }

  const { currentMonth, previousMonth, monthlyTrend, byCategory, topMerchants } = data;

  return (
    <main className="p-4 pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Análisis de gastos</h1>
        <p className="text-slate-500 text-sm">Tu presupuesto bajo control</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-padded">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Este mes</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(currentMonth.total)}</p>
          <p className="text-xs mt-1 flex items-center gap-1">
            <span className={getTrendColor(currentMonth.total, previousMonth.total)}>
              {getTrendIcon(currentMonth.total, previousMonth.total)}
            </span>
            <span className={getTrendColor(currentMonth.total, previousMonth.total)}>
              vs mes anterior
            </span>
          </p>
        </div>
        <div className="card-padded">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Tickets</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatNumber(currentMonth.count)}</p>
          <p className="text-xs mt-1 flex items-center gap-1">
            <span className={getTrendColor(currentMonth.count, previousMonth.count)}>
              {getTrendIcon(currentMonth.count, previousMonth.count)}
            </span>
            <span className={getTrendColor(currentMonth.count, previousMonth.count)}>
              vs mes anterior
            </span>
          </p>
        </div>
        <div className="card-padded">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Promedio/ticket</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(currentMonth.average)}</p>
          <p className="text-xs mt-1 flex items-center gap-1">
            <span className={getTrendColor(currentMonth.average, previousMonth.average)}>
              {getTrendIcon(currentMonth.average, previousMonth.average)}
            </span>
            <span className={getTrendColor(currentMonth.average, previousMonth.average)}>
              vs mes anterior
            </span>
          </p>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card-padded">
        <h2 className="font-semibold text-slate-900 mb-4">Evolución mensual</h2>
        {monthlyTrend.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400">
            <p>Sin datos suficientes para mostrar tendencia</p>
          </div>
        ) : (
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {monthlyTrend.map((month, i) => {
              const maxTotal = Math.max(...monthlyTrend.map(m => m.total), 1);
              const height = Math.max((month.total / maxTotal) * 200, 8);
              const isCurrent = i === monthlyTrend.length - 1;
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center justify-end min-w-[32px]">
                  <div
                    className={`rounded-t transition-all duration-300 w-full ${isCurrent ? 'bg-primary' : 'bg-primary-light'}`}
                    style={{ height: `${height}px` }}
                    title={`${format(new Date(month.month + '-01'), 'MMM yyyy', { locale: es })}: ${formatCurrency(month.total)}`}
                  />
                  <span className="text-xs text-slate-500 mt-1">
                    {format(new Date(month.month + '-01'), 'MMM', { locale: es })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="card-padded">
        <h2 className="font-semibold text-slate-900 mb-4">Por categoría</h2>
        {byCategory.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Sin datos de categorías aún</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map(cat => (
              <div key={cat.categoria} className="animate-in">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium capitalize text-slate-900">{cat.categoria}</span>
                  <span className="font-semibold text-primary">{formatCurrency(cat.total)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: CATEGORY_COLORS[cat.categoria] || '#00ABE4',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-0.5 text-right">
                  {cat.count} ticket{cat.count !== 1 ? 's' : ''} · {cat.percentage.toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Merchants */}
      <div className="card-padded">
        <h2 className="font-semibold text-slate-900 mb-4">Top comercios</h2>
        {topMerchants.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Sin datos de comercios aún</p>
        ) : (
          <ul className="space-y-2">
            {topMerchants.map((merchant, i) => (
              <li key={merchant.comercio} className="flex items-center justify-between animate-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{merchant.comercio}</p>
                    <p className="text-xs text-slate-500">{merchant.count} ticket{merchant.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="font-bold text-primary">{formatCurrency(merchant.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Download PDF */}
      <button className="btn-secondary w-full py-3 border-primary-light text-primary hover:bg-primary-light">
        📄 Descargar reporte PDF del mes
      </button>
    </main>
  );
}