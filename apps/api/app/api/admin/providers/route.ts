import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { aiProviders, eq } from '@ticketscan/db/schema';
import { encrypt } from '@ticketscan/ai/crypto';
import { requireAdmin, isAdminResponse } from '../../../../lib/admin-auth';

// "" y strings sin esquema se normalizan a null; un valor que no sea
// http(s):// válido devuelve false (rechazo con 400).
function normalizeBaseUrl(value: unknown): string | null | false {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    return url.toString().replace(/\/$/, '');
  } catch {
    return false;
  }
}

// GET /api/admin/providers
export async function GET() {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const providers = await db.select().from(aiProviders).orderBy(aiProviders.fallback_order);
  // Never expose api_key_enc to frontend
  const safe = providers.map(({ api_key_enc, ...rest }) => rest);
  return NextResponse.json(safe);
}

// POST /api/admin/providers
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const body = await req.json();
  const { name, apiKey, baseUrl, defaultModel, fallbackOrder } = body;

  if (!name || !apiKey || !defaultModel) {
    return NextResponse.json({ error: 'faltan campos' }, { status: 400 });
  }

  const normalizedBase = normalizeBaseUrl(baseUrl);
  if (normalizedBase === false) {
    return NextResponse.json(
      { error: 'Base URL inválida: debe ser http:// o https:// (o dejarla vacía)' },
      { status: 400 }
    );
  }

  const apiKeyEnc = await encrypt(apiKey);

  const [provider] = await db.insert(aiProviders).values({
    name: name as any,
    api_key_enc: apiKeyEnc,
    base_url: normalizedBase,
    default_model: defaultModel,
    fallback_order: fallbackOrder ?? 0,
    is_active: false,
  }).returning();

  const { api_key_enc, ...safe } = provider;
  return NextResponse.json(safe, { status: 201 });
}

// PUT /api/admin/providers
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const body = await req.json();
  const { id, name, apiKey, baseUrl, defaultModel, fallbackOrder, isActive } = body;

  const updates: any = { updated_at: new Date() };
  if (name !== undefined) updates.name = name;
  if (apiKey) updates.api_key_enc = await encrypt(apiKey);
  if (baseUrl !== undefined) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (normalized === false) {
      return NextResponse.json(
        { error: 'Base URL inválida: debe ser http:// o https:// (o dejarla vacía)' },
        { status: 400 }
      );
    }
    updates.base_url = normalized;
  }
  if (defaultModel !== undefined) updates.default_model = defaultModel;
  if (fallbackOrder !== undefined) updates.fallback_order = fallbackOrder;
  if (isActive !== undefined) updates.is_active = isActive;

  const [row] = await db.update(aiProviders).set(updates).where(eq(aiProviders.id, id as any)).returning();
  const { api_key_enc, ...safe } = row;
  return NextResponse.json(safe);
}

// DELETE /api/admin/providers
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db.delete(aiProviders).where(eq(aiProviders.id, id as any));
  return new NextResponse(null, { status: 204 });
}
