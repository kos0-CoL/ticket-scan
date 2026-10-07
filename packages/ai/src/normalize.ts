import { db } from '@ticketscan/db';
import { productos, normalizacionLog } from '@ticketscan/db/schema';
import type { NormalizationResult, NormalizationMethod } from '@ticketscan/types';

export async function normalizeProduct(
  rawName: string,
): Promise<NormalizationResult> {
  // 1. Reglas simples
  const ruleResult = applyRules(rawName);
  if (ruleResult) return ruleResult;

  // 2. Fuzzy match contra productos existentes
  const fuzzyResult = await fuzzyMatch(rawName);
  if (fuzzyResult) {
    await logNormalization(rawName, fuzzyResult, 'fuzzy');
    return fuzzyResult;
  }

  // 3. IA
  const iaResult = await classifyWithIA(rawName);
  await logNormalization(rawName, iaResult, 'ia');
  return iaResult;
}

function applyRules(name: string): NormalizationResult | null {
  const lower = name.toLowerCase();
  if (lower.includes('leche')) return { nombre_normalizado: 'Leche', categoria: 'Lacteos', marca: null, unidad: 'unidad', confianza: 0.9, metodo: 'regla' };
  if (lower.includes('pan')) return { nombre_normalizado: 'Pan', categoria: 'Panaderia', marca: null, unidad: 'unidad', confianza: 0.9, metodo: 'regla' };
  if (lower.includes('agua')) return { nombre_normalizado: 'Agua', categoria: 'Bebidas', marca: null, unidad: 'litro', confianza: 0.9, metodo: 'regla' };
  return null;
}

async function fuzzyMatch(name: string) {
  const products = await db.select().from(productos);
  const lower = name.toLowerCase();
  for (const p of products) {
    if (lower.includes(p.nombre_normalizado.toLowerCase().slice(0, 4))) {
      return { nombre_normalizado: p.nombre_normalizado, categoria: p.categoria, marca: p.marca, unidad: p.unidad, confianza: 0.7, metodo: 'fuzzy' as NormalizationMethod };
    }
  }
  return null;
}

async function classifyWithIA(name: string): Promise<NormalizationResult> {
  return { nombre_normalizado: name, categoria: 'Otros', marca: null, unidad: 'unidad', confianza: 0.5, metodo: 'ia' };
}

async function logNormalization(raw: string, normalized: NormalizationResult, method: NormalizationMethod) {
  await db.insert(normalizacionLog).values({
    nombre_raw: raw,
    nombre_normalizado: normalized.nombre_normalizado,
    categoria_asignada: normalized.categoria,
    metodo: method,
    confianza: normalized.confianza,
    status: 'pending' as 'pending',
  });
}
