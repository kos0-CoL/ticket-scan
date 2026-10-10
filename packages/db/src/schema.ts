import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, numeric, pgEnum, index, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);
export const ticketSourceEnum = pgEnum('ticket_source', ['camera', 'gallery', 'pdf', 'email', 'whatsapp']);
export const ticketStatusEnum = pgEnum('ticket_status', ['pending', 'processing', 'completed', 'failed']);
export const providerStatusEnum = pgEnum('provider_status', ['active', 'inactive']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'running', 'completed', 'failed']);
export const feedbackStatusEnum = pgEnum('feedback_status', ['pending', 'selected', 'rejected']);
export const normalizationStatusEnum = pgEnum('normalization_status', ['pending', 'approved', 'rejected']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
export const categoryEnum = pgEnum('category', [
  'almacen', 'frescos', 'lacteos', 'bebidas', 'limpieza',
  'congelados', 'carnes', 'frutas_y_verduras', 'panaderia', 'otros'
]);

// Default preferences
const defaultPreferences: UserPreferences = {
  monthlyBudget: 0,
  budgetAlertThreshold: 80,
  currency: 'ARS',
  notifications: true,
  autoCategorize: true,
  theme: 'system',
};

export interface UserPreferences {
  monthlyBudget: number;
  budgetAlertThreshold: number;
  currency: string;
  notifications: boolean;
  autoCategorize: boolean;
  theme: 'light' | 'dark' | 'system';
}

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull().default('user'),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  preferences: jsonb('preferences').$type<UserPreferences>().notNull().default(defaultPreferences),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Profiles (extended user info)
export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  preferences: jsonb('preferences').$type<UserPreferences>().notNull().default(defaultPreferences),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Landing Sections
export const landingSections = pgTable('landing_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  content: jsonb('content').$type<Record<string, unknown>>().notNull().default({}),
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sortIdx: index('landing_sections_sort_idx').on(table.sortOrder),
  enabledIdx: index('landing_sections_enabled_idx').on(table.enabled),
}));

// Tickets
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  comercio: varchar('comercio', { length: 255 }).notNull(),
  fecha: varchar('fecha', { length: 10 }).notNull(), // YYYY-MM-DD
  hora: varchar('hora', { length: 5 }), // HH:MM
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  fuente: ticketSourceEnum('fuente').notNull(),
  imagenUrl: varchar('imagen_url', { length: 500 }),
  sucursal: varchar('sucursal', { length: 255 }),
  metodoPago: varchar('metodo_pago', { length: 50 }),
  status: ticketStatusEnum('status').notNull().default('completed'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index('tickets_user_idx').on(table.userId),
  fechaIdx: index('tickets_fecha_idx').on(table.fecha),
  comercioIdx: index('tickets_comercio_idx').on(table.comercio),
}));

// Ticket Items
export const ticketItems = pgTable('ticket_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  cantidad: numeric('cantidad', { precision: 10, scale: 3 }).notNull(),
  precio: numeric('precio', { precision: 12, scale: 2 }).notNull(),
  categoria: categoryEnum('categoria').notNull(),
  subcategoria: varchar('subcategoria', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  ticketIdx: index('ticket_items_ticket_idx').on(table.ticketId),
}));

// ML Providers
export const mlProviders = pgTable('ml_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  apiKeyEncrypted: varchar('api_key_encrypted', { length: 500 }).notNull(),
  defaultModel: varchar('default_model', { length: 100 }).notNull(),
  fallbackOrder: integer('fallback_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ML Config
export const mlConfigs = pgTable('ml_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => mlProviders.id, { onDelete: 'cascade' }),
  modelId: varchar('model_id', { length: 100 }).notNull(),
  temperature: numeric('temperature', { precision: 3, scale: 2 }).notNull().default('0.1'),
  maxTokens: integer('max_tokens').notNull().default(4096),
  systemPrompt: text('system_prompt').notNull().default(''),
  version: varchar('version', { length: 20 }).notNull().default('1.0.0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  providerIdx: index('ml_configs_provider_idx').on(table.providerId),
  activeIdx: index('ml_configs_active_idx').on(table.isActive),
}));

// ML Training Jobs
export const mlTrainingJobs = pgTable('ml_training_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  modelVersion: varchar('model_version', { length: 50 }).notNull(),
  feedbackPercentage: integer('feedback_percentage').notNull(),
  imagesCount: integer('images_count').notNull(),
  status: jobStatusEnum('status').notNull().default('pending'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('ml_jobs_status_idx').on(table.status),
}));

// Feedback Images
export const feedbackImages = pgTable('feedback_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').references(() => tickets.id, { onDelete: 'set null' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  ocrResult: jsonb('ocr_result').$type<Record<string, unknown>>().notNull().default({}),
  userCorrections: jsonb('user_corrections').$type<Record<string, unknown>>().notNull().default({}),
  selectedForTraining: boolean('selected_for_training').notNull().default(false),
  trainingJobId: uuid('training_job_id').references(() => mlTrainingJobs.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index('feedback_user_idx').on(table.userId),
  trainingIdx: index('feedback_training_idx').on(table.trainingJobId),
  selectedIdx: index('feedback_selected_idx').on(table.selectedForTraining),
}));

// ML Training Jobs - Feedback relation (many-to-many)
export const mlTrainingJobsFeedback = pgTable('ml_training_jobs_feedback', {
  jobId: uuid('job_id').notNull().references(() => mlTrainingJobs.id, { onDelete: 'cascade' }),
  feedbackId: uuid('feedback_id').notNull().references(() => feedbackImages.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.jobId, table.feedbackId] }),
}));

// Normalization Queue
export const normalizationQueue = pgTable('normalization_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  status: normalizationStatusEnum('status').notNull().default('pending'),
  suggestedCategory: varchar('suggested_category', { length: 100 }).notNull(),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('normalization_status_idx').on(table.status),
  ticketIdx: index('normalization_ticket_idx').on(table.ticketId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  tickets: many(tickets),
  feedback: many(feedbackImages),
  mlJobs: many(mlTrainingJobs),
  normalizationReviews: many(normalizationQueue),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, { fields: [tickets.userId], references: [users.id] }),
  items: many(ticketItems),
  feedback: many(feedbackImages),
  normalization: many(normalizationQueue),
}));

export const ticketItemsRelations = relations(ticketItems, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketItems.ticketId], references: [tickets.id] }),
}));

export const mlProvidersRelations = relations(mlProviders, ({ many }) => ({
  configs: many(mlConfigs),
}));

export const mlConfigsRelations = relations(mlConfigs, ({ one }) => ({
  provider: one(mlProviders, { fields: [mlConfigs.providerId], references: [mlProviders.id] }),
}));

export const mlTrainingJobsRelations = relations(mlTrainingJobs, ({ many }) => ({
  feedbackRelations: many(mlTrainingJobsFeedback),
}));

export const mlTrainingJobsFeedbackRelations = relations(mlTrainingJobsFeedback, ({ one }) => ({
  job: one(mlTrainingJobs, { fields: [mlTrainingJobsFeedback.jobId], references: [mlTrainingJobs.id] }),
  feedback: one(feedbackImages, { fields: [mlTrainingJobsFeedback.feedbackId], references: [feedbackImages.id] }),
}));

export const feedbackImagesRelations = relations(feedbackImages, ({ one, many }) => ({
  user: one(users, { fields: [feedbackImages.userId], references: [users.id] }),
  ticket: one(tickets, { fields: [feedbackImages.ticketId], references: [tickets.id] }),
  trainingJob: one(mlTrainingJobs, { fields: [feedbackImages.trainingJobId], references: [mlTrainingJobs.id] }),
  mlJobsFeedback: many(mlTrainingJobsFeedback),
}));

export const normalizationQueueRelations = relations(normalizationQueue, ({ one }) => ({
  ticket: one(tickets, { fields: [normalizationQueue.ticketId], references: [tickets.id] }),
  reviewer: one(users, { fields: [normalizationQueue.reviewedBy], references: [users.id] }),
}));

// Export all tables
export const schema = {
  users,
  profiles,
  landingSections,
  tickets,
  ticketItems,
  mlProviders,
  mlConfigs,
  mlTrainingJobs,
  feedbackImages,
  mlTrainingJobsFeedback,
  normalizationQueue,
};