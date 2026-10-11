# AGENTS.md — TicketScan v2

Reglas para cualquier agente que trabaje en este repo. Son cortas a propósito: leelas completas antes de tocar nada.

## Qué es el proyecto

App para escanear tickets de compra: landing, panel admin y app mobile (Android) sobre un monorepo. El detalle está en `docs/specs/`. Las versiones exactas están en cada `package.json`: no las asumas de memoria, consultá la documentación actual.

- Monorepo Turborepo + pnpm: `apps/web` (landing, admin y API), `apps/mobile` (Next.js exportado estático + Capacitor) y `packages/{ui,db,types,utils,ai}`.
- Next.js (App Router), React, Tailwind v4 (tokens con `@theme`; no existe `tailwind.config`) y CSS Modules.
- Supabase (Postgres y Auth) + Drizzle. Deploy en Netlify.

## Cómo trabajamos (siempre)

1. Una tarjeta por vez. Al empezar, leé `docs/STATE.md` y la tarjeta que te indiquen (`docs/cards/`). Si no te dieron tarjeta, pedila: no inventes trabajo.
2. Tocá solo los archivos de "Archivos permitidos" de la tarjeta (más `docs/STATE.md` y la propia tarjeta).
3. Trabajá en la rama de la tarjeta, nunca en `main`. Un commit por cada tarea chica, con mensaje claro.
4. Antes de decir "listo", corré `scripts/scope-check.sh <tarjeta>` y la verificación (`pnpm verify`). Mostrá el resultado real, sin resumirlo.
   - Si `pnpm verify` todavía no existe, no lo inventes: corré los scripts sueltos que existan (lint, typecheck, test, build) y avisalo.
5. Al cerrar, actualizá `docs/STATE.md` y reportá con este formato: Qué hice · Archivos tocados · Resultado de scope-check y verify · Dudas o pendientes.
6. No hagas merge, tag ni push a `main`. Eso lo hace el humano después de revisar el diff.

## Frená y preguntá (no decidas solo) si

- Necesitás tocar un archivo fuera de "Archivos permitidos".
- Hace falta una dependencia nueva.
- Hay que cambiar el schema de la base, una migración, auth, roles o RLS y la tarjeta no lo pide.
- Un criterio de aceptación es ambiguo o contradice el spec.
- El mismo arreglo falló 2 veces.
- El cambio supera unos 15 archivos o unas 400 líneas.
- Implica deploy, producción o datos reales.

Frenar no es fallar: dejá escrito qué necesitás y esperá.

## Prohibido siempre

- Subir secretos o archivos `.env*` (salvo `.env.example` con valores falsos), claves o keystores.
- Poner `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY` o cualquier key de proveedor de IA en código de cliente o en variables `NEXT_PUBLIC_*`.
- Deploy a producción o migraciones contra producción. Con los MCP de Netlify y Supabase: solo previews y el proyecto de desarrollo.
- `git push --force`, `git reset --hard`, borrar ramas o tags.
- Instalar plugins o paquetes nuevos sin que te lo pidan.
- Editar la sección "Archivos permitidos" de la tarjeta, o tocar, crear o borrar archivos de otras tarjetas.
- Bajar tests, desactivar checks o mockear lógica de negocio para que algo "pase".

## Convenciones

- Estilos: CSS Modules + tokens de `packages/ui/src/palette.ts` (se exponen vía `@theme`). Sin `tailwind.config`.
- Componentes compartidos en `packages/ui` (exportados desde su `index.ts`), tipos en `@ticketscan/types` y utilidades en `@ticketscan/utils`.
- Base de datos: todo cambio en `packages/db` lleva migración y policy RLS, y pasa por la tarjeta que lo autoriza.
- IA dentro de la app: es multi-proveedor. Las API keys se cargan desde el panel admin, se guardan cifradas y no viajan al navegador. No dejes proveedores ni modelos fijos en el código.
- Textos de interfaz en español (es-AR), con moneda y fechas en formato local.

## Verificar sin ver la pantalla

No dependas de capturas de pantalla. Verificá la interfaz con tests sobre el DOM (textos, roles, estados) y con comandos.
