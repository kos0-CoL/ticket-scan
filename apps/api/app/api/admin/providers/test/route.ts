import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { aiProviders, eq } from '@ticketscan/db/schema';
import { decrypt } from '@ticketscan/ai/crypto';
import { modelFor } from '@ticketscan/ai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}