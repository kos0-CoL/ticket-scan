import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { tickets, ticketItems, productos } from '@ticketscan/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// GET /api/tickets?userId=xxx&month=2026-10
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const month = searchParams.get('month');

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  let condition = eq(tickets.user_id, userId as any);

  if (month) {
    const start = new Date(month + '-01');
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    condition = and(condition, gte(tickets.fecha, start), lte(tickets.fecha, end));
  }

  const result = await db.select().from(tickets).where(condition).limit(100);
  return NextResponse.json(result);
}

// POST /api/tickets
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, fecha, comercio, total, items, tipo = 'compra', fuente = 'importado', metodo_pago, sucursal, hora } = body;

  if (!userId || !fecha || !comercio || !total) {
    return NextResponse.json({ error: 'faltan campos requeridos' }, { status: 400 });
  }

  const [ticket] = await db.insert(tickets).values({
    user_id: userId as any,
    fecha,
    hora: hora ?? null,
    comercio,
    sucursal: sucursal ?? null,
    total,
    metodo_pago: metodo_pago ?? null,
    tipo: tipo as any,
    fuente: fuente as any,
  }).returning();

  for (const item of items ?? []) {
    let productoId = null;
    if (item.nombre_normalizado) {
      const [found] = await db.select().from(productos).where(eq(productos.nombre_normalizado, item.nombre_normalizado)).limit(1);
      if (found) productoId = found.id;
    }

    await db.insert(ticketItems).values({
      ticket_id: ticket.id,
      producto_id: productoId,
      cantidad: item.cantidad ?? 1,
      precio_unitario: item.precio_unitario,
      precio_total: item.precio_total ?? item.precio_unitario * (item.cantidad ?? 1),
      descuento: item.descuento ?? null,
    });
  }

  return NextResponse.json(ticket, { status: 201 });
}
