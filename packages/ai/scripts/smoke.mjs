// Smoke test del call real que usa extractTicket() en src/registry.ts:
// generateObject({ model, messages: [texto + imagen URL], schema }).
// Usa un modelo mock (LanguageModelV1) y stub de fetch para no depender de red/DB.
// Ejecutar: pnpm --filter @ticketscan/ai test
import { generateObject } from 'ai';
import { ExtractedTicketSchema } from '../src/schema.ts';

const EXTRACTION_PROMPT = 'Extrae los datos del ticket (prompt de prueba)';
const IMAGE_URL = 'https://tickets.example.com/ticket-abc.jpg';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`ok: ${msg}`);
}

// --- stub de fetch: descarga de la imagen de ejemplo (path que usa Gemini) ---
const fetchCalls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  fetchCalls.push(url);
  if (url.startsWith('https://tickets.example.com/')) {
    return new Response(PNG_1X1, { status: 200, headers: { 'content-type': 'image/png' } });
  }
  return realFetch(input, init);
};

// --- modelo mock (LanguageModelV1, lo que devuelve modelFor()) ---
let nextText = '';
let capturedPrompt = null;
const mockModel = {
  specificationVersion: 'v1',
  provider: 'mock',
  modelId: 'mock-model',
  defaultObjectGenerationMode: 'json',
  supportsImageUrls: false, // como Gemini: el SDK debe descargar la URL antes de llamar
  async doGenerate(options) {
    capturedPrompt = options.prompt;
    return {
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: 'stop',
      usage: { promptTokens: 100, completionTokens: 100 },
      text: nextText,
    };
  },
};

const TICKET = {
  comercio: 'Carrefour',
  fecha: '2026-10-07',
  hora: '19:30',
  total: 12345.67,
  metodo_pago: 'Efectivo',
  items: [
    { nombre: 'Leche Entera', cantidad: 2, precio_unitario: 1500, precio_total: 3000, categoria: 'Lacteos', marca: 'La Serenisima' },
  ],
};

async function main() {
  // 1. Misma forma de llamada que extractTicket()
  nextText = JSON.stringify(TICKET);
  const result = await generateObject({
    model: mockModel,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: EXTRACTION_PROMPT },
          { type: 'image', image: IMAGE_URL },
        ],
      },
    ],
    schema: ExtractedTicketSchema,
  });

  assert(result.object.comercio === 'Carrefour', 'objeto devuelto parseado por el schema');
  assert(result.object.total === 12345.67, 'total numerico');
  assert(result.object.items.length === 1 && result.object.items[0].marca === 'La Serenisima', 'items parseados');
  assert(fetchCalls.includes(IMAGE_URL), 'la URL de la imagen fue descargada por el SDK (path de Gemini)');

  const userMsg = capturedPrompt?.find((m) => m.role === 'user');
  const parts = Array.isArray(userMsg?.content) ? userMsg.content : [];
  const textPart = parts.find((p) => p.type === 'text');
  const imagePart = parts.find((p) => p.type === 'image');
  assert(textPart?.text.includes(EXTRACTION_PROMPT), 'prompt presente en el mensaje al modelo');
  assert(imagePart?.image instanceof Uint8Array, 'imagen entregada al modelo como bytes descargados');

  // 2. items opcional -> default []
  nextText = JSON.stringify({ comercio: 'Minimax', fecha: '2026-10-07', total: 100 });
  const r2 = await generateObject({
    model: mockModel,
    messages: [{ role: 'user', content: [{ type: 'text', text: EXTRACTION_PROMPT }] }],
    schema: ExtractedTicketSchema,
  });
  assert(Array.isArray(r2.object.items) && r2.object.items.length === 0, 'items aplica default []');

  console.log('SMOKE TEST OK');
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
