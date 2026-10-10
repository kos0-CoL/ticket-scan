import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { image_base64, provider_id } = body;

  if (!image_base64) {
    return NextResponse.json({ ok: false, error: 'Imagen requerida' }, { status: 400 });
  }

  // Get active provider config
  let providerQuery = supabase
    .from('ml_providers')
    .select('*, ml_configs(*)')
    .eq('is_active', true)
    .order('fallback_order', { ascending: true });

  if (provider_id) {
    providerQuery = providerQuery.eq('id', provider_id);
  }

  const { data: providers, error: providerError } = await providerQuery;

  if (providerError || !providers || providers.length === 0) {
    return NextResponse.json({ ok: false, error: 'No hay proveedores IA configurados' }, { status: 500 });
  }

  // Try each provider in fallback order
  for (const provider of providers) {
    const config = provider.ml_configs?.[0];
    if (!config?.is_active) continue;

    try {
      const result = await callProviderOCR(provider, config, image_base64);
      if (result.ok) {
        return NextResponse.json({ ok: true, data: result.data, provider: provider.name });
      }
    } catch (err) {
      console.error(`OCR error with ${provider.name}:`, err);
      continue; // Try next provider
    }
  }

  return NextResponse.json({ ok: false, error: 'Todos los proveedores fallaron' }, { status: 500 });
}

async function callProviderOCR(provider: any, config: { max_tokens?: number; temperature?: number; model_id?: string }, imageBase64: string) {
  const apiKey = provider.api_key_encrypted; // TODO: decrypt
  const model = config.model_id || provider.default_model;
  const baseUrl = getProviderBaseUrl(provider.name);

  // Mock response for testing
  return { ok: true, data: { comercio: 'Test', total: 100 } };
}

function getProviderBaseUrl(providerName: string): string {
  const urls: Record<string, string> = {
    'OpenRouter': 'https://openrouter.ai/api/v1',
    'OpenAI': 'https://api.openai.com/v1',
    'Anthropic': 'https://api.anthropic.com/v1',
  };
  return urls[providerName] || 'https://openrouter.ai/api/v1';
}

function getOCRPrompt(): string {
  return 'Analiza este ticket de supermercado y extrae la información en formato JSON:\n{\n  "comercio": "nombre del comercio",\n  "fecha": "YYYY-MM-DD",\n  "hora": "HH:MM",\n  "total": 123.45,\n  "items": [\n    {"nombre": "producto", "cantidad": 1, "precio": 10.50, "categoria": "almacen"}\n  ],\n  "metodo_pago": "efectivo|tarjeta|transferencia",\n  "sucursal": "nombre sucursal si visible"\n}';
}