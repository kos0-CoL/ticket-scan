// API Client para mobile app
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ticket-ar.netlify.app';

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

async function getAuthHeaders(): Promise<HeadersInit> {
  // En el cliente mobile, el token se maneja via Supabase session
  // Para API routes que requieren auth, usamos cookies (SSR)
  // En mobile export, usamos fetch directo a la API
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