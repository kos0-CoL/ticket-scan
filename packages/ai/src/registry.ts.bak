import { generateObject } from 'ai';
import { getProvider, getFallbackOrder } from './providers';
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
        model: p.model(p.apiKey),
        prompt: EXTRACTION_PROMPT,
        images: [{ url: imageUrl }],
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

import { z } from "zod";
const ExtractedTicketSchema = z.object({
  comercio: z.string(),
  fecha: z.string(),
  hora: z.string().optional(),
  total: z.number(),
  metodo_pago: z.string().optional(),
  items: z.array(z.object({
    nombre: z.string(),
    cantidad: z.number(),
    precio_unitario: z.number(),
    precio_total: z.number(),
    categoria: z.string().optional(),
    marca: z.string().optional(),
  })).optional().default([]),
});