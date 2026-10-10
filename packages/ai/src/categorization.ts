import { z } from 'zod';
import { createOpenRouterClient, getAvailableModels, type ChatMessage } from './index';

/**
 * Input validation schema for categorization request
 */
export const categorizeInputSchema = z.object({
  ticket_id: z.string().uuid(),
  items: z.array(
    z.object({
      nombre: z.string().min(1),
      cantidad: z.number().positive(),
      precio: z.number().nonnegative(),
    })
  ).min(1),
});

export type CategorizeInput = z.infer<typeof categorizeInputSchema>;

/**
 * Output validation schema for categorization response
 */
export const categorizedItemSchema = z.object({
  nombre: z.string().min(1),
  categoria: z.enum([
    'almacen',
    'frescos',
    'lacteos',
    'bebidas',
    'limpieza',
    'congelados',
    'carnes',
    'frutas_y_verduras',
    'panaderia',
    'otros',
  ]),
  subcategoria: z.string().optional(),
});

export const categorizeOutputSchema = z.array(categorizedItemSchema);

export type CategorizeOutput = z.infer<typeof categorizeOutputSchema>;

/**
 * Versioned prompt templates
 */
export interface CategorizationPromptVersion {
  version: string;
  systemPrompt: string;
  userPromptTemplate: (items: string[]) => string;
}

const validCategories = [
  'almacen',
  'frescos',
  'lacteos',
  'bebidas',
  'limpieza',
  'congelados',
  'carnes',
  'frutas_y_verduras',
  'panaderia',
  'otros',
] as const;

const categorizationPrompts: Record<string, CategorizationPromptVersion> = {
  'v1': {
    version: 'v1',
    systemPrompt: `Eres un experto en categorización de productos de supermercado. Tu tarea es asignar cada producto a una categoría válida de la lista proporcionada. Responde SOLO con un array JSON válido.`,
    userPromptTemplate: (items: string[]) => {
      const itemsText = items.join('\n');
      return `Categoriza cada item de esta lista de productos de supermercado en una de estas categorías válidas:\n${validCategories.join(', ')}\n\nItems a categorizar:\n${itemsText}\n\nResponde SOLO con un array JSON con este formato:\n[\n  {"nombre": "nombre del producto", "categoria": "categoria_valida", "subcategoria": "opcional"}\n]`;
    },
  },
  'v2': {
    version: 'v2',
    systemPrompt: `Eres un sistema de categorización de tickets de supermercado de alta precisión. Analiza cada producto y asígnale la categoría más apropiada. Considera el nombre, cantidad y precio para desambiguar. Responde EXCLUSIVAMENTE con un array JSON válido sin texto adicional.`,
    userPromptTemplate: (items: string[]) => {
      const itemsText = items.join('\n');
      return `CATEGORIZACIÓN DE PRODUCTOS DE SUPERMERCADO\n\nCategorías válidas (usa EXACTAMENTE estos valores):\n${validCategories.join(', ')}\n\nProductos a categorizar:\n${itemsText}\n\nInstrucciones:\n1. Asigna cada producto a UNA categoría de la lista\n2. El campo "subcategoria" es opcional y debe ser específico (ej: "leche_entera", "pan_integral")\n3. Si no estás seguro, usa "otros"\n4. Responde SOLO con el array JSON, sin markdown, sin explicaciones\n\nFormato de respuesta:\n[\n  {"nombre": "string", "categoria": "categoria_valida", "subcategoria": "string?"}\n]`;
    },
  },
};

/**
 * Get prompt version by version string, fallback to v1
 */
export function getPromptVersion(version: string = 'v1'): CategorizationPromptVersion {
  return categorizationPrompts[version] || categorizationPrompts['v1'];
}

/**
 * List available prompt versions
 */
export function getAvailablePromptVersions(): string[] {
  return Object.keys(categorizationPrompts);
}

/**
 * Build messages for the LLM
 */
export function buildCategorizationMessages(
  items: Array<{ nombre: string; cantidad: number; precio: number }>,
  version: string = 'v1'
): ChatMessage[] {
  const prompt = getPromptVersion(version);
  const itemsText = items.map(
    (item, i) => `${i + 1}. ${item.nombre} (${item.cantidad} x $${item.precio})`
  );
  
  return [
    { role: 'system', content: prompt.systemPrompt },
    { role: 'user', content: prompt.userPromptTemplate(itemsText) },
  ];
}

/**
 * Cost tracking result
 */
export interface CostInfo {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
  model: string;
  provider: string;
}

/**
 * Calculate cost based on model pricing
 */
export function calculateCategorizationCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const models = getAvailableModels();
  const model = models.find((m) => m.id === modelId);
  
  if (!model) {
    // Default fallback pricing (per 1M tokens)
    return (inputTokens * 0.15 + outputTokens * 0.6) / 1_000_000;
  }
  
  const inputCost = (inputTokens / 1_000_000) * model.pricing.input;
  const outputCost = (outputTokens / 1_000_000) * model.pricing.output;
  return inputCost + outputCost;
}

/**
 * Structured logging helper
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  ticketId?: string;
  provider?: string;
  model?: string;
  version?: string;
  attempt?: number;
  latencyMs?: number;
  cost?: CostInfo;
  error?: string;
  itemCount?: number;
}

export function logCategorization(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: LogContext
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'categorization',
    message,
    ...context,
  };
  
  // In production, this would go to a proper logging service (Sentry, Datadog, etc.)
  // For now, structured console logging
  const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  consoleMethod(JSON.stringify(logEntry));
}

/**
 * Call categorization with provider fallback and cost tracking
 */
export interface CategorizationResult {
  ok: true;
  data: CategorizeOutput;
  cost: CostInfo;
  provider: string;
  model: string;
  version: string;
}

export interface CategorizationError {
  ok: false;
  error: string;
  provider: string;
  model: string;
  attempt: number;
}

export async function callCategorizationWithFallback(
  supabase: any,
  items: Array<{ nombre: string; cantidad: number; precio: number }>,
  requestId: string,
  userId: string,
  ticketId: string,
  preferredVersion?: string
): Promise<CategorizationResult> {
  // Fetch all active providers ordered by fallback_order
  const { data: providers, error: providerError } = await supabase
    .from('ml_providers')
    .select('*, ml_configs(*)')
    .eq('is_active', true)
    .order('fallback_order', { ascending: true });

  if (providerError || !providers || providers.length === 0) {
    throw new Error('No hay proveedores IA configurados');
  }

  const version = preferredVersion || 'v1';
  const messages = buildCategorizationMessages(items, version);
  
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < providers.length; attempt++) {
    const provider = providers[attempt];
    const config = provider.ml_configs?.[0];
    
    if (!config?.is_active) {
      logCategorization('warn', 'Provider config inactive, skipping', {
        requestId,
        provider: provider.name,
        attempt: attempt + 1,
      });
      continue;
    }

    const modelId = config.model_id || provider.default_model;
    const client = createOpenRouterClient(provider.api_key_encrypted, modelId);
    const startTime = Date.now();

    try {
      logCategorization('info', 'Attempting categorization', {
        requestId,
        userId,
        ticketId,
        provider: provider.name,
        model: modelId,
        version,
        attempt: attempt + 1,
      });

      const result = await client.structuredOutput(
        categorizeOutputSchema,
        messages,
        modelId
      );

      const latencyMs = Date.now() - startTime;
      const usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }; // structuredOutput doesn't return usage
      
      // Estimate tokens (rough approximation)
      const inputText = messages.map(m => m.content).join(' ');
      const outputText = JSON.stringify(result);
      const estimatedInputTokens = Math.ceil(inputText.length / 4);
      const estimatedOutputTokens = Math.ceil(outputText.length / 4);
      
      const cost = calculateCategorizationCost(modelId, estimatedInputTokens, estimatedOutputTokens);
      
      const costInfo: CostInfo = {
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
        totalTokens: estimatedInputTokens + estimatedOutputTokens,
        estimatedCostUSD: cost,
        model: modelId,
        provider: provider.name,
      };

      logCategorization('info', 'Categorization successful', {
        requestId,
        userId,
        ticketId,
        provider: provider.name,
        model: modelId,
        version,
        attempt: attempt + 1,
        latencyMs,
        cost: costInfo,
      });

      return {
        ok: true,
        data: result,
        cost: costInfo,
        provider: provider.name,
        model: modelId,
        version,
      };
    } catch (error) {
      lastError = error as Error;
      const latencyMs = Date.now() - startTime;
      
      logCategorization('warn', 'Categorization attempt failed, trying next provider', {
        requestId,
        userId,
        ticketId,
        provider: provider.name,
        model: modelId,
        version,
        attempt: attempt + 1,
        latencyMs,
        error: error instanceof Error ? error.message : String(error),
      });
      
      continue;
    }
  }

  // All providers failed
  logCategorization('error', 'All providers failed for categorization', {
    requestId,
    userId,
    ticketId,
    version,
    error: lastError?.message || 'Unknown error',
  });

  throw new Error(`Todos los proveedores fallaron: ${lastError?.message || 'Error desconocido'}`);
}