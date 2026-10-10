import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { callProviderOCR, type Provider, type ProviderConfig } from './ocr-provider';
import { OCRRequestSchema, OCRResponseSchema, type OCRRequest, type OCRResponse } from '@ticketscan/ai';
import { logger, type LogContext, createRequestContext } from '@ticketscan/utils';
import { ocrUsage } from '@ticketscan/db';
import { db } from '@ticketscan/db';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const context = createRequestContext(request);
  
  logger.logRequest(request, context);

  try {
    // Authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized OCR request', { ...context, error: authError?.message });
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
    }
    context.userId = user.id;

    // Validate request body
    let body: OCRRequest;
    try {
      const json = await request.json();
      body = OCRRequestSchema.parse(json);
    } catch (error) {
      logger.error('Invalid OCR request body', { ...context, error: error instanceof Error ? error.message : 'Validation error' });
      return NextResponse.json({ ok: false, error: 'Cuerpo de solicitud inválido' }, { status: 400 });
    }

    const { image_base64, provider_id } = body;

    // Fetch providers ordered by fallback_order
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
      logger.error('No AI providers configured', { ...context, error: providerError?.message });
      return NextResponse.json({ ok: false, error: 'No hay proveedores IA configurados' }, { status: 500 });
    }

    logger.info('Providers loaded for OCR', { ...context, providerCount: providers.length });

    let lastError: string | undefined;
    let successfulResult: { data: OCRResponse; provider: string; feedbackId: string | null; tokensUsed: any; cost: number } | null = null;

    // Try each provider in fallback order
    for (const provider of providers) {
      const config = provider.ml_configs?.[0];
      if (!config?.is_active) {
        logger.debug('Skipping inactive provider config', { ...context, provider: provider.name });
        continue;
      }

      const providerConfig: ProviderConfig = {
        max_tokens: config.max_tokens || 4096,
        temperature: config.temperature || 0.1,
        model_id: config.model_id || provider.default_model,
      };

      const providerContext: LogContext = {
        ...context,
        provider: provider.name,
        model: providerConfig.model_id || provider.default_model,
      };

      try {
        const result = await callProviderOCR(provider as Provider, providerConfig, image_base64, providerContext);

        if (result.ok && result.data) {
          // Validate response with Zod
          let validatedData: OCRResponse;
          try {
            validatedData = OCRResponseSchema.parse(result.data);
          } catch (validationError) {
            logger.warn('OCR response validation failed', {
              ...providerContext,
              error: validationError instanceof Error ? validationError.message : 'Validation error',
              rawData: result.data,
            });
            // Continue with raw data if validation fails but log it
            validatedData = result.data as OCRResponse;
          }

          // Save feedback image
          const { data: ocrResult, error: feedbackError } = await supabase
            .from('feedback_images')
            .insert({
              user_id: user.id,
              image_url: `data:image/jpeg;base64,${image_base64}`,
              ocr_result: validatedData,
              selected_for_training: false,
            })
            .select()
            .single();

          if (feedbackError) {
            logger.error('Failed to save feedback image', { ...providerContext, error: feedbackError.message });
          }

          successfulResult = {
            data: validatedData,
            provider: provider.name,
            feedbackId: ocrResult?.id || null,
            tokensUsed: result.tokensUsed,
            cost: result.cost || 0,
          };

          // Log cost tracking
          if (result.tokensUsed && result.cost) {
            logger.logCost(providerContext, result.cost);
            
            // Persist cost tracking to database
            try {
              await db.insert(ocrUsage).values({
                userId: user.id,
                providerName: provider.name,
                modelId: result.model,
                inputTokens: result.tokensUsed.input,
                outputTokens: result.tokensUsed.output,
                totalTokens: result.tokensUsed.total,
                costUsd: result.cost.toString(),
                status: 'success',
                requestId: context.requestId,
              });
            } catch (dbError) {
              logger.error('Failed to save OCR usage', { ...providerContext, error: dbError instanceof Error ? dbError.message : 'DB error' });
            }
          }

          logger.logProviderSuccess({ ...providerContext, durationMs: Date.now() - startTime });
          break;
        } else {
          lastError = result.error;
          logger.logProviderFailure({ ...providerContext, error: result.error, attempt: result.attempt });
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Error desconocido';
        logger.error('OCR provider error', { ...providerContext, error: lastError });
        
        // Persist error to database
        try {
          await db.insert(ocrUsage).values({
            userId: user.id,
            providerName: provider.name,
            modelId: providerConfig.model_id || provider.default_model,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            costUsd: '0',
            status: 'error',
            errorMessage: lastError,
            requestId: context.requestId,
          });
        } catch (dbError) {
          logger.error('Failed to save OCR error usage', { ...providerContext, error: dbError instanceof Error ? dbError.message : 'DB error' });
        }
        
        continue;
      }
    }

    const totalDuration = Date.now() - startTime;

    if (successfulResult) {
      logger.logResponse(context, 200, totalDuration);
      return NextResponse.json({
        ok: true,
        data: successfulResult.data,
        provider: successfulResult.provider,
        feedback_id: successfulResult.feedbackId,
        tokensUsed: successfulResult.tokensUsed,
        cost: successfulResult.cost,
      });
    }

    logger.error('All OCR providers failed', { ...context, lastError, durationMs: totalDuration });
    logger.logResponse(context, 500, totalDuration);
    return NextResponse.json({ ok: false, error: lastError || 'Todos los proveedores fallaron' }, { status: 500 });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    logger.logError(context, error);
    logger.logResponse(context, 500, totalDuration);
    return NextResponse.json({ ok: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}