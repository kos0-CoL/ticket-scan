import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { aiProviders, eq } from '@ticketscan/db/schema';
import { decrypt } from '@ticketscan/ai/crypto';
import { modelFor } from '@ticketscan/ai';
import { generateText } from 'ai';
import { requireAdmin, isAdminResponse } from '../../../../../lib/admin-auth';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const [row] = await db.select().from(aiProviders).where(eq(aiProviders.id, id as any));
  if (!row) return NextResponse.json({ error: 'provider not found' }, { status: 404 });

  try {
    const apiKey = await decrypt(row.api_key_enc);
    const providerConfig = {
      id: row.id,
      name: row.name,
      apiKey,
      baseUrl: row.base_url?.trim() || null,
      defaultModel: row.default_model,
      fallbackOrder: row.fallback_order,
    };
    const model = modelFor(providerConfig);
    const result = await generateText({ model, prompt: 'Respón "ok" si puedes leer esto.' });

    return NextResponse.json({ ok: true, name: row.name, model: row.default_model, response: result.text?.slice(0, 50) });
  } catch (err: any) {
    // Superficie el error real del proveedor: el wrapper del AI SDK
    // ("Provider returned error") no dice nada útil para diagnosticar.
    // El error real vive en la cadena .cause / .errors (APICallError con
    // statusCode + responseBody).
    const chain: any[] = [];
    const walk = (e: any, depth = 0) => {
      if (!e || chain.length > 20 || depth > 6) return;
      chain.push(e);
      if (Array.isArray(e.errors)) e.errors.forEach((x: any) => walk(x, depth + 1));
      if (e.cause) walk(e.cause, depth + 1);
    };
    walk(err);

    const parts: string[] = [];
    for (const e of chain) {
      if (e?.statusCode && !parts.some((p) => p.includes(`HTTP ${e.statusCode}`))) {
        parts.push(`HTTP ${e.statusCode}`);
      }
      if (e?.responseBody && !parts.some((p) => p.includes(String(e.responseBody).slice(0, 80)))) {
        parts.push(String(e.responseBody).slice(0, 400));
      }
    }
    parts.push(err?.message ?? 'Error desconocido');
    return NextResponse.json(
      { ok: false, error: parts.join(' | ').slice(0, 900) || 'Error desconocido' },
      { status: 500 }
    );
  }
}