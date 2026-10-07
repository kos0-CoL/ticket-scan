import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { tickets, ticketItems, productos, categorias, normalizacionLog } from '@ticketscan/db/schema';
import { eq } from 'drizzle-orm';
import { extractTicket } from '@ticketscan/ai/registry';
import { normalizeProduct } from '@ticketscan/ai/normalize';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/tickets/process
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, imageUrl } = body;

  if (!userId || !imageUrl) {
    return NextResponse.json({ error: 'userId + imageUrl required' }, { status: 400 });
  }

  // 1. Extraer con IA
  let extracted;
  try {
    extracted = await extractTicket(imageUrl);
  } catch (err: any) {
    return NextResponse.json({ error: 'extracción falló: ' + err.message }, { status: 500 });
  }

  // 2. Normalizar cada item
  const normalizedItems = [];
  for (const item of extracted.items ?? []) {
    const norm = await normalizeProduct(item.nombre);
    normalizedItems.push({ ...item, ...norm });
  }

  // 3. Upsert productos + crear ticket
  const ticketItemsData = [];

  for (const item of normalizedItems) {
    // Upsert producto
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
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      precio_total: item.precio_total,
    });
  }

  // 4. Crear ticket
  const [ticket] = await db.insert(tickets).values({
    user_id: userId as any,
    fecha: extracted.fecha,
    hora: extracted.hora ?? null,
    comercio: extracted.comercio,
    total: extracted.total,
    metodo_pago: extracted.metodo_pago ?? null,
    tipo: 'compra',
    imagen_url: imageUrl,
    fuente: 'foto_multiple',
  }).returning();

  // 5. Crear ticket_items
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
