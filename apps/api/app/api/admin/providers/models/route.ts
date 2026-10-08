import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { aiProviders } from '@ticketscan/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@ticketscan/ai/crypto';

export interface ModelInfo {
  id: string;
  name: string;
  free: boolean;
}

// POST /api/admin/providers/models
// Body: { name, apiKey?, baseUrl? }
// Devuelve los modelos disponibles de un proveedor para el selector del admin.
// Si no viene apiKey, se usa la guardada en ai_providers (descifrada server-side,
// nunca se expone al frontend). OpenRouter funciona sin key (catálogo público).
async function listModels(name: string, apiKey?: string, baseUrl?: string | null): Promise<ModelInfo[]> {
  const timeout = AbortSignal.timeout(10_000);

  switch (name) {
    case 'openrouter': {
      // Catálogo público: https://openrouter.ai/api/v1/models
      const res = await fetch('https://openrouter.ai/api/v1/models', { signal: timeout });
      if (!res.ok) throw new Error(`OpenRouter respondió ${res.status}`);
      const json = await res.json();
      return (json.data ?? [])
        .map((m: any) => ({
          id: String(m.id),
          name: String(m.name ?? m.id),
          free:
            String(m.id).endsWith(':free') ||
            (Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0),
        }))
        .sort((a: ModelInfo, b: ModelInfo) => Number(b.free) - Number(a.free) || a.id.localeCompare(b.id));
    }

    case 'openai': {
      if (!apiKey) throw new Error('Falta la API key de OpenAI');
      const base = (baseUrl ?? '').replace(/\/$/, '') || 'https://api.openai.com/v1';
      const res = await fetch(`${base}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: timeout,
      });
      if (!res.ok) throw new Error(`OpenAI respondió ${res.status}`);
      const json = await res.json();
      return (json.data ?? [])
        .map((m: any) => ({ id: String(m.id), name: String(m.id), free: false }))
        .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));
    }

    case 'gemini': {
      if (!apiKey) throw new Error('Falta la API key de Gemini');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
        { signal: timeout }
      );
      if (!res.ok) throw new Error(`Gemini respondió ${res.status}`);
      const json = await res.json();
      return (json.models ?? [])
        .filter((m: any) => (m.supportedGenerationMethods ?? ['generateContent']).includes('generateContent'))
        .map((m: any) => ({
          id: String(m.name ?? '').replace(/^models\//, ''),
          name: String(m.displayName ?? m.name),
          // Gemini tiene free tier (con rate limits) para toda key válida
          free: true,
        }))
        .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));
    }

    case 'anthropic': {
      if (!apiKey) throw new Error('Falta la API key de Anthropic');
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        signal: timeout,
      });
      if (!res.ok) throw new Error(`Anthropic respondió ${res.status}`);
      const json = await res.json();
      return (json.data ?? [])
        .map((m: any) => ({ id: String(m.id), name: String(m.display_name ?? m.id), free: false }))
        .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));
    }

    default:
      throw new Error(`Proveedor no soportado para listar modelos: ${name}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, apiKey, baseUrl } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'name requerido' }, { status: 400 });
    }

    let key: string | undefined = apiKey || undefined;
    let base: string | null = baseUrl ?? null;
    if (!key || !base) {
      const [row] = await db
        .select()
        .from(aiProviders)
        .where(eq(aiProviders.name, name))
        .limit(1);
      if (row) {
        if (!key) key = await decrypt(row.api_key_enc);
        if (!base) base = row.base_url;
      }
    }

    const models = await listModels(name, key, base);
    return NextResponse.json(
      { ok: true, models },
      { headers: { 'Cache-Control': 'private, max-age=60' } }
    );
  } catch (e: any) {
    console.error('POST /api/admin/providers/models error:', e);
    return NextResponse.json({ ok: false, error: e?.message ?? 'Error al listar modelos' }, { status: 500 });
  }
}
