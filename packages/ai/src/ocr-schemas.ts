import { z } from 'zod';

export const OCRItemSchema = z.object({
  nombre: z.string().min(1),
  cantidad: z.number().positive(),
  precio: z.number().nonnegative(),
  categoria: z.string().min(1),
  subcategoria: z.string().optional(),
});

export const OCRResponseSchema = z.object({
  comercio: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  total: z.number().nonnegative(),
  items: z.array(OCRItemSchema).min(1),
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'transferencia']).optional(),
  sucursal: z.string().optional(),
});

export const OCRRequestSchema = z.object({
  image_base64: z.string().min(1, 'Image is required'),
  provider_id: z.string().uuid().optional(),
});

export const ProviderConfigSchema = z.object({
  max_tokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  model_id: z.string().optional(),
});

export type OCRItem = z.infer<typeof OCRItemSchema>;
export type OCRResponse = z.infer<typeof OCRResponseSchema>;
export type OCRRequest = z.infer<typeof OCRRequestSchema>;
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'google/gemini-1.5-pro': { input: 3.5, output: 10.5 },
  'google/gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'openai/gpt-4o': { input: 5, output: 15 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'anthropic/claude-3.5-sonnet': { input: 3, output: 15 },
  'meta-llama/llama-3.1-405b-instruct': { input: 2.7, output: 2.7 },
  'google/gemma-2-27b-it': { input: 0.15, output: 0.6 },
  'mistralai/mistral-large-2': { input: 2, output: 6 },
};

export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) {
    return 0;
  }
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}