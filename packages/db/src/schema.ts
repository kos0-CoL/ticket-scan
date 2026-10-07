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
export type AIProviderName = 'gemini' | 'openai' | 'anthropic';

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
