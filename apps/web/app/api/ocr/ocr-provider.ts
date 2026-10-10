import { z } from 'zod';
import { createOpenRouterClient, getOCRPrompt } from '@ticketscan/ai';
import { OCRResponseSchema, calculateCost, type OCRResponse } from '@ticketscan/ai';
import { logger, type LogContext } from '@ticketscan/utils';

export interface Provider {
  id: string;
  name: string;
  api_key_encrypted: string;
  default_model: string;
  fallback_order: number;
}

export interface ProviderConfig {
  max_tokens?: number;
  temperature?: number;
  model_id?: string;
}

export interface OCRResult {
  ok: boolean;
  data?: OCRResponse;
  error?: string;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  cost?: number;
  provider: string;
  model: string;
  attempt: number;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number): number {
  return BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 100;
}

function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    'network',
    'timeout',
    'ECONNREFUSED',
    'ETIMEDOUT',
    '429',
    '500',
    '502',
    '503',
    '504',
  ];
  const message = error.message.toLowerCase();
  return retryablePatterns.some((pattern) => message.includes(pattern.toLowerCase()));
}

async function callProviderWithRetry(
  provider: Provider,
  config: ProviderConfig,
  imageBase64: string,
  context: LogContext
): Promise<OCRResult> {
  const client = createOpenRouterClient(provider.api_key_encrypted, config.model_id || provider.default_model);
  const model = config.model_id || provider.default_model;
  const maxAttempts = MAX_RETRIES;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptContext: LogContext = {
      ...context,
      provider: provider.name,
      model,
      attempt,
      maxAttempts,
    };

    logger.logProviderAttempt(attemptContext);

    try {
      const startTime = Date.now();
      const response = await client.chatCompletion({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: getOCRPrompt() },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ] as const,
          },
        ],
        max_tokens: config.max_tokens || 4096,
        temperature: config.temperature || 0.1,
        response_format: { type: 'json_object' },
      });

      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content;
      const contentString = typeof content === 'string' ? content : '';

      if (!contentString) {
        throw new Error('Empty response from provider');
      }

      let parsed: OCRResponse;
      try {
        parsed = JSON.parse(contentString);
      } catch {
        const jsonRegex = /\{[\s\S]*\}/;
        const jsonMatch = contentString.match(jsonRegex);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response');
        }
      }

      const validated = OCRResponseSchema.parse(parsed);

      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      const totalTokens = response.usage?.total_tokens || inputTokens + outputTokens;
      const cost = calculateCost(model, inputTokens, outputTokens);

      const result: OCRResult = {
        ok: true,
        data: validated,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
        cost,
        provider: provider.name,
        model,
        attempt,
      };

      logger.logProviderSuccess({
        ...attemptContext,
        durationMs,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
      });

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      logger.logError(attemptContext, lastError);

      if (attempt < maxAttempts && isRetryableError(lastError)) {
        const delay = calculateBackoff(attempt);
        logger.warn('Retrying OCR provider after delay', { ...attemptContext, delayMs: delay });
        await sleep(delay);
        continue;
      }

      break;
    }
  }

  const errorResult: OCRResult = {
    ok: false,
    error: lastError?.message || 'Unknown error',
    provider: provider.name,
    model,
    attempt: maxAttempts,
  };

  logger.logProviderFailure({
    ...context,
    provider: provider.name,
    model,
    error: errorResult.error,
    attempt: maxAttempts,
  });

  return errorResult;
}

export async function callProviderOCR(
  provider: Provider,
  config: ProviderConfig,
  imageBase64: string,
  context: LogContext = {}
): Promise<OCRResult> {
  return callProviderWithRetry(provider, config, imageBase64, context);
}