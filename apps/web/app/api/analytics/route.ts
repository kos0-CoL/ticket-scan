import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  // Current month
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current month stats
  const { data: currentTickets, error: currentError } = await supabase
    .from('tickets')
    .select('total')
    .eq('user_id', user.id)
    .gte('fecha', currentMonthStart.toISOString().split('T')[0])
    .lte('fecha', currentMonthEnd.toISOString().split('T')[0]);

  if (currentError) {
    return NextResponse.json({ ok: false, error: currentError.message }, { status: 500 });
  }

  const currentTotal = currentTickets?.reduce((sum: number, t: { total: string | number }) => sum + Number(t.total), 0) || 0;
  const currentCount = currentTickets?.length || 0;
  const currentAverage = currentCount > 0 ? currentTotal / currentCount : 0;

  // Previous month stats
  const { data: previousTickets, error: previousError } = await supabase
    .from('tickets')
    .select('total')
    .eq('user_id', user.id)
    .gte('fecha', previousMonthStart.toISOString().split('T')[0])
    .lte('fecha', previousMonthEnd.toISOString().split('T')[0]);

  if (previousError) {
    return NextResponse.json({ ok: false, error: previousError.message }, { status: 500 });
  }

  const previousTotal = previousTickets?.reduce((sum: number, t: { total: string | number }) => sum + Number(t.total), 0) || 0;
  const previousCount = previousTickets?.length || 0;
  const previousAverage = previousCount > 0 ? previousTotal / previousCount : 0;

  // Monthly trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const { data: monthTickets } = await supabase
      .from('tickets')
      .select('total')
      .eq('user_id', user.id)
      .gte('fecha', monthStart.toISOString().split('T')[0])
      .lte('fecha', monthEnd.toISOString().split('T')[0]);

    const monthTotal = monthTickets?.reduce((sum: number, t: { total: string | number }) => sum + Number(t.total), 0) || 0;
    const monthCount = monthTickets?.length || 0;
    const monthAverage = monthCount > 0 ? monthTotal / monthCount : 0;

    monthlyTrend.push({
      month: monthStart.toLocaleString('es-AR', { month: 'short', year: '2-digit' }),
      total: monthTotal,
      count: monthCount,
      average: monthAverage,
    });
  }

  // By category
  const { data: allTickets } = await supabase
    .from('tickets')
    .select('comercio, total, ticket_items(categoria)')
    .eq('user_id', user.id)
    .gte('fecha', currentMonthStart.toISOString().split('T')[0]);

  const categoryMap = new Map<string, { total: number; count: number }>();
  
  allTickets?.forEach(ticket => {
    ticket.ticket_items?.forEach((item: any) => {
      const cat = item.categoria || 'otros';
      const existing = categoryMap.get(cat) || { total: 0, count: 0 };
      existing.total += Number(item.precio) * Number(item.cantidad);
      existing.count += 1;
      categoryMap.set(cat, existing);
    });
  });

  const totalCurrent = Array.from(categoryMap.values()).reduce((sum: number, c: { total: number }) => sum + c.total, 0);
  
  const byCategory = Array.from(categoryMap.entries())
    .map(([categoria, data]) => ({
      categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
      total: data.total,
      count: data.count,
      percentage: totalCurrent > 0 ? Math.round((data.total / totalCurrent) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Top merchants
  const merchantMap = new Map<string, { total: number; count: number }>();
  
  allTickets?.forEach(ticket => {
    const existing = merchantMap.get(ticket.comercio) || { total: 0, count: 0 };
    existing.total += Number(ticket.total);
    existing.count += 1;
    merchantMap.set(ticket.comercio, existing);
  });

  const topMerchants = Array.from(merchantMap.entries())
    .map(([comercio, data]) => ({
      comercio,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return NextResponse.json({
    ok: true,
    data: {
      currentMonth: { total: currentTotal, count: currentCount, average: currentAverage },
      previousMonth: { total: previousTotal, count: previousCount, average: previousAverage },
      monthlyTrend,
      byCategory,
      topMerchants,
    },
  });
}