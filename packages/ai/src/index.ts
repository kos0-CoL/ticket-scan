import { OpenAI } from 'openai';
import { z } from 'zod';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  pricing: {
    input: number;
    output: number;
  };
  capabilities?: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatMessageContent[];
}

export interface ChatMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

function convertToOpenAIMessage(message: ChatMessage): ChatCompletionMessageParam {
  if (typeof message.content === 'string') {
    return { role: message.role, content: message.content };
  }
  // Only user messages can have array content (for vision)
  if (message.role !== 'user') {
    return { role: message.role, content: message.content.map((p) => (p.type === 'text' ? p.text : '')).join('') };
  }
  return {
    role: 'user',
    content: message.content.map((part) => {
      if (part.type === 'text') {
        return { type: 'text' as const, text: part.text || '' };
      }
      return { type: 'image_url' as const, image_url: { url: part.image_url!.url } };
    }),
  };
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  response_format?: { type: 'json_object' } | { type: 'text' };
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

class OpenRouterClient {
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = 'google/gemini-1.5-flash') {
    this.client = new OpenAI({
      baseURL: OPENROUTER_API_URL,
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://ticket-ar.netlify.app',
        'X-Title': 'TicketScan',
      },
    });
    this.defaultModel = defaultModel;
  }

  async listModels(): Promise<AIModel[]> {
    try {
      const response = await this.client.models.list();
      return response.data.map((model) => ({
        id: model.id,
        name: model.id,
        provider: model.owned_by || 'unknown',
        context_length: 4096,
        pricing: { input: 0, output: 0 },
      }));
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const model = options.model || this.defaultModel;
    const messages = options.messages.map(convertToOpenAIMessage) as ChatCompletionMessageParam[];
    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.max_tokens ?? 4096,
      top_p: options.top_p ?? 1,
      frequency_penalty: options.frequency_penalty ?? 0,
      presence_penalty: options.presence_penalty ?? 0,
      stream: options.stream ?? false,
      response_format: options.response_format,
    });

    return response as unknown as ChatCompletionResponse;
  }

  async chatCompletionStream(
    options: ChatCompletionOptions,
    onChunk: (chunk: string) => void
  ): Promise<ChatCompletionResponse> {
    const model = options.model || this.defaultModel;
    const messages = options.messages.map(convertToOpenAIMessage) as ChatCompletionMessageParam[];
    const stream = await this.client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.max_tokens ?? 4096,
      top_p: options.top_p ?? 1,
      stream: true,
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        onChunk(content);
      }
    }

    return {
      id: '',
      choices: [{ index: 0, message: { role: 'assistant', content: fullContent }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      model: options.model || this.defaultModel,
    };
  }

  async createEmbedding(text: string | string[], model = 'text-embedding-3-small'): Promise<EmbeddingResponse> {
    const response = await this.client.embeddings.create({
      model,
      input: text,
    });
    return response as unknown as EmbeddingResponse;
  }

  async structuredOutput<T extends z.ZodType>(
    schema: T,
    messages: ChatMessage[],
    model?: string
  ): Promise<z.infer<T>> {
    const response = await this.chatCompletion({
      model: model || this.defaultModel,
      messages,
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return schema.parse(parsed);
  }
}

export function createOpenRouterClient(apiKey: string, defaultModel?: string): OpenRouterClient {
  return new OpenRouterClient(apiKey, defaultModel);
}

export function getDefaultModel(): string {
  return 'google/gemini-1.5-flash';
}

export function getAvailableModels(): AIModel[] {
  return [
    {
      id: 'google/gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'Google',
      context_length: 2000000,
      pricing: { input: 3.5, output: 10.5 },
      capabilities: ['vision', 'code', 'reasoning'],
    },
    {
      id: 'google/gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'Google',
      context_length: 1000000,
      pricing: { input: 0.075, output: 0.3 },
      capabilities: ['vision', 'code', 'reasoning'],
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      context_length: 128000,
      pricing: { input: 5, output: 15 },
      capabilities: ['vision', 'code', 'reasoning'],
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      context_length: 128000,
      pricing: { input: 0.15, output: 0.6 },
      capabilities: ['vision', 'code', 'reasoning'],
    },
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      context_length: 200000,
      pricing: { input: 3, output: 15 },
      capabilities: ['vision', 'code', 'reasoning'],
    },
    {
      id: 'meta-llama/llama-3.1-405b-instruct',
      name: 'Llama 3.1 405B',
      provider: 'Meta',
      context_length: 131072,
      pricing: { input: 2.7, output: 2.7 },
      capabilities: ['code', 'reasoning'],
    },
    {
      id: 'google/gemma-2-27b-it',
      name: 'Gemma 2 27B',
      provider: 'Google',
      context_length: 8192,
      pricing: { input: 0.15, output: 0.6 },
      capabilities: ['code', 'reasoning'],
    },
    {
      id: 'mistralai/mistral-large-2',
      name: 'Mistral Large 2',
      provider: 'Mistral',
      context_length: 128000,
      pricing: { input: 2, output: 6 },
      capabilities: ['code', 'reasoning'],
    },
  ];
}

export function getProviderBaseUrl(providerName: string): string {
  const urls: Record<string, string> = {
    'OpenRouter': 'https://openrouter.ai/api/v1',
    'OpenAI': 'https://api.openai.com/v1',
    'Anthropic': 'https://api.anthropic.com/v1',
  };
  return urls[providerName] || 'https://openrouter.ai/api/v1';
}

export function getOCRPrompt(): string {
  return 'Analiza este ticket de supermercado y extrae la información en formato JSON:\n{\n  "comercio": "nombre del comercio",\n  "fecha": "YYYY-MM-DD",\n  "hora": "HH:MM",\n  "total": 123.45,\n  "items": [\n    {"nombre": "producto", "cantidad": 1, "precio": 10.50, "categoria": "almacen"}\n  ],\n  "metodo_pago": "efectivo|tarjeta|transferencia",\n  "sucursal": "nombre sucursal si visible"\n}';
}

export function getCategorizationPrompt(items: any[]): string {
  const validCategories = ['almacen', 'frescos', 'lacteos', 'bebidas', 'limpieza', 'congelados', 'carnes', 'frutas_y_verduras', 'panaderia', 'otros'];
  const itemsText = items.map((item, i) => i + 1 + '. ' + item.nombre + ' (' + item.cantidad + ' x $' + item.precio + ')').join('\n');
  
  return 'Categoriza cada item de esta lista de productos de supermercado en una de estas categorías válidas:\n' + validCategories.join(', ') + '\n\nItems a categorizar:\n' + itemsText + '\n\nResponde SOLO con un array JSON con este formato:\n[\n  {"nombre": "nombre del producto", "categoria": "categoria_valida", "subcategoria": "opcional"}\n]';
}

export * from './ocr-schemas';
export * from './categorization';
