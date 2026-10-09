'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../../lib/supabase-browser';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button, Card, CardHeader, CardContent } from '@ticketscan/ui';

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
    if (previous === 0) return current > 0 ? 'var(--color-success)' : 'var(--color-500)';
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'var(--color-success)';
    if (change < -5) return 'var(--color-danger)';
    return 'var(--color-500)';
  }

  if (data.loading) {
    return (
      <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ height: '2rem', backgroundColor: 'var(--color-200)', borderRadius: '0.5rem', width: '33%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[...Array(3)].map((_, i) => (
              <Card key={i} padded style={{ height: '6rem', backgroundColor: 'var(--color-50)', borderRadius: '0.75rem' }} />
            ))}
          </div>
          <Card padded style={{ height: '16rem', backgroundColor: 'var(--color-50)', borderRadius: '0.75rem' }} />
          <Card padded style={{ height: '16rem', backgroundColor: 'var(--color-50)', borderRadius: '0.75rem' }} />
        </div>
      </main>
    );
  }

  if (data.error) {
    return (
      <main style={{ padding: '1rem' }}>
        <Card padded style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', backgroundColor: 'rgba(185, 28, 28, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-900)', marginBottom: '0.5rem' }}>Error al cargar análisis</h2>
          <p style={{ color: 'var(--color-500)', marginBottom: '1.5rem' }}>{data.error}</p>
          <Button variant="primary" onClick={loadAnalytics}>Reintentar</Button>
        </Card>
      </main>
    );
  }

  const { currentMonth, previousMonth, monthlyTrend, byCategory, topMerchants } = data;

  return (
    <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '6rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: 0 }}>Análisis de gastos</h1>
        <p style={{ color: 'var(--color-500)', fontSize: '0.875rem', margin: 0 }}>Tu presupuesto bajo control</p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <Card padded>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Este mes</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: '0.25rem 0' }}>{formatCurrency(currentMonth.total)}</p>
          <p style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
            <span style={{ color: getTrendColor(currentMonth.total, previousMonth.total) }}>{getTrendIcon(currentMonth.total, previousMonth.total)}</span>
            <span style={{ color: getTrendColor(currentMonth.total, previousMonth.total) }}>vs mes anterior</span>
          </p>
        </Card>
        <Card padded>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Tickets</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: '0.25rem 0' }}>{formatNumber(currentMonth.count)}</p>
          <p style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
            <span style={{ color: getTrendColor(currentMonth.count, previousMonth.count) }}>{getTrendIcon(currentMonth.count, previousMonth.count)}</span>
            <span style={{ color: getTrendColor(currentMonth.count, previousMonth.count) }}>vs mes anterior</span>
          </p>
        </Card>
        <Card padded>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Promedio/ticket</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-900)', margin: '0.25rem 0' }}>{formatCurrency(currentMonth.average)}</p>
          <p style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
            <span style={{ color: getTrendColor(currentMonth.average, previousMonth.average) }}>{getTrendIcon(currentMonth.average, previousMonth.average)}</span>
            <span style={{ color: getTrendColor(currentMonth.average, previousMonth.average) }}>vs mes anterior</span>
          </p>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card padded>
        <CardHeader title="Evolución mensual" />
        <CardContent>
          {monthlyTrend.length === 0 ? (
            <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-400)' }}>
              <p>Sin datos suficientes para mostrar tendencia</p>
            </div>
          ) : (
            <div style={{ height: '12rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', padding: '0 0.5rem' }}>
              {monthlyTrend.map((month, i) => {
                const maxTotal = Math.max(...monthlyTrend.map(m => m.total), 1);
                const height = Math.max((month.total / maxTotal) * 200, 8);
                const isCurrent = i === monthlyTrend.length - 1;
                return (
                  <div key={month.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minWidth: '32px' }}>
                    <div
                      style={{
                        borderRadius: '0.25rem 0.25rem 0 0',
                        transition: 'all 0.3s',
                        width: '100%',
                        height: `${height}px`,
                        backgroundColor: isCurrent ? 'var(--color-primary)' : 'rgba(0, 171, 228, 0.1)'
                      }}
                      title={`${format(new Date(month.month + '-01'), 'MMM yyyy', { locale: es })}: ${formatCurrency(month.total)}`}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-500)', marginTop: '0.25rem' }}>
                      {format(new Date(month.month + '-01'), 'MMM', { locale: es })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card padded>
        <CardHeader title="Por categoría" />
        <CardContent>
          {byCategory.length === 0 ? (
            <p style={{ color: 'var(--color-400)', textAlign: 'center', padding: '2rem' }}>Sin datos de categorías aún</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {byCategory.map(cat => (
                <div key={cat.categoria} style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ display: 'flex', justifyContent: 'spaceBetween', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '500', color: 'var(--color-900)', textTransform: 'capitalize' }}>{cat.categoria}</span>
                    <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{formatCurrency(cat.total)}</span>
                  </div>
                  <div style={{ height: '0.5rem', backgroundColor: 'var(--color-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease-out',
                        width: `${cat.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[cat.categoria] || '#00ABE4',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', marginTop: '0.125rem', textAlign: 'right' }}>
                    {cat.count} ticket{cat.count !== 1 ? 's' : ''} · {cat.percentage.toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Merchants */}
      <Card padded>
        <CardHeader title="Top comercios" />
        <CardContent>
          {topMerchants.length === 0 ? (
            <p style={{ color: 'var(--color-400)', textAlign: 'center', padding: '2rem' }}>Sin datos de comercios aún</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {topMerchants.map((merchant, i) => (
                <li key={merchant.comercio} style={{ display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween', animation: 'fadeIn 0.3s ease-out', animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0, 171, 228, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.875rem' }}>
                      {i + 1}
                    </span>
                    <div>
                      <p style={{ fontWeight: '500', color: 'var(--color-900)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{merchant.comercio}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-500)', margin: 0 }}>{merchant.count} ticket{merchant.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{formatCurrency(merchant.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Download PDF */}
      <Button variant="ghost" style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(0, 171, 228, 0.1)', color: 'var(--color-primary)' }}>
        📄 Descargar reporte PDF del mes
      </Button>
    </main>
  );
}