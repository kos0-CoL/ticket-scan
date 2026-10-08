import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { landingSections, eq } from '@ticketscan/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/admin/landing - List all landing sections
export async function GET() {
  const sections = await db.select().from(landingSections).orderBy(desc(landingSections.sort_order));
  return NextResponse.json(sections);
}

// POST /api/admin/landing - Create new landing section
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, title, content, enabled, sort_order } = body;

  if (!key || !title) {
    return NextResponse.json({ error: 'key y title son requeridos' }, { status: 400 });
  }

  const [section] = await db.insert(landingSections).values({
    key,
    title,
    content: content ?? {},
    enabled: enabled ?? true,
    sort_order: sort_order ?? 0,
  }).returning();

  return NextResponse.json(section, { status: 201 });
}

// PUT /api/admin/landing - Update landing section
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, key, title, content, enabled, sort_order } = body;

  if (!id) {
    return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  }

  const updates: any = { updated_at: new Date() };
  if (key !== undefined) updates.key = key;
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (enabled !== undefined) updates.enabled = enabled;
  if (sort_order !== undefined) updates.sort_order = sort_order;

  const [row] = await db.update(landingSections).set(updates).where(eq(landingSections.id, id)).returning();
  return NextResponse.json(row);
}

// DELETE /api/admin/landing - Delete landing section
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db.delete(landingSections).where(eq(landingSections.id, id));
  return new NextResponse(null, { status: 204 });
}