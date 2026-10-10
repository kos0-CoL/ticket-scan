# TicketScan v2 — Kanban Board

> Tablero de tareas local (markdown) — sincronizable con GitHub Projects.
> Columnas: **Backlog** → **Sprint 1** → **Sprint 2** → **Sprint 3** → **Sprint 4** → **Sprint 5** → **Done**
> Cada tarea: `- [ ] ID: Título` — mover entre columnas cambiando la sección.

---

## BACKLOG

### Infra & Config
- [ ] **INF-01** Configurar GitHub Actions CI/CD (lint, typecheck, test, build, deploy preview/prod)
- [ ] **INF-02** Configurar secrets GitHub (Supabase, OpenRouter, Netlify)
- [ ] **INF-03** Añadir `@types/node` a packages que lo necesiten
- [ ] **INF-04** Configurar ESLint flat config + Prettier en todos los packages
- [ ] **INF-05** Añadir `vitest` config + coverage threshold (≥80%)
- [ ] **INF-06** Configurar Playwright E2E (web + mobile)
- [ ] **INF-07** Configurar Sentry (DSN, source maps, release tracking)
- [ ] **INF-08** Configurar dependabot / renovate para deps

### Base de Datos
- [ ] **DB-01** Ejecutar `pnpm db:push` contra Supabase staging
- [ ] **DB-02** Crear seed script (`pnpm db:seed`) con datos demo
- [ ] **DB-03** Configurar RLS policies en Supabase (users, tickets, feedback)
- [ ] **DB-04** Añadir índices compuestos faltantes (query plans)
- [ ] **DB-05** Configurar pg_cron para training jobs scheduler

### Autenticación
- [ ] **AUTH-01** Configurar Supabase Auth providers (email/password, magic link)
- [ ] **AUTH-02** Crear middleware `apps/web/middleware.ts` protege `(admin)/*`
- [ ] **AUTH-03** Crear middleware `apps/mobile/middleware.ts` protege `/tickets`, `/analysis`, `/settings`
- [ ] **AUTH-04** Implementar `@supabase/ssr` client en `lib/supabase.ts` (server + browser)
- [ ] **AUTH-05** Página `/login` + `/register` (web + mobile)
- [ ] **AUTH-06** Magic link flow + redirect post-login
- [ ] **AUTH-07** Role-based access (admin vs user) en middleware

### Landing Page
- [ ] **LAND-01** Conectar `/api/landing` a DB (`landing_sections` table)
- [ ] **LAND-02** Admin Landing CRUD real (persistir a DB)
- [ ] **LAND-03** ISR revalidate 60s + `next revalidate` on admin save
- [ ] **LAND-04** Hero: imagen ilustración + CTA tracking (analytics event)
- [ ] **LAND-05** Features: iconos SVG optimizados (no emojis)
- [ ] **LAND-06** Social Proof: testimonios desde DB
- [ ] **LAND-07** CTA Download: link MediaFire real + utm params
- [ ] **LAND-08** Footer: links legales reales (/privacidad, /terminos, /cookies)
- [ ] **LAND-09** SEO: meta tags, Open Graph, sitemap.xml, robots.txt
- [ ] **LAND-10** Performance: LCP < 2.5s, CLS < 0.1

### API Tickets
- [ ] **API-01** `POST /api/tickets` — crear ticket (multipart: image + metadata)
- [ ] **API-02** `GET /api/tickets` — lista paginada (user_id, fecha range, comercio)
- [ ] **API-03** `GET /api/tickets/:id` — detalle + items
- [ ] **API-04** `DELETE /api/tickets/:id` — soft delete (user owner)
- [ ] **API-05** `POST /api/tickets/:id/items` — añadir items (bulk)
- [ ] **API-06** Validación Zod en todas las rutas
- [ ] **API-07** Rate limiting (Supabase edge function o middleware)

---

## SPRINT 1 — Auth + Landing + API Base (2 semanas)

### Objetivo: Usuario autenticado → ve landing real + puede crear tickets via API

| Tarea | Responsable | Estimación | Estado |
|---|---|---|---|
| [ ] **S1-01** Auth-01 a Auth-07 completados | | 3d | ⬜ |
| [ ] **S1-02** Landing-01 a Landing-03 (CMS real) | | 2d | ⬜ |
| [ ] **S1-03** API-01 a API-04 (Tickets CRUD) | | 2d | ⬜ |
| [ ] **S1-04** Integración mobile → API tickets (list + create) | | 1d | ⬜ |
| [ ] **S1-05** Tests unitarios: auth middleware, API validation | | 1d | ⬜ |
| [ ] **S1-06** Deploy preview Netlify + smoke test | | 0.5d | ⬜ |

**Definition of Done Sprint 1:**
- Login/logout funciona en web y mobile
- Landing se edita desde admin y se ve en producción
- Mobile puede escanear (mock) → crea ticket → aparece en lista
- CI pasa en PR

---

## SPRINT 2 — Admin Completo (2 semanas)

### Objetivo: Admin panel 100% funcional contra DB real

| Tarea | Responsable | Estimación | Estado |
|---|---|---|---|
| [ ] **S2-01** Providers CRUD real (DB + ModelPicker dinámico) | | 2d | ⬜ |
| [ ] **S2-02** Monitoring: queries Supabase reales (agregaciones SQL) | | 2d | ⬜ |
| [ ] **S2-03** Normalization queue real (pending/approve/reject → DB) | | 2d | ⬜ |
| [ ] **S2-04** Users management real (role toggle, delete cascade) | | 1d | ⬜ |
| [ ] **S2-05** Landing admin: JSON editor con validación schema | | 1d | ⬜ |
| [ ] **S2-06** Tests: admin pages (Playwright) | | 1d | ⬜ |

**Definition of Done Sprint 2:**
- Todas las páginas admin leen/escriben Supabase
- Monitoring muestra datos reales (no mock)
- Normalización aprueba/rechaza y persiste
- Usuarios se crean/borran con RLS

---

## SPRINT 3 — Mobile App Real (2 semanas)

### Objetivo: APK funcional con datos reales + OCR básico

| Tarea | Responsable | Estimación | Estado |
|---|---|---|---|
| [ ] **S3-01** Tickets list: fetch real `/api/tickets` + pull-to-refresh | | 1d | ⬜ |
| [ ] **S3-02** Análisis: Recharts (bar, line, pie) + datos Supabase | | 2d | ⬜ |
| [ ] **S3-03** Configuración: persistir preferencias en Supabase (user_preferences) | | 1d | ⬜ |
| [ ] **S3-04** Cámara: `@capacitor/camera` → imagen → `POST /api/tickets` | | 2d | ⬜ |
| [ ] **S3-05** OCR endpoint: `/api/ocr` (proveedor activo + modelo default) | | 2d | ⬜ |
| [ ] **S3-06** Categorización automática items → categorías enum | | 1d | ⬜ |
| [ ] **S3-07** Capacitor sync + build Android release + test device | | 1d | ⬜ |
| [ ] **S3-08** E2E mobile: login → scan → list → analysis | | 1d | ⬜ |

**Definition of Done Sprint 3:**
- APK instalable en Android real
- Escaneo → OCR → categorización → ticket guardado
- Análisis muestra gráficos con datos propios
- Settings persisten entre sesiones

---

## SPRINT 4 — IA Pipeline (2 semanas)

### Objetivo: Pipeline automático OCR → Categorización → Feedback → Re-entrenamiento

| Tarea | Responsable | Estimación | Estado |
|---|---|---|---|
| [ ] **S4-01** OCR endpoint robusto (retry, fallback providers, logging) | | 2d | ⬜ |
| [ ] **S4-02** Categorización LLM (prompt versionado, structured output Zod) | | 2d | ⬜ |
| [ ] **S4-03** Feedback UI mobile: corregir items → `feedback_images` | | 2d | ⬜ |
| [ ] **S4-04** Training job scheduler (pg_cron semanal) | | 1d | ⬜ |
| [ ] **S4-05** ModelPicker: fetch models dinámico + cache | | 1d | ⬜ |
| [ ] **S4-06** Métricas: accuracy OCR, categorización, cost tracking | | 1d | ⬜ |

**Definition of Done Sprint 4:**
- OCR > 95% accuracy en tickets test
- Categorización > 90% match admin
- Feedback loop guarda correcciones usuario
- Training job se ejecuta semanal

---

## SPRINT 5 — Hardening & Prod (1-2 semanas)

### Objetivo: Producción estable, observable, testeada

| Tarea | Responsable | Estimación | Estado |
|---|---|---|---|
| [ ] **S5-01** Tests unitarios: utils, ai, types, db (cobertura ≥80%) | | 2d | ⬜ |
| [ ] **S5-02** Tests integración: API routes, DB mutations | | 2d | ⬜ |
| [ ] **S5-03** Tests E2E: landing, admin CRUDs, mobile tabs (Playwright) | | 2d | ⬜ |
| [ ] **S5-04** CI/CD pipeline completo (lint → typecheck → test → build → deploy) | | 1d | ⬜ |
| [ ] **S5-05** Observabilidad: Sentry + logs estructurados + alertas | | 1d | ⬜ |
| [ ] **S5-06** Performance: bundle analysis, lazy loading, caching headers | | 1d | ⬜ |
| [ ] **S5-07** Security: CSP, rate limit, input sanitization, secrets audit | | 1d | ⬜ |
| [ ] **S5-08** Deploy prod: Netlify prod + Supabase prod + DNS custom | | 0.5d | ⬜ |
| [ ] **S5-09** Play Store: signed bundle, screenshots, listing, review | | 2d | ⬜ |

**Definition of Done Sprint 5:**
- CI/CD verde en main
- 0 critical vulnerabilities
- Lighthouse ≥90 en landing
- APK en Play Store (internal testing)

---

## DONE ✅

### Sprint 0 — Base Técnica (completado)
- [x] **S0-01** Monorepo Turborepo v2 + pnpm 9
- [x] **S0-02** Package `@ticketscan/ui` (9 componentes + CSS Modules)
- [x] **S0-03** Design tokens Tailwind v4 `@theme` (palette.ts)
- [x] **S0-04** Package `@ticketscan/db` (Drizzle schema 11 tablas)
- [x] **S0-05** Package `@ticketscan/types` (interfaces compartidas)
- [x] **S0-06** Package `@ticketscan/utils` (cn, formatters, etc.)
- [x] **S0-07** Package `@ticketscan/ai` (OpenRouter client)
- [x] **S0-08** Apps web (landing+admin+API) + mobile (Capacitor)
- [x] **S0-09** Netlify config (single site + proxy admin)
- [x] **S0-10** Build OK + push GitHub + SPEC-COMPLETO.md restaurado

---

## COMANDOS ÚTILES

```bash
# Ver tareas por sprint
grep -n "S1-" KANBAN.md
grep -n "S2-" KANBAN.md

# Mover tarea a Done: editar este archivo, cambiar `[ ]` → `[x]` y mover a sección DONE

# Stats rápidos
echo "Total: $(grep -c '\[ \]' KANBAN.md) | Done: $(grep -c '\[x\]' KANBAN.md)"
```

---

## SINCRONIZACIÓN GITHUB PROJECTS (opcional)

```bash
# Crear project (requiere gh CLI autenticado)
gh project create --owner kos0-CoL --title "TicketScan v2" --format json

# Crear issues desde este markdown (script aparte)
# Cada tarea → gh issue create --title "S1-01: Auth completo" --body "..." --label "sprint-1,auth"
```

---

> **Nota**: Este Kanban vive en `KANBAN.md` en la raíz del repo. Actualízalo al mover tareas. Para equipo >1 persona, migrar a GitHub Projects nativo.