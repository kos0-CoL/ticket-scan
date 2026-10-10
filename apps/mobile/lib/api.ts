// API Client para mobile app
import type { Column } from '@ticketscan/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ticket-ar.netlify.app';

export { type Column };

export interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  comercio: string;
  fecha: string;
  hora?: string;
  total: number;
  fuente: string;
  imagen_url?: string;
  sucursal?: string;
  metodo_pago?: string;
  status: string;
  ticket_items?: TicketItem[];
  created_at: string;
  updated_at: string;
}

export interface TicketItem {
  id: string;
  ticket_id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  categoria: string;
  subcategoria?: string;
  created_at: string;
}

export interface CreateTicketInput {
  comercio: string;
  fecha: string;
  hora?: string;
  total: number;
  fuente: string;
  imagen_url?: string;
  sucursal?: string;
  metodo_pago?: string;
  items?: CreateTicketItemInput[];
}

export interface CreateTicketItemInput {
  nombre: string;
  cantidad: number;
  precio: number;
  categoria: string;
  subcategoria?: string;
}

export interface AnalyticsData {
  currentMonth: { total: number; count: number; average: number };
  previousMonth: { total: number; count: number; average: number };
  monthlyTrend: MonthlySpending[];
  byCategory: CategorySpending[];
  topMerchants: TopMerchant[];
}

export interface MonthlySpending {
  month: string;
  total: number;
  count: number;
  average: number;
}

export interface CategorySpending {
  categoria: string;
  total: number;
  count: number;
  percentage: number;
}

export interface TopMerchant {
  comercio: string;
  total: number;
  count: number;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  return {
    'Content-Type': 'application/json',
  };
}

export async function getTickets(params?: {
  page?: number;
  limit?: number;
  comercio?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}): Promise<PaginatedResponse<Ticket>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.comercio) searchParams.set('comercio', params.comercio);
  if (params?.fecha_desde) searchParams.set('fecha_desde', params.fecha_desde);
  if (params?.fecha_hasta) searchParams.set('fecha_hasta', params.fecha_hasta);

  const response = await fetch(`${API_BASE}/api/tickets?${searchParams}`, {
    headers: await getAuthHeaders(),
    credentials: 'include',
  });

  return response.json();
}

export async function createTicket(input: CreateTicketInput): Promise<ApiResponse<{ id: string }>> {
  const response = await fetch(`${API_BASE}/api/tickets`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return response.json();
}

export async function getTicket(id: string): Promise<ApiResponse<Ticket>> {
  const response = await fetch(`${API_BASE}/api/tickets/${id}`, {
    headers: await getAuthHeaders(),
    credentials: 'include',
  });

  return response.json();
}

export async function deleteTicket(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE}/api/tickets/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
    credentials: 'include',
  });

  return response.json();
}

export async function getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
  const response = await fetch(`${API_BASE}/api/analytics`, {
    headers: await getAuthHeaders(),
    credentials: 'include',
  });

  return response.json();
}

export interface OcrRequest {
  image_base64: string;
  provider?: string;
  model?: string;
}

export interface OcrResponse {
  ok: boolean;
  data?: {
    comercio: string;
    fecha: string;
    hora?: string;
    total: number;
    items: Array<{
      nombre: string;
      cantidad: number;
      precio: number;
      categoria?: string;
    }>;
    metodo_pago?: string;
    sucursal?: string;
  };
  error?: string;
  cost_usd?: number;
  latency_ms?: number;
}

export interface CategorizeRequest {
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
}

export interface CategorizeResponse {
  ok: boolean;
  data?: Array<{
    nombre: string;
    categoria: string;
    subcategoria?: string;
  }>;
  error?: string;
  cost_usd?: number;
  latency_ms?: number;
}

export interface FeedbackImage {
  id: string;
  ticket_id: string;
  image_url: string;
  ocr_result: Record<string, unknown>;
  user_corrections: Record<string, unknown>;
  selected_for_training: boolean;
  created_at: string;
}

export interface FeedbackListResponse {
  ok: boolean;
  data?: FeedbackImage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export async function ocrTicket(input: OcrRequest): Promise<OcrResponse> {
  const response = await fetch(`${API_BASE}/api/ocr`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return response.json();
}

export async function categorizeItems(input: CategorizeRequest): Promise<CategorizeResponse> {
  const response = await fetch(`${API_BASE}/api/categorize`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return response.json();
}

export async function getFeedback(params?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'selected' | 'pending';
}): Promise<FeedbackListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);

  const response = await fetch(`${API_BASE}/api/feedback?${searchParams}`, {
    headers: await getAuthHeaders(),
    credentials: 'include',
  });

  return response.json();
}

export async function updateFeedback(feedbackId: string, updates: {
  user_corrections?: Record<string, unknown>;
  selected_for_training?: boolean;
}): Promise<ApiResponse<FeedbackImage>> {
  const response = await fetch(`${API_BASE}/api/feedback/${feedbackId}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  return response.json();
}