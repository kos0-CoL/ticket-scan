import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { mlConfig, eq } from '@ticketscan/db/schema';
import { desc } from 'drizzle-orm';
import { requireAdmin, isAdminResponse } from '../../../../lib/admin-auth';

// GET /api/admin/ml-config - Get current ML config
export async function GET() {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const configs = await db.select().from(mlConfig).orderBy(desc(mlConfig.created_at)).limit(1);
  return NextResponse.json(configs);
}

// POST /api/admin/ml-config - Create new ML config
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const body = await req.json();
  const { provider_id, model_id, temperature, max_tokens, system_prompt, version, is_active } = body;

  if (!provider_id || !model_id) {
    return NextResponse.json({ error: 'provider_id y model_id son requeridos' }, { status: 400 });
  }

  // If setting as active, deactivate others
  if (is_active) {
    await db.update(mlConfig).set({ is_active: false }).where(eq(mlConfig.is_active, true));
  }

  const [config] = await db.insert(mlConfig).values({
    provider_id,
    model_id,
    temperature: temperature ?? 0.1,
    max_tokens: max_tokens ?? 4096,
    system_prompt: system_prompt ?? null,
    version: version ?? '1.0.0',
    is_active: is_active ?? false,
  }).returning();

  return NextResponse.json(config, { status: 201 });
}

// PUT /api/admin/ml-config - Update ML config
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const body = await req.json();
  const { id, provider_id, model_id, temperature, max_tokens, system_prompt, version, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  }

  // If setting as active, deactivate others
  if (is_active) {
    await db.update(mlConfig).set({ is_active: false }).where(eq(mlConfig.is_active, true));
  }

  const updates: any = { updated_at: new Date() };
  if (provider_id !== undefined) updates.provider_id = provider_id;
  if (model_id !== undefined) updates.model_id = model_id;
  if (temperature !== undefined) updates.temperature = temperature;
  if (max_tokens !== undefined) updates.max_tokens = max_tokens;
  if (system_prompt !== undefined) updates.system_prompt = system_prompt;
  if (version !== undefined) updates.version = version;
  if (is_active !== undefined) updates.is_active = is_active;

  const [row] = await db.update(mlConfig).set(updates).where(eq(mlConfig.id, id)).returning();
  return NextResponse.json(row);
}

// DELETE /api/admin/ml-config - Delete ML config
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db.delete(mlConfig).where(eq(mlConfig.id, id));
  return new NextResponse(null, { status: 204 });
}