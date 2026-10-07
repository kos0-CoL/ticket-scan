import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { aiProviders, eq } from '@ticketscan/db/schema';
import { decrypt } from '@ticketscan/ai/crypto';
import { Google } from '@ai-sdk/google';
import { OpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const [row] = await db.select().from(aiProviders).where(eq(aiProviders.id, id as any));
  if (!row) return NextResponse.json({ error: 'provider not found' }, { status: 404 });

  try {
    const apiKey = await decrypt(row.api_key_enc);
    let result;

    switch (row.name) {
      case 'gemini': {
        const model = new Google({ apiKey, baseURL: row.base_url ?? undefined });
        result = await generateText({ model, prompt: 'Respón "ok" si puedes leer esto.' });
        break;
      }
      case 'openai': {
        const model = new OpenAI({ apiKey, baseURL: row.base_url ?? undefined });
        result = await generateText({ model, prompt: 'Respón "ok" si puedes leer esto.' });
        break;
      }
      default:
        return NextResponse.json({ error: 'proveedor no soportado para test' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, name: row.name, model: row.default_model, response: result.text?.slice(0, 50) });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
