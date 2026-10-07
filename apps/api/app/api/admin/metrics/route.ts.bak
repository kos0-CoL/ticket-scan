import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { tickets, ticketItems, normalizacionLog, aiProviders } from '@ticketscan/db/schema';
import { sql, count, gte, lte, and, eq } from 'drizzle-orm';

// GET /api/admin/metrics
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') ?? '30');
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Tickets por día
  const ticketsPerDay = await db
    .select({
      date: sql<string>`to_char(date(created_at), 'YYYY-MM-DD')`,
      total: count(),
    })
    .from(tickets)
    .where(gte(tickets.created_at, since))
    .groupBy(sql`to_char(date(created_at), 'YYYY-MM-DD')`;

  // Tasa de éxito (tickets con items vs sin items)
  const totalTicketsResult = await db.select({ count: count() }).from(tickets).where(gte(tickets.created_at, since));
  const ticketsWithItemsResult = await db
    .select({ count: count() })
    .from(tickets)
    .where(sql`id IN (SELECT DISTINCT ticket_id FROM ticket_items)`)
    .where(gte(tickets.created_at, since));

  // Normalización: metodo breakdown
  const normalizationByMethod = await db
    .select({
      metodo: normalizacionLog.metodo,
      total: count(),
    })
    .from(normalizacionLog)
    .where(gte(normalizacionLog.created_at, since))
    .groupBy(normalizacionLog.metodo);

  return NextResponse.json({
    ticketsPerDay: ticketsPerDay,
    totalTickets: totalTicketsResult[0]?.count ?? 0,
    ticketsWithItems: ticketsWithItemsResult[0]?.count ?? 0,
    successRate: totalTicketsResult[0]?.count ? (ticketsWithItemsResult[0]?.count ?? 0) / totalTicketsResult[0].count : 0,
    normalizationByMethod: normalizationByMethod,
  });
}
