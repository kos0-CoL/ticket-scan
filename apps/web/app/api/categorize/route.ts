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
  const { ticket_id, items } = body;

  if (!ticket_id || !items || !Array.isArray(items)) {
    return NextResponse.json({ ok: false, error: 'ticket_id e items requeridos' }, { status: 400 });
  }

  const { data: providers, error: providerError } = await supabase
    .from('ml_providers')
    .select('*, ml_configs(*)')
    .eq('is_active', true)
    .order('fallback_order', { ascending: true })
    .limit(1);

  if (providerError || !providers || providers.length === 0) {
    return NextResponse.json({ ok: false, error: 'No hay proveedores IA configurados' }, { status: 500 });
  }

  const provider = providers[0];
  const config = provider.ml_configs?.[0];
  if (!config?.is_active) {
    return NextResponse.json({ ok: false, error: 'Proveedor sin configuración activa' }, { status: 500 });
  }

  try {
    const result = await callProviderCategorization(provider, config, items);
    const updates = result.data.map((categorizedItem: any, index: number) => ({
      ticket_id,
      nombre: items[index].nombre,
      cantidad: items[index].cantidad,
      precio: items[index].precio,
      categoria: categorizedItem.categoria,
      subcategoria: categorizedItem.subcategoria,
    }));

    const { error: insertError } = await supabase
      .from('ticket_items')
      .upsert(updates, { onConflict: 'ticket_id,nombre' });

    if (insertError) {
      console.error('Error inserting categorized items:', insertError);
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    console.error('Categorization error:', err);
    return NextResponse.json({ ok: false, error: 'Error en categorización' }, { status: 500 });
  }
}

async function callProviderCategorization(provider: any, config: { max_tokens?: number; temperature?: number; model_id?: string }, items: any[]): Promise<{ ok: true; data: any }> {
  const apiKey = provider.api_key_encrypted;
  const model = config.model_id || provider.default_model;
  const baseUrl = getProviderBaseUrl(provider.name);
  const url = baseUrl + '/chat/completions';
  const prompt = getCategorizationPrompt(items);

  const headers = new Headers();
  headers.set('Authorization', 'Bearer ' + provider.api_key_encrypted);
  headers.set('Content-Type', 'application/json');

  const requestBody = {
    model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: config.max_tokens || 4096,
    temperature: config.temperature || 0.1,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('Provider error: ' + response.status);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty response from provider');
  }

  try {
    const parsed = JSON.parse(content);
    return { ok: true, data: parsed };
  } catch {
    const jsonRegex = /\{[\s\S]*\}/;
    const jsonMatch = content.match(jsonRegex);
    if (jsonMatch) {
      return { ok: true, data: JSON.parse(jsonMatch[0]) };
    }
    throw new Error('Invalid JSON response');
  }
}

function getProviderBaseUrl(providerName: string): string {
  const urls: Record<string, string> = {
    'OpenRouter': 'https://openrouter.ai/api/v1',
    'OpenAI': 'https://api.openai.com/v1',
    'Anthropic': 'https://api.anthropic.com/v1',
  };
  return urls[providerName] || 'https://openrouter.ai/api/v1';
}

function getCategorizationPrompt(items: any[]): string {
  const validCategories = ['almacen', 'frescos', 'lacteos', 'bebidas', 'limpieza', 'congelados', 'carnes', 'frutas_y_verduras', 'panaderia', 'otros'];
  const itemsText = items.map((item, i) => i + 1 + '. ' + item.nombre + ' (' + item.cantidad + ' x $' + item.precio + ')').join('\n');
  
  return 'Categoriza cada item de esta lista de productos de supermercado en una de estas categorías válidas:\n' + validCategories.join(', ') + '\n\nItems a categorizar:\n' + itemsText + '\n\nResponde SOLO con un array JSON con este formato:\n[\n  {"nombre": "nombre del producto", "categoria": "categoria_valida", "subcategoria": "opcional"}\n]';
}