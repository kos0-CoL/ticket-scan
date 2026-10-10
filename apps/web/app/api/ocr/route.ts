import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { callProviderOCR } from './ocr-provider';

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

  for (const provider of providers) {
    const config = provider.ml_configs?.[0];
    if (!config?.is_active) continue;

    try {
      const result = await callProviderOCR(provider, config, image_base64);
      if (result.ok) {
        const { data: ocrResult } = await supabase
          .from('feedback_images')
          .insert({
            user_id: user.id,
            image_url: 'data:image/jpeg;base64,' + image_base64,
            ocr_result: result.data,
            selected_for_training: false,
          })
          .select()
          .single();

        return NextResponse.json({ ok: true, data: result.data, provider: provider.name, feedback_id: ocrResult?.id });
      }
    } catch (err) {
      console.error('OCR error with ' + provider.name + ':', err);
      continue;
    }
  }

  return NextResponse.json({ ok: false, error: 'Todos los proveedores fallaron' }, { status: 500 });
}