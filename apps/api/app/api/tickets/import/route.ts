import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { tickets, ticketItems, productos } from '@ticketscan/db/schema';

import { normalizeProduct } from '@ticketscan/ai/normalize';

// POST /api/tickets/import
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, comercio, fecha, total, items, tipo = 'compra', fuente = 'importado', metodo_pago, sucursal, hora } = body;

  if (!userId || !fecha || !comercio || !total || !items) {
    return NextResponse.json({ error: 'faltan campos requeridos' }, { status: 400 });
  }

  // Normalizar cada item
  const normalizedItems = [];
  for (const item of items) {
    const norm = await normalizeProduct(item.nombre);
    normalizedItems.push({ ...item, ...norm });
  }

  // Upsert productos + crear ticket
  const ticketItemsData = [];

  for (const item of normalizedItems) {
    const [producto] = await db.insert(productos)
      .values({
        nombre_normalizado: item.nombre_normalizado,
        nombre_original: item.nombre,
        categoria: item.categoria,
        marca: item.marca ?? null,
        unidad: item.unidad,
      })
      .onConflictDoUpdate({
        target: productos.nombre_normalizado,
        set: { nombre_original: item.nombre, categoria: item.categoria, updated_at: new Date() },
      })
      .returning();

    ticketItemsData.push({
      producto_id: producto.id,
      cantidad: item.cantidad ?? 1,
      precio_unitario: item.precio_unitario,
      precio_total: item.precio_total ?? item.precio_unitario * (item.cantidad ?? 1),
    });
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

  for (const item of ticketItemsData) {
    await db.insert(ticketItems).values({
      ticket_id: ticket.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      precio_total: item.precio_total,
    });
  }

  return NextResponse.json({ ticket, items: normalizedItems }, { status: 201 });
}
