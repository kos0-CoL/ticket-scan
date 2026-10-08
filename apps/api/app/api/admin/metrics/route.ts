import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { tickets, normalizacionLog } from '@ticketscan/db/schema';
import { sql, count, gte, lt, and } from 'drizzle-orm';
import { requireAdmin, isAdminResponse } from '../../../../lib/admin-auth';

// Cadenas de supermercado reconocidas en AR (se compara contra lower(comercio)).
const RECOGNIZED_REGEX =
  '\\y(coto|carrefour|jumbo|disco|dia|walmart|makro|vea|changomas|carry|leader|auchan|hipermercado)\\y';

function sourceCond(source: string | null) {
  if (source === 'recognized') return sql<boolean>`lower(comercio) ~ ${RECOGNIZED_REGEX}`;
  if (source === 'unrecognized') return sql<boolean>`not (lower(comercio) ~ ${RECOGNIZED_REGEX})`;
  return undefined;
}

// GET /api/admin/metrics?days=30 | ?month=YYYY-MM&source=recognized|unrecognized
export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM
  const source = searchParams.get('source'); // recognized | unrecognized

  // Ventana temporal: mes exacto, o los últimos N días (default 30).
  let since: Date;
  let until: Date | null = null;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    since = new Date(Date.UTC(y, m - 1, 1));
    until = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1));
  } else {
    const days = parseInt(searchParams.get('days') ?? '30');
    since = new Date();
    since.setDate(since.getDate() - days);
  }

  const windowCond = until
    ? and(gte(tickets.created_at, since), lt(tickets.created_at, until))
    : gte(tickets.created_at, since);
  const ticketWhere = and(windowCond, sourceCond(source));

  // Tickets por día
  const ticketsPerDay = await db
    .select({
      date: sql<string>`to_char(date(created_at), 'YYYY-MM-DD')`,
      total: count(),
    })
    .from(tickets)
    .where(ticketWhere)
    .groupBy(sql`to_char(date(created_at), 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(date(created_at), 'YYYY-MM-DD')`);

  // Tasa de éxito (tickets con items vs sin items)
  const totalTicketsResult = await db
    .select({ count: count() })
    .from(tickets)
    .where(ticketWhere);
  const ticketsWithItemsResult = await db
    .select({ count: count() })
    .from(tickets)
    .where(
      and(sql`id IN (SELECT DISTINCT ticket_id FROM ticket_items)`, ticketWhere)
    );

  // Normalización: metodo breakdown (misma ventana temporal)
  const normalizationByMethod = await db
    .select({
      metodo: normalizacionLog.metodo,
      total: count(),
    })
    .from(normalizacionLog)
    .where(gte(normalizacionLog.created_at, since))
    .groupBy(normalizacionLog.metodo);

  // Reparto por fuente (reconocidos vs no) dentro de la MISMA ventana,
  // ignorando el filtro de fuente para que el usuario vea ambas opciones.
  const [recognizedResult, unrecognizedResult] = await Promise.all([
    db
      .select({ count: count() })
      .from(tickets)
      .where(and(windowCond, sourceCond('recognized'))),
    db
      .select({ count: count() })
      .from(tickets)
      .where(and(windowCond, sourceCond('unrecognized'))),
  ]);

  // Meses disponibles para el filtro (últimos 12 con tickets)
  const monthRows = await db
    .select({
      month: sql<string>`to_char(created_at, 'YYYY-MM')`,
      total: count(),
    })
    .from(tickets)
    .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
    .orderBy(sql`to_char(created_at, 'YYYY-MM') DESC`)
    .limit(12);

  // Top comercios dentro de la ventana + filtro activo
  const topComercios = await db
    .select({
      comercio: tickets.comercio,
      total: count(),
      // El reconocimiento se calcula en SQL (\y = word boundary en Postgres).
      // Replicarlo en JS con el mismo string no funciona: en JavaScript `\y`
      // es un escape de identidad y el pattern nunca matchea.
      recognized: sql<boolean>`lower(comercio) ~ ${RECOGNIZED_REGEX}`,
    })
    .from(tickets)
    .where(ticketWhere)
    .groupBy(tickets.comercio)
    .orderBy(sql`count(*) DESC`)
    .limit(8);

  return NextResponse.json({
    window: { month: month || null, since: since.toISOString(), until: until?.toISOString() ?? null, source },
    ticketsPerDay,
    totalTickets: totalTicketsResult[0]?.count ?? 0,
    ticketsWithItems: ticketsWithItemsResult[0]?.count ?? 0,
    successRate: totalTicketsResult[0]?.count
      ? (ticketsWithItemsResult[0]?.count ?? 0) / totalTicketsResult[0].count
      : 0,
    normalizationByMethod,
    bySource: {
      recognized: Number(recognizedResult[0]?.count ?? 0),
      unrecognized: Number(unrecognizedResult[0]?.count ?? 0),
    },
    months: monthRows.map((m) => ({ month: m.month, total: Number(m.total) })),
    topComercios: topComercios.map((c) => ({
      comercio: c.comercio,
      total: Number(c.total),
      recognized: c.recognized,
    })),
  });
}
