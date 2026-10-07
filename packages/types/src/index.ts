'use client' as const; // no-op
// Tipos compartidos TicketScan

export type TicketType = 'compra' | 'devolucion';
export type TicketSource = 'foto_multiple' | 'importado' | 'qr';
export type NormalizationMethod = 'regla' | 'fuzzy' | 'ia' | 'manual';
export type NormalizationStatus = 'pending' | 'approved' | 'rejected';
export type AIProviderName = 'gemini' | 'openai' | 'anthropic';

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  icono: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  nombre_normalizado: string;
  nombre_original: string;
  categoria: string;
  marca: string | null;
  unidad: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketItem {
  id: string;
  ticket_id: string;
  producto_id: string | null;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  descuento: number | null;
}

export interface Ticket {
  id: string;
  user_id: string;
  fecha: string;
  hora: string | null;
  comercio: string;
  sucursal: string | null;
  total: number;
  metodo_pago: string | null;
  tipo: TicketType;
  imagen_url: string | null;
  fuente: TicketSource;
  created_at: string;
}

export interface NormalizationLog {
  id: string;
  nombre_raw: string;
  nombre_normalizado: string;
  categoria_asignada: string | null;
  metodo: NormalizationMethod;
  confianza: number | null;
  status: NormalizationStatus;
  created_at: string;
}

export interface AIProvider {
  id: string;
  name: AIProviderName;
  api_key_enc: string;
  base_url: string | null;
  default_model: string;
  fallback_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppConfig {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface ExtractedTicket {
  comercio: string;
  fecha: string;
  hora?: string;
  total: number;
  metodo_pago?: string;
  items: ExtractedItem[];
}

export interface ExtractedItem {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  categoria?: string;
  marca?: string;
}

export interface NormalizationResult {
  nombre_normalizado: string;
  categoria: string;
  marca: string | null;
  unidad: string | null;
  confianza: number;
  metodo: NormalizationMethod;
}
