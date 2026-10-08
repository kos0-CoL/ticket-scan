import { pgTable, uuid, text, numeric, date, time, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
export { eq } from 'drizzle-orm';

// ===================== Categorías =====================
export const categorias = pgTable("categorias", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  icono: text("icono"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const categoriasRelations = relations(categorias, ({ many }) => ({
  productos: many(productos),
}));

// ===================== Productos =====================
export const productos = pgTable("productos", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre_normalizado: text("nombre_normalizado").notNull(),
  nombre_original: text("nombre_original").notNull(),
  categoria: text("categoria").notNull(),
  marca: text("marca"),
  unidad: text("unidad"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const productosRelations = relations(productos, ({ many }) => ({
  ticketItems: many(ticketItems),
}));

// ===================== Tickets =====================
export type TicketType = 'compra' | 'devolucion';
export type TicketSource = 'foto_multiple' | 'importado' | 'qr';
export type NormalizationStatus = 'pending' | 'approved' | 'rejected';

export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id").notNull(),
  fecha: date("fecha").notNull(),
  hora: time("hora"),
  comercio: text("comercio").notNull(),
  sucursal: text("sucursal"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  metodo_pago: text("metodo_pago"),
  tipo: text("tipo").$type<TicketType>().notNull().default("compra"),
  imagen_url: text("imagen_url"),
  fuente: text("fuente").$type<TicketSource>().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const ticketsRelations = relations(tickets, ({ many }) => ({
  items: many(ticketItems),
}));

// ===================== Ticket Items =====================
export const ticketItems = pgTable("ticket_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticket_id: uuid("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  producto_id: uuid("producto_id").references(() => productos.id),
  cantidad: numeric("cantidad", { precision: 10, scale: 3 }).notNull(),
  precio_unitario: numeric("precio_unitario", { precision: 10, scale: 2 }).notNull(),
  precio_total: numeric("precio_total", { precision: 10, scale: 2 }).notNull(),
  descuento: numeric("descuento", { precision: 10, scale: 2 }),
});

export const ticketItemsRelations = relations(ticketItems, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketItems.ticket_id], references: [tickets.id] }),
  producto: one(productos, { fields: [ticketItems.producto_id], references: [productos.id] }),
}));

// ===================== Normalización (auditoría) =====================
export type NormalizationMethod = 'regla' | 'fuzzy' | 'ia' | 'manual';

export const normalizacionLog = pgTable("normalizacion_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre_raw: text("nombre_raw").notNull(),
  nombre_normalizado: text("nombre_normalizado").notNull(),
  categoria_asignada: text("categoria_asignada"),
  metodo: text("metodo").$type<NormalizationMethod>().notNull(),
  confianza: numeric("confianza", { precision: 3, scale: 2 }),
  status: text("status").$type<NormalizationStatus>().notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ===================== Proveedores IA =====================
export type AIProviderName = 'gemini' | 'openai' | 'anthropic' | 'openrouter';

export const aiProviders = pgTable("ai_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").$type<AIProviderName>().notNull(),
  api_key_enc: text("api_key_enc").notNull(),
  base_url: text("base_url"),
  default_model: text("default_model").notNull(),
  fallback_order: integer("fallback_order").notNull().default(0),
  is_active: boolean("is_active").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ===================== Landing Sections =====================
export const landingSections = pgTable("landing_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  content: jsonb("content").notNull().default("{}"),
  enabled: boolean("enabled").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ===================== Configuración ML =====================
export const mlConfig = pgTable("ml_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider_id: uuid("provider_id").references(() => aiProviders.id),
  model_id: text("model_id").notNull(),
  temperature: numeric("temperature", { precision: 3, scale: 2 }).notNull().default("0.1"),
  max_tokens: integer("max_tokens").notNull().default(4096),
  system_prompt: text("system_prompt"),
  version: text("version").notNull().default("1.0.0"),
  is_active: boolean("is_active").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ===================== Feedback Images (reentrenamiento) =====================
export const feedbackImages = pgTable("feedback_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticket_id: uuid("ticket_id").references(() => tickets.id, { onDelete: "set null" }),
  user_id: text("user_id").notNull(),
  image_url: text("image_url").notNull(),
  ocr_result: jsonb("ocr_result"),
  user_corrections: jsonb("user_corrections"),
  selected_for_training: boolean("selected_for_training").notNull().default(false),
  training_job_id: uuid("training_job_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ===================== ML Training Jobs =====================
export const mlTrainingJobs = pgTable("ml_training_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  model_version: text("model_version").notNull(),
  feedback_percentage: integer("feedback_percentage").notNull(),
  images_count: integer("images_count").notNull(),
  status: text("status").notNull().default("pending"),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  error_message: text("error_message"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ===================== Configuración de la app =====================
export const appConfig = pgTable("app_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull().default("{}"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ===================== Seeds =====================
export const seedCategories = [
  { nombre: "Almacén", slug: "almacen", icono: "shopping-cart" },
  { nombre: "Frescos", slug: "frescos", icono: "leaf" },
  { nombre: "Lácteos", slug: "lacteos", icono: "milk" },
  { nombre: "Bebidas", slug: "bebidas", icono: "wine" },
  { nombre: "Limpieza", slug: "limpieza", icono: "sparkles" },
  { nombre: "Congelados", slug: "congelados", icono: "snowflake" },
  { nombre: "Carnes", slug: "carnes", icono: "meat" },
  { nombre: "Frutas y Verduras", slug: "frutas-verduras", icono: "apple" },
  { nombre: "Panadería", slug: "panaderia", icono: "bread" },
  { nombre: "Otros", slug: "otros", icono: "more-horizontal" },
];

export const seedLandingSections = [
  {
    key: "hero",
    title: "Hero Principal",
    content: {
      badge: "🎫 TicketScan",
      headline: "Escanea, categoriza y analiza tus <span class=\"text-primary\">tickets de supermercado</span>",
      subtext: "La app que usa IA para leer tus tickets, organizar tus gastos por categoría y mostrarte gráficos claros de tu presupuesto familiar.",
      cta_primary_text: "Descargar APK (MediaFire)",
      cta_primary_url: "https://mediafire.com",
      cta_secondary_text: "Próximamente en Play Store",
      cta_secondary_disabled: true,
      footnote: "Versión beta • Sin anuncios • Datos 100% tuyos"
    },
    enabled: true,
    sort_order: 1,
  },
  {
    key: "features",
    title: "Características",
    content: {
      headline: "Todo lo que necesitas para <span class=\"text-primary\">controlar tus compras</span>",
      subtext: "Diseñada para el contexto argentino: supermercados locales, moneda ARS, facturación AFIP.",
      items: [
        { icon: "📷", title: "Escaneo OCR Inteligente", desc: "Apunta la cámara a tu ticket y extraemos automáticamente productos, precios y totales con IA avanzada." },
        { icon: "🏷️", title: "Categorización Automática", desc: "Cada producto se clasifica en categorías (alimentos, limpieza, bebidas, etc.) para que veas en qué gastas." },
        { icon: "📊", title: "Gráficos de Gasto", desc: "Visualiza tu evolución mensual, compara supermercados y detecta donde ahorrar con charts interactivos." },
        { icon: "📄", title: "Exportar a PDF/Excel", desc: "Descarga tus tickets procesados en PDF o Excel para llevar el control contable o compartir con tu contador." }
      ]
    },
    enabled: true,
    sort_order: 2,
  },
  {
    key: "social-proof",
    title: "Prueba Social",
    content: {
      headline: "Confiada por <span class=\"text-primary\">miles de familias</span> argentinas",
      subtext: "Únete a quienes ya llevan el control de su presupuesto sin esfuerzo.",
      testimonials: [
        { name: "María G.", location: "Buenos Aires", text: "Ahorro 2 horas por semana cargando gastos. El OCR es increíblemente preciso.", rating: 5 },
        { name: "Carlos R.", location: "Córdoba", text: "Por fin sé exactamente en qué se me va el sueldo. Los gráficos son muy útiles.", rating: 5 },
        { name: "Lucía M.", location: "Rosario", text: "La exportación a Excel me salvó para la declaración de ganancias. 10/10.", rating: 5 }
      ],
      stats: [
        { value: "10K+", label: "Descargas en beta" },
        { value: "4.8★", label: "Rating promedio" },
        { value: "99%", label: "Precisión OCR" }
      ]
    },
    enabled: true,
    sort_order: 3,
  },
  {
    key: "cta-download",
    title: "CTA Descarga",
    content: {
      headline: "¿Listo para empezar a ahorrar?",
      subtext: "Descarga la APK ahora y escanea tu primer ticket en segundos. Sin registro, sin anuncios, tus datos nunca salen de tu teléfono.",
      cta_primary_text: "Descargar APK desde MediaFire",
      cta_primary_url: "https://mediafire.com",
      cta_secondary_text: "Play Store (Próximamente)",
      cta_secondary_disabled: true
    },
    enabled: true,
    sort_order: 4,
  },
  {
    key: "footer",
    title: "Footer",
    content: {
      brand: "🎫 TicketScan",
      description: "La app que escanea, categoriza y analiza tus tickets de supermercado automáticamente. Hecha en Argentina 🇦🇷",
      social_links: [
        { label: "Twitter", url: "#", icon: "𝕏" },
        { label: "GitHub", url: "#", icon: "⌘" },
        { label: "Email", url: "#", icon: "✉️" }
      ],
      nav_producto: [
        { label: "Características", url: "#" },
        { label: "Descargar", url: "#" },
        { label: "Changelog", url: "#" },
        { label: "Roadmap", url: "#" }
      ],
      nav_legal: [
        { label: "Privacidad", url: "/privacidad" },
        { label: "Términos", url: "/terminos" },
        { label: "Cookies", url: "/cookies" }
      ],
      copyright: "© 2025 TicketScan. Hecho con ❤️ en Argentina.",
      version: "Versión 1.0.0-beta",
      admin_link: "https://admin.ticket-ar.netlify.app"
    },
    enabled: true,
    sort_order: 5,
  }
];
