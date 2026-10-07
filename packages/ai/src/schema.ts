import { z } from "zod";

// Schema del ticket extraído por IA. Vive en su propio módulo (solo depende de zod)
// para que registry.ts y los tests puedan usarlo sin cargar la gráfica de DB.
export const ExtractedTicketSchema = z.object({
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
