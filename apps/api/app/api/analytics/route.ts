import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { tickets, ticketItems, productos } from '@ticketscan/db/schema';
import { eq, and, gte, lte, sql, sum, count, desc } from 'drizzle-orm';

function monthBounds(month: string) {
  const start = new Date(month + '-01');
  const startStr = start.toISOString().slice(0, 10);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const endStr = end.toISOString().slice(0, 10);
  return { startStr, endStr };
}

function formatMonth(d: Date) {
  return d.toISOString().slice(0, 7); // YYYY-MM
}

// GET /api/analytics?userId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const now = new Date();
    const currentMonth = formatMonth(now);
    const previousMonth = formatMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const { startStr: curStart, endStr: curEnd } = monthBounds(currentMonth);
    const { startStr: prevStart, endStr: prevEnd } = monthBounds(previousMonth);

    // Current month stats
    const curStats = await db
      .select({
        total: sum(tickets.total),
        count: count(),
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.user_id, userId as any),
          gte(tickets.fecha, curStart),
          lte(tickets.fecha, curEnd)
        )
      );

    // Previous month stats
    const prevStats = await db
      .select({
        total: sum(tickets.total),
        count: count(),
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.user_id, userId as any),
          gte(tickets.fecha, prevStart),
          lte(tickets.fecha, prevEnd)
        )
      );

    const currentTotal = Number(curStats[0]?.total ?? 0);
    const currentCount = Number(curStats[0]?.count ?? 0);
    const previousTotal = Number(prevStats[0]?.total ?? 0);
    const previousCount = Number(prevStats[0]?.count ?? 0);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10);

    const monthlyTrend = await db
      .select({
        month: sql<string>`to_char(fecha, 'YYYY-MM')`,
        total: sum(tickets.total),
        count: count(),
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.user_id, userId as any),
          gte(tickets.fecha, sixMonthsAgoStr)
        )
      )
      .groupBy(sql`to_char(fecha, 'YYYY-MM')`)
      .orderBy(sql`to_char(fecha, 'YYYY-MM')`);

    // Category breakdown (via ticket_items -> productos)
    const categoryBreakdown = await db
      .select({
        categoria: productos.categoria,
        total: sum(ticketItems.precio_total),
        count: count(),
      })
      .from(ticketItems)
      .innerJoin(tickets, eq(ticketItems.ticket_id, tickets.id))
      .leftJoin(productos, eq(ticketItems.producto_id, productos.id))
      .where(
        and(
          eq(tickets.user_id, userId as any),
          gte(tickets.fecha, curStart),
          lte(tickets.fecha, curEnd)
        )
      )
      .groupBy(productos.categoria)
      .orderBy(desc(sum(ticketItems.precio_total)));

    // Calculate percentages
    const categoryTotal = categoryBreakdown.reduce((sum, c) => sum + Number(c.total ?? 0), 0);
    const byCategory = categoryBreakdown.map(c => ({
      categoria: c.categoria || 'Otros',
      total: Number(c.total ?? 0),
      count: Number(c.count ?? 0),
      percentage: categoryTotal > 0 ? (Number(c.total ?? 0) / categoryTotal) * 100 : 0,
    }));

    // Top merchants
    const topMerchants = await db
      .select({
        comercio: tickets.comercio,
        total: sum(tickets.total),
        count: count(),
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.user_id, userId as any),
          gte(tickets.fecha, curStart),
          lte(tickets.fecha, curEnd)
        )
      )
      .groupBy(tickets.comercio)
      .orderBy(desc(sum(tickets.total)))
      .limit(5);

    return NextResponse.json({
      currentMonth: {
        total: currentTotal,
        count: currentCount,
        average: currentCount > 0 ? currentTotal / currentCount : 0,
      },
      previousMonth: {
        total: previousTotal,
        count: previousCount,
        average: previousCount > 0 ? previousTotal / previousCount : 0,
      },
      monthlyTrend: monthlyTrend.map(m => ({
        month: m.month,
        total: Number(m.total ?? 0),
        count: Number(m.count ?? 0),
      })),
      byCategory,
      topMerchants: topMerchants.map(m => ({
        comercio: m.comercio,
        total: Number(m.total ?? 0),
        count: Number(m.count ?? 0),
      })),
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}