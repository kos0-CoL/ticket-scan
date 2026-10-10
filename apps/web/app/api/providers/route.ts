import { NextResponse } from 'next/server';

export async function GET() {
  const providers = [
    { id: 'openrouter', name: 'OpenRouter', models: [
      { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', context_length: 2000000, pricing: { input: 3.5, output: 10.5 } },
      { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', context_length: 1000000, pricing: { input: 0.075, output: 0.3 } },
      { id: 'openai/gpt-4o', name: 'GPT-4o', context_length: 128000, pricing: { input: 5, output: 15 } },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', context_length: 128000, pricing: { input: 0.15, output: 0.6 } },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', context_length: 200000, pricing: { input: 3, output: 15 } },
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', context_length: 131072, pricing: { input: 2.7, output: 2.7 } },
    ]},
    { id: 'openai', name: 'OpenAI', models: [
      { id: 'gpt-4o', name: 'GPT-4o', context_length: 128000, pricing: { input: 5, output: 15 } },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', context_length: 128000, pricing: { input: 0.15, output: 0.6 } },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', context_length: 128000, pricing: { input: 10, output: 30 } },
    ]},
    { id: 'anthropic', name: 'Anthropic', models: [
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', context_length: 200000, pricing: { input: 3, output: 15 } },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', context_length: 200000, pricing: { input: 0.8, output: 4 } },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', context_length: 200000, pricing: { input: 15, output: 75 } },
    ]},
  ];

  return NextResponse.json({ ok: true, providers });
}

export async function POST(request: Request) {
  const body = await request.json();
  // In production, save to DB
  return NextResponse.json({ ok: true, provider: { id: Date.now().toString(), ...body } });
}