import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { normalizacionLog, productos } from '@ticketscan/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/normalization
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') ?? '100');

  const rows = await db
    .select()
    .from(normalizacionLog)
    .orderBy(desc(normalizacionLog.created_at))
    .limit(limit);

  return NextResponse.json(rows);
}

// POST /api/admin/normalization/approve - approve/reject
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, nombre_normalizado, categoria } = body;

  await db
    .update(normalizacionLog)
    .set({ 
      nombre_normalizado: nombre_normalizado ?? undefined,
      categoria_asignada: categoria ?? undefined,
      status: 'approved' as const,
    })
    .where(eq(normalizacionLog.id, id));

  return NextResponse.json({ success: true });
}

// PUT /api/admin/normalization/rules - add manual rule
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { raw_name, normalized_name, categoria, marca, unidad } = body;

  const [producto] = await db.insert(productos)
    .values({
      nombre_normalizado: normalized_name,
      nombre_original: raw_name,
      categoria,
      marca: marca ?? null,
      unidad: unidad ?? null,
    })
    .onConflictDoUpdate({
      target: productos.nombre_normalizado,
      set: { categoria, marca: marca ?? null, unidad: unidad ?? null },
    })
    .returning();

  return NextResponse.json(producto);
}

// DELETE /api/admin/normalization - reject
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db.update(normalizacionLog).set({ status: 'rejected' as const }).where(eq(normalizacionLog.id, id as any));
  return NextResponse.json({ success: true });
}
