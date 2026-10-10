# TicketScan v2 - Monorepo

Monorepo Turborepo con Next.js 15, React 19, TypeScript, Tailwind v4, Supabase, Drizzle ORM.

## Estructura

```
├── apps/
│   ├── web/           # Landing page + Admin panel + API (Next.js 15)
│   └── mobile/        # App móvil (Next.js 15 + Capacitor)
├── packages/
│   ├── ui/            # Design System (@ticketscan/ui)
│   ├── db/            # Drizzle ORM + Supabase (@ticketscan/db)
│   ├── types/         # Tipos TypeScript compartidos (@ticketscan/types)
│   ├── utils/         # Utilidades compartidas (@ticketscan/utils)
│   └── ai/            # Clientes IA (OpenRouter) (@ticketscan/ai)
├── turbo.json         # Configuración Turborepo
├── pnpm-workspace.yaml
└── package.json
```

## Apps

### `apps/web` - Landing + Admin + API
- **Landing page** (`/`) - Pública, SSR, configurada desde CMS
- **Admin panel** (`/admin/*`) - Protegido, route group `(admin)`
- **API Routes** (`/api/*`) - REST API para mobile y admin

### `apps/mobile` - App móvil
- **Capacitor** para build nativo Android
- **Tabs**: Tickets, Análisis, Configuración
- **Export**: `pnpm cap:build:android`

## Packages

### `@ticketscan/ui` - Design System
Componentes con CSS Modules + Tailwind v4 tokens:
- Button, Input, Textarea, Select
- Card (Header, Content, Footer)
- Modal, ConfirmModal
- Table (con Column helpers)
- Badge, StatusBadge
- TabBar, TabBarSpacer
- ModelPicker

Tokens desde `packages/ui/src/palette.ts` → `@theme` en globals.css

### `@ticketscan/db` - Drizzle + Supabase
- Schema completo: users, tickets, ml_providers, feedback, normalization_queue
- Migraciones con `drizzle-kit`
- Cliente serverless optimizado

### `@ticketscan/types` - Tipos compartidos
Interfaces para User, Ticket, MLProvider, LandingSection, Analytics, etc.

### `@ticketscan/utils` - Utilidades
`cn()`, formateo moneda/fecha, slugify, debounce/throttle, etc.

### `@ticketscan/ai` - Clientes IA
OpenRouter client con streaming, structured output, embeddings.

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo (todos los apps)
pnpm dev

# Solo web
pnpm --filter @ticketscan/web dev

# Solo mobile
pnpm --filter @ticketscan/mobile dev

# Build
pnpm build

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Tests
pnpm test
```

## Base de datos

```bash
# Generar migraciones
pnpm --filter @ticketscan/db db:generate

# Push a Supabase
pnpm --filter @ticketscan/db db:push

# Studio
pnpm --filter @ticketscan/db db:studio
```

## Deploy

### Netlify (sitio único con proxy admin)
- `ticket-ar.netlify.app` → apps/web (landing + API)
- Proxy `/admin/*` → admin-ticket-ar.netlify.app (temporal)
- `netlify.toml` maneja redirects y headers

### Mobile (Capacitor)
```bash
pnpm --filter @ticketscan/mobile cap:sync
pnpm --filter @ticketscan/mobile cap:build:android
```

## Variables de entorno

Ver `.env.example` - requiere:
- Supabase URL + Anon Key
- Database URL (pooler)
- OpenRouter API Key

## Scripts útiles

```bash
# Ver dependencias desactualizadas
pnpm outdated -r

# Limpiar todo
pnpm clean

# Formatear código
pnpm format
```

## Roadmap

- [ ] Sprint 0: Base monorepo + Design System ✓
- [ ] Sprint 1: Auth + Landing + API básica
- [ ] Sprint 2: Admin panel completo (Providers, Monitoring, Normalization, Users)
- [ ] Sprint 3: Mobile app (Tickets, Analysis, Settings + Capacitor)
- [ ] Sprint 4: IA Pipeline (OCR, Categorización, Entrenamiento)
- [ ] Sprint 5: Testing + CI/CD + Deploy production