# SPEC-COMPLETO.md — TicketScan v2 (reconstruido)

> Especificación funcional completa: Landing, Admin, Mobile (APK), API, DB, IA, Deploy, Design System.
> Fuente: auditoría original + decisiones de arquitectura tomadas en la sesión.

---

## 1. ARQUITECTURA GENERAL

### Monorepo
- **Turborepo v2** + **pnpm 9** + **Node ≥20**
- **Apps**: `web` (landing + admin + API), `mobile` (Next.js + Capacitor)
- **Packages**: `ui`, `db`, `types`, `utils`, `ai`

### Stack
| Capa | Tech |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Styling | Tailwind v4 (CSS-first `@theme`), CSS Modules |
| DB/ORM | Supabase (PostgreSQL) + Drizzle ORM |
| Auth | Supabase Auth (SSR via `@supabase/ssr`) |
| IA | OpenRouter (multi-provider: Gemini, GPT, Claude, Llama) |
| Mobile | Capacitor 6 (Android) |
| Deploy | Netlify (sitio único; el admin vive en `/admin` dentro de apps/web) |

### Netlify — Sitio único
```
ticket-ar.netlify.app          → apps/web (landing + API)
ticket-ar.netlify.app/admin/* → apps/web (panel admin)
```
- El admin vive en /admin dentro de apps/web; no hay segundo sitio.
- `netlify.toml` maneja redirects + headers de seguridad + cache

---

## 2. DESIGN SYSTEM — `@ticketscan/ui`

### Tokens (fuente única: `packages/ui/src/palette.ts` → `@theme` en `globals.css`)
```css
--color-primary: #00ABE4;       /* azul TicketScan */
--color-accent: #F59E0B;        /* ámbar */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-danger: #EF4444;
--space-1..24, --radius-sm..full
--shadow-card, --shadow-float, --shadow-primary
--transition-fast/base/slow
--z-sticky/fixed/modal
--tab-bar-height: 3.5rem (mobile)
```

### 9 Componentes (CSS Modules + exports barrel `packages/ui/src/index.ts`)
| Componente | Variantes / Props clave |
|---|---|
| **Button** | `primary \| secondary \| ghost \| danger \| float`, `sm\|md\|lg\|icon`, `fullWidth`, `loading`, `startIcon/endIcon` |
| **Input** | `label`, `error`, `hint`, `characterCount`, `maxLength` |
| **Textarea** | igual que Input + `min-height: 120px`, `font-mono` |
| **Select** | `options[]`, `placeholder`, `label`, `error`, `hint` |
| **Card** | `Header/Content/Footer` compuestos, `padded`, `elevated`, `noHover` |
| **Modal** | `open`, `onClose`, `title`, `size: sm\|md\|lg\|xl\|full`, focus-trap, ESC/overlay close |
| **ConfirmModal** | `onConfirm`, `variant: danger\|primary`, `loading` |
| **Table** | `columns[]` con `render`, `hover`, `divide`, `emptyMessage`, `loading`, `onRowClick`, `keyExtractor` |
| **Badge/StatusBadge** | `success\|warning\|danger\|primary\|accent\|muted\|outline\|info`, `sm\|md\|lg`, `dot` |
| **TabBar** | `items[] {href,label,icon,badge}`, `pathname` auto-activo, `hideOnPaths[]`, fixed bottom |
| **ModelPicker** | Fetch models por provider, search, `loadedFor` cache, dropdown animado |

### Apps consumen tokens vía `@theme` — **nada de `tailwind.config.ts` v3**

---

## 3. APPS

### 3.1 `apps/web` — Landing + Admin + API (Next.js 15)

#### Route Groups
```
app/
├── (public)/
│   └── page.tsx          # Landing SSR (fetch /api/landing)
├── admin/
│   ├── layout.tsx        # AdminLayout + TabBar (5 tabs)
│   ├── page.tsx          # redirect → /admin/providers
│   ├── providers/page.tsx
│   ├── monitoring/page.tsx
│   ├── normalization/page.tsx
│   ├── landing/page.tsx
│   └── users/page.tsx
└── api/
    ├── landing/route.ts
    ├── providers/route.ts
    └── providers/[provider]/models/route.ts
```

#### Landing Page (SSR, ISR 60s)
- **Hero**: badge, título, 2 CTAs (APK MediaFire + Play Store disabled), trust indicators
- **Features**: 4 cards (OCR, Categorización, Gráficos, Export)
- **Social Proof**: 3 testimonios + stats (10K+, 4.8★, 99%) [placeholders ficticios]
- **CTA Download**: download card + 4 feature highlights
- **Footer**: brand, nav (Producto/Legal), social, admin link, version
- **Config-driven**: todo viene de `/api/landing` (CMS en DB)

#### Admin Panel (protegido, SSR)
| Página | Funcionalidad |
|---|---|
| **Proveedores IA** | CRUD providers (nombre, modelo default, fallback order, active), Modal edit, ModelPicker para models |
| **Monitoring** | Select mes → métricas (requests, success%, latency, cost USD), cards KPI, tabla mensual, desglose por provider |
| **Normalización** | El sistema busca el ítem en un diccionario por comercio y texto normalizado; si no lo encuentra, la IA sugiere una categoría; si queda dudoso, el ítem va a 'Otros' y el usuario puede completarlo. La corrección entra a `normalization_queue` y, al aprobarse, crea o actualiza una regla en una tabla nueva `normalization_rules` |
| **Landing** | CRUD secciones (hero, features, social-proof, cta-download, footer), toggle enabled, sort_order, JSON content editor |
| **Usuarios** | Tabla users (email, nombre, role badge, tickets, gasto, fecha), CRUD + ConfirmModal delete |

#### API Routes
- `GET /api/landing` → config completa landing (hero, features, social-proof, cta-download, footer)
- `GET /api/providers` → lista providers + models
- `GET /api/providers/:provider/models` → models filtrados por provider

---

### 3.2 `apps/mobile` — App Capacitor (Next.js 15 + `output: 'export'`)

#### Tabs (TabBar fijo bottom)
| Tab | Ruta | Contenido |
|---|---|---|
| **Tickets** | `/tickets` | Lista tabla (comercio, fecha, items, total), FAB "Escanear" → Modal cámara |
| **Análisis** | `/analysis` | Resumen mensual, barras % por categoría, top comercios ranking |
| **Configuración** | `/settings` | Cuenta (email, nombre, moneda, tema), Presupuesto (límite, alerta %), Export PDF/Excel, Delete account, About |

#### Capacitor Config
- `appId: ar.ticketscan.app`
- Plugins: Camera, Filesystem, Preferences, Network, SplashScreen, StatusBar
- Build: `pnpm cap:build:android` → APK release

#### PWA
- `manifest.json` (standalone, theme-color #00ABE4, icons 192/512)
- `viewport-fit=cover`, `mobile-web-app-capable`

---

## 4. PACKAGES

### `@ticketscan/types` — Interfaces compartidas
```typescript
User, UserPreferences
LandingSection, LandingConfig, LandingSectionData, LandingFeatureItem, Testimonial
Ticket, TicketItem
MLProvider, MLConfig, MLTrainingJob, FeedbackImage, NormalizationQueueItem
AnalyticsData, MonthlySpending, CategorySpending, TopMerchant
MLProviderWithModels, MLModel
ApiResponse, PaginatedResponse, SelectOption, NavItem
```

### `@ticketscan/db` — Drizzle Schema (11 tablas)
| Tabla | Clave | Índices |
|---|---|---|
| `profiles` | `user_id` PK (FK a usuario de Supabase Auth) | role (user/admin), preferencias |
| `landing_sections` | `id` PK, `key` unique | sort_order, enabled |
| `tickets` | `id` PK, `user_id` FK | user_id, fecha, comercio |
| `ticket_items` | `id` PK, `ticket_id` FK | ticket_id |
| `ml_providers` | `id` PK, `name` unique | — |
| `ml_configs` | `id` PK, `provider_id` FK | provider_id, is_active |
| ~~`ml_training_jobs`~~ | `id` PK | status | ~~el aprendizaje se hace con diccionario; reentrenar un modelo propio queda para cuando haya volumen~~ |
| ~~`feedback_images`~~ | `id` PK, `user_id` FK, `ticket_id` FK nullable | user_id, training_job_id, selected_for_training | ~~el aprendizaje se hace con diccionario; reentrenar un modelo propio queda para cuando haya volumen~~ |
| ~~`ml_training_jobs_feedback`~~ | `job_id` + `feedback_id` PK compuesta | — | ~~el aprendizaje se hace con diccionario; reentrenar un modelo propio queda para cuando haya volumen~~ |
| `normalization_queue` | `id` PK, `ticket_id` FK | status, ticket_id |
| `normalization_rules` | `id` PK, `commerce` | texto_normalizado, categoría, activo |

Enums: `user_role`, `ticket_source`, `ticket_status`, `provider_status`, `job_status`, `feedback_status`, `normalization_status`, `category`

Relations definidas para todo (profiles→tickets, tickets→items, ml_providers→configs, training_jobs↔feedback many-to-many, etc.)

### Seguridad y RLS

- RLS activado en todas las tablas como segunda barrera, denegando por defecto
- Políticas de acceso: por dueño (user_id) y por rol admin
- La API utiliza el token de Supabase Auth del usuario
- La clave de servicio de Supabase solo se utiliza en código de servidor de rutas admin
- Todas las rutas `/api/v1/admin/*` verifican que el usuario tenga rol admin
- La ruta `/api/providers` ya no es pública (requiere autenticación)
- La conexión directa de Drizzle (`DATABASE_URL`) no pasa por RLS y solo se utiliza en código de servidor autorizado

### Contrato de API para mobile

| Método | Ruta | Autenticación | Propósito |
|---|---|---|---|
| GET | `/api/v1/tickets` | Requerida | Listar tickets con filtros |
| POST | `/api/v1/tickets` | Requerida | Crear nuevo ticket |
| GET | `/api/v1/tickets/:id` | Requerida | Obtener ticket por ID |
| PUT | `/api/v1/tickets/:id` | Requerida | Actualizar ticket existente |
| DELETE | `/api/v1/tickets/:id` | Requerida | Eliminar ticket |
| GET | `/api/v1/analysis` | Requerida | Obtener datos de análisis |
| GET | `/api/v1/configuration` | Requerida | Obtener configuración de usuario |
| PUT | `/api/v1/configuration` | Requerida | Actualizar configuración de usuario |
| GET | `/api/v1/export` | Requerida | Exportar datos (CSV, Excel, etc.) |
| DELETE | `/api/v1/account` | Requerida | Borrar cuenta de usuario |
| POST | `/api/v1/scan` | Requerida | Iniciar proceso de escaneo/OCR |
| GET | `/api/v1/upload-url` | Requerida | Obtener URL firmada para subir foto |
| POST | `/api/v1/normalization-correction` | Requerida | Envío de corrección de normalización |

**Formato estándar de error:**
```json
{
  "error": "código_de_error",
  "message": "Mensaje descriptivo del error",
  "details": {}
}
```

### `@ticketscan/utils`
- `cn(...classes)` → `clsx` + `tailwind-merge`
- `formatCurrency`, `formatNumber`, `formatDate`, `formatDateTime`
- `truncate`, `slugify`, `generateId`
- `debounce`, `throttle`, `classNames`

### `@ticketscan/ai` — OpenRouter Client
- `OpenRouterClient`: `chatCompletion`, `chatCompletionStream`, `createEmbedding`, `structuredOutput` (Zod)
- `listModels()`, `getAvailableModels()` (9 modelos predefinidos: Gemini 1.5 Pro/Flash, GPT-4o/mini, Claude 3.5 Sonnet/Haiku/Opus, Llama 3.1 405B, Gemma 2 27B, Mistral Large 2)
- Headers: `HTTP-Referer`, `X-Title: TicketScan`

---

## 5. IA PIPELINE (pendiente implementar)

| Etapa | Descripción |
|---|---|
| **OCR** | Obtiene texto estructurado de imágenes o datos de comprobante. Dos formas de captura:
1. QR: se decodifica en el dispositivo y aporta datos del comprobante (CUIT, fecha, importe, código de autorización) - no requiere subir imagen
2. Foto: se sube por URL firmada a un bucket privado temporal y se envía al OCR para obtener los ítems |
| **Categorización** | Items → categorías enum (almacen, frescos, lacteos, bebidas, limpieza, congelados, carnes, frutas_y_verduras, panaderia, otros) |
| **Normalización** | El sistema busca el ítem en un diccionario por comercio y texto normalizado; si no lo encuentra, la IA sugiere una categoría; si queda dudoso, el ítem va a 'Otros' y el usuario puede completarlo |
| **Feedback Loop** | La corrección entra a `normalization_queue` y, al aprobarse, crea o actualiza una regla en una tabla nueva `normalization_rules`. El diccionario se consulta antes que el modelo, y los ejemplos aprobados pueden usarse como ejemplos en el prompt |
| **Fallback** | Provider 1 falla → Provider 2 (fallback_order) |

---

## Decisiones abiertas

- Política de aprobación: manual, automática cuando N usuarios distintos coinciden, o ambas
- Alcance de una regla: por comercio, global, o por comercio con respaldo global
- Qué se guarda de quien corrige (nada, o un identificador seudónimo para detectar abuso)
- Qué pasa con la foto del ticket: se descarta al terminar el OCR, o se guarda unas horas para reintentos
- Revisar con un profesional los requisitos de la Ley 25.326 de protección de datos personales, porque la foto sí se procesa en el servidor y por el proveedor de IA que se configure

## 6. DEPLOY & CI/CD

### Netlify (producción)
- **Site**: `ticket-ar.netlify.app`
- **Build**: `pnpm run build` (turborepo)
- **Publish**: `.netlify/output` (Next.js 15 output)
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `OPENROUTER_API_KEY`, `NEXT_PUBLIC_API_URL`

### GitHub Actions (pendiente)
```yaml
# .github/workflows/ci.yml
- lint, typecheck, test (unit + integration)
- build all packages
- db:generate (drizzle)
- deploy preview on PR
- deploy prod on merge to main
```

### Mobile
- `pnpm --filter @ticketscan/mobile cap:sync`
- `pnpm --filter @ticketscan/mobile cap:build:android` → `android/app/build/outputs/apk/release/app-release.apk`
- Distribución: MediaFire (actual) → Play Store (futuro)

---

## 7. ROADMAP / SPRINTS (propuesta)

| Sprint | Objetivo | Entregables |
|---|---|---|
| **Sprint 0** ⏳ | Base técnica | Monorepo, UI kit, esquema de base. *Nota: el repo estaba vacío y la base técnica (monorepo, UI kit y esquema de la base) se reconstruye.* |
| **Sprint 1** | Auth + Landing + API base | Supabase Auth (email/password + magic link), middleware protected routes, landing CMS from DB, API tickets CRUD |
| **Sprint 2** | Admin completo | Providers CRUD real (DB), Monitoring real (queries Supabase), Normalization queue real, Users management real |
| **Sprint 3** | Mobile app | Tickets list real (Supabase), Analysis charts (Recharts), Settings persist (Supabase), Camera scan → OCR API, Capacitor build |
| **Sprint 4** | IA Pipeline | OCR endpoint, Categorización endpoint, Feedback loop, Training job scheduler, ModelPicker dynamic |
| **Sprint 5** | Hardening | Tests (vitest unit, Playwright E2E), CI/CD, Observability (Sentry), Performance, Deploy prod |

---

## 8. TESTING (pendiente)

| Tipo | Herramienta | Cobertura objetivo |
|---|---|---|
| Unit | Vitest | ≥80% packages (utils, ai, types) |
| Integration | Vitest + Supabase local | API routes, DB mutations |
| E2E | Playwright | Landing flow, Admin CRUDs, Mobile tabs |
| Visual | Chromatic / Percy | UI kit components |

---

## 9. VARIABLES DE ENTORNO

```env
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://postgres:...@db.<tu-proyecto>.supabase.co:5432/postgres
OPENROUTER_API_KEY=...
NEXT_PUBLIC_API_URL=https://ticket-ar.netlify.app
NEXT_PUBLIC_APP_URL=https://ticket-ar.netlify.app
```

---

## 10. CHECKLIST TÉCNICO PENDIENTE

- [ ] Restaurar `SPEC-COMPLETO.md` en repo ✅ (este archivo)
- [ ] GitHub Actions CI/CD
- [ ] Supabase Auth configurado (providers, emails, redirects)
- [ ] Middleware auth en `/admin` (web)
- [ ] Mobile se exporta estática (sin middleware ni route handlers), auth resuelta del lado del cliente
- [ ] API tickets CRUD (mobile consume)
- [ ] OCR endpoint + categorización
- [ ] Feedback loop UI (mobile) → DB
- [ ] Training job scheduler (cron Supabase pg_cron o GitHub Actions)
- [ ] Tests unit/integration/E2E
- [ ] Sentry / logging
- [ ] Play Store build pipeline
- [ ] Documentación API (OpenAPI/Swagger)


---

> **Nota**: Este spec reconstruye la especificación original que se perdió en el wipe. Sirve como única fuente de verdad para planear sprints, crear tareas Kanban y validar completitud.

## Acceso a datos de mobile

Todo el acceso a datos de la aplicación mobile pasa por la propia API (opción B).

Motivos:
- API versionada: el APK no se actualiza al instante, por lo que la API permite mantener compatibilidad hacia atrás
- Validación centralizada: las correcciones que llegan de los usuarios se validan en un solo lugar antes de afectar al diccionario o al modelo
- Límites de uso y costo: el control de uso y costo de la IA se centraliza en la API, evitando que cada instancia de la app consuma recursos directamente

Restricciones:
- El mobile no consulta directamente las tablas de Supabase
- El mobile solo utiliza Supabase Auth para la autenticación
- Todo el resto de las operaciones (obtención de datos, envío de tickets, consulta de análisis, etc.) se realiza a través de la API propia