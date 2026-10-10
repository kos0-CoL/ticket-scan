export async function callProviderOCR(provider: any, config: { max_tokens?: number; temperature?: number; model_id?: string }, imageBase64: string) {
  const apiKey = provider.api_key_encrypted;
  const baseUrl = getProviderBaseUrl(provider.name);
  const url = baseUrl + '/chat/completions';
  const prompt = getOCRPrompt();

  const headers = new Headers();
  headers.set('Authorization', 'Bearer ' + provider.api_key_encrypted);
  headers.set('Content-Type', 'application/json');

  const requestBody = {
    model: config.model_id || provider.default_model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: getOCRPrompt() },
          { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageBase64 } },
        ],
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

function getOCRPrompt(): string {
  return 'Analiza este ticket de supermercado y extrae la información en formato JSON:\n{\n  "comercio": "nombre del comercio",\n  "fecha": "YYYY-MM-DD",\n  "hora": "HH:MM",\n  "total": 123.45,\n  "items": [\n    {"nombre": "producto", "cantidad": 1, "precio": 10.50, "categoria": "almacen"}\n  ],\n  "metodo_pago": "efectivo|tarjeta|transferencia",\n  "sucursal": "nombre sucursal si visible"\n}';
}