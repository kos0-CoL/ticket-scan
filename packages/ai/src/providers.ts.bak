import { db } from '@ticketscan/db';
import { aiProviders, appConfig } from '@ticketscan/db/schema';
import { eq } from 'drizzle-orm';
import { Google } from '@ai-sdk/google';
import { OpenAI } from '@ai-sdk/openai';
import { decrypt } from './crypto';

export interface ProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string | null;
  defaultModel: string;
  fallbackOrder: number;
}

export async function getActiveProvider(): Promise<ProviderConfig> {
  const config = await db.select().from(appConfig).where(eq(appConfig.key, 'ai_provider_active')).limit(1);
  if (!config.length) throw new Error('No active AI provider configured');

  const providerId = config[0].value.provider_id as string;
  const [row] = await db.select().from(aiProviders).where(eq(aiProviders.id, providerId as any));
  if (!row) throw new Error('Active provider not found in ai_providers');
  if (!row.is_active) throw new Error('Active provider is not active');

  return {
    id: row.id,
    name: row.name,
    apiKey: decrypt(row.api_key_enc),
    baseUrl: row.base_url,
    defaultModel: row.default_model,
    fallbackOrder: row.fallback_order,
  };
}

export async function getFallbackOrder(): Promise<ProviderConfig[]> {
  const all = await db.select().from(aiProviders).where(eq(aiProviders.is_active, true)).orderBy(aiProviders.fallback_order);
  return all.map(r => ({
    id: r.id,
    name: r.name,
    apiKey: decrypt(r.api_key_enc),
    baseUrl: r.base_url,
    defaultModel: r.default_model,
    fallbackOrder: r.fallback_order,
  }));
}

export function modelFor(provider: ProviderConfig) {
  switch (provider.name) {
    case 'gemini':
      return new Google({ apiKey: provider.apiKey, baseURL: provider.baseUrl ?? undefined });
    case 'openai':
      return new OpenAI({ apiKey: provider.apiKey, baseURL: provider.baseUrl ?? undefined });
    default:
      throw new Error('Unknown provider: ' + provider.name);
  }
}
