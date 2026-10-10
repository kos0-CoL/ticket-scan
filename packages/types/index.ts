// Shared TypeScript types for TicketScan

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  monthlyBudget: number;
  budgetAlertThreshold: number;
  currency: string;
  notifications: boolean;
  autoCategorize: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface LandingSection {
  id: string;
  key: string;
  title: string;
  content: Record<string, unknown>;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LandingConfig {
  hero?: LandingSectionData;
  features?: LandingSectionData;
  'social-proof'?: LandingSectionData;
  'cta-download'?: LandingSectionData;
  footer?: LandingSectionData;
}

export interface LandingSectionData {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  content?: Record<string, unknown>;
  cta_text?: string;
  cta_url?: string;
  image?: string;
  badge?: string;
  items?: LandingFeatureItem[];
  testimonials?: Testimonial[];
  cta_primary?: string;
  cta_secondary?: string;
}

export interface LandingFeatureItem {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

export interface Testimonial {
  text: string;
  author: string;
  location: string;
  rating: number;
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
  items?: TicketItem[];
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
}

export interface MLProvider {
  id: string;
  name: string;
  api_key_encrypted: string;
  default_model: string;
  fallback_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MLConfig {
  id: string;
  provider_id: string;
  model_id: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MLTrainingJob {
  id: string;
  model_version: string;
  feedback_percentage: number;
  images_count: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message?: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface FeedbackImage {
  id: string;
  ticket_id: string | null;
  user_id: string;
  image_url: string;
  ocr_result: Record<string, unknown>;
  user_corrections: Record<string, unknown>;
  selected_for_training: boolean;
  training_job_id: string | null;
  created_at: string;
}

export interface NormalizationQueueItem {
  id: string;
  ticket_id: string;
  status: 'pending' | 'approved' | 'rejected';
  suggested_category: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
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

export interface MLProviderWithModels extends MLProvider {
  models: MLModel[];
}

export interface MLModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    input: number;
    output: number;
  };
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  config?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string | number;
}