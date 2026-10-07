import { generateObject } from 'ai';
import { getActiveProvider as getProvider, getFallbackOrder, modelFor } from './providers';
import { ExtractedTicketSchema } from './schema';
import type { ExtractedTicket } from '@ticketscan/types';

const EXTRACTION_PROMPT = `
Extrae los datos de un ticket de supermercado argentino.
Devuelve SOLO un objeto JSON válido con este formato:
{
  comercio: string,
  fecha: string (YYYY-MM-DD),
  hora?: string (HH:MM),
  total: number,
  metodo_pago?: string,
  items: [{
    nombre: string,
    cantidad: number,
    precio_unitario: number,
    precio_total: number,
    categoria?: string,
    marca?: string,
  }]
}
Reglas:
- "total" es el monto final pagado.
- Si un item tiene descuento, réstalo de precio_total.
- Nombres en español, normalizados (ej: "LECHE ENTERA" → "Leche Entera").
`;

export async function extractTicket(imageUrl: string): Promise<ExtractedTicket> {
  const provider = await getProvider();
  const fallback = await getFallbackOrder();

  const errors: Error[] = [];

  for (const p of [provider, ...fallback]) {
    try {
      const result = await generateObject({
        model: modelFor(p),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACTION_PROMPT },
              { type: "image", image: imageUrl },
            ],
          },
        ],
        schema: ExtractedTicketSchema,
      });
      return result.object;
    } catch (err) {
      errors.push(err as Error);
      continue;
    }
  }

  throw new Error(`Todos los proveedores fallaron: ${errors.map(e => e.message).join("; ")}`);
}

