# S0-T05 — Monorepo base que compila (primera tarjeta con código)

- Sprint: 0
- Rama: `s0/t05-monorepo-base`

## Pedido

Crear el esqueleto mínimo del monorepo descrito en `docs/specs/00-vision.md`: Turborepo con pnpm, dos apps (`apps/web` y `apps/mobile`) y cinco paquetes (`ui`, `db`, `types`, `utils`, `ai`), todo vacío de funcionalidad pero compilando. Sin Tailwind, sin Supabase, sin Drizzle, sin Capacitor y sin ninguna pantalla real: eso llega en tarjetas posteriores. La versión mayor de Next.js es la 16 (la 15 termina su soporte el 21 de octubre de 2026). Esta tarjeta autoriza instalar únicamente las dependencias de la lista de abajo.

## Reglas para esta tarjeta

- Dependencias permitidas, y solo estas: `turbo`, `typescript`, `next`, `react`, `react-dom`, `@types/react`, `@types/react-dom` y `@types/node`. Cualquier otra, frená y preguntá.
- Versiones exactas, sin `^` ni `~`. Para cada paquete, verificá con `pnpm view <paquete> version` la última versión estable y su fecha de publicación; si se publicó en los últimos 14 días, usá la anterior. Next.js debe ser de la serie 16, y `react` y `react-dom` las que Next pida.
- El gestor es `pnpm@12.8.1` (campo `packageManager` del `package.json` raíz). El mínimo de Node va en `engines`, según la documentación de la versión de Next elegida.
- No uses `create-next-app` ni plantillas. Escribí los archivos a mano, lo más chicos posible: sin imágenes, sin estilos de ejemplo.
- No crees archivos `.env`.
- Si `pnpm install` falla por red o permisos, frená y avisá: lo corre el humano. Si pnpm informa scripts de instalación bloqueados o ignorados, frená también: aprobar esos scripts es decisión del humano.
- Después de **cada** tarea corré `MAX_FILES=60 scripts/scope-check.sh docs/cards/S0-T05-monorepo-base.md` y mostrá la salida. Si falla, corregilo antes de seguir. Con la tarea 1 corré además `scripts/spec-check.sh docs/specs/00-vision.md`.
- No edites la sección "Archivos permitidos" de esta tarjeta ni toques otras tarjetas.

## Tareas (un commit por tarea)

1. **Versiones en el spec.** En `docs/specs/00-vision.md`, reemplazar toda mención de "Next.js 15" por "Next.js 16" y de "pnpm 9" por "pnpm 12". No cambiar nada más del documento.
2. **`.gitignore`.** Crearlo antes de instalar nada. Debe ignorar: `node_modules/`, `.next/`, `out/`, `.turbo/`, `dist/`, `coverage/`, `*.tsbuildinfo`, `next-env.d.ts`, `.netlify/`, `android/app/build/`, `.env` y `.env.*` (con excepción de `.env.example`), `*.pem`, `*.key`, `*.keystore` y `*.jks`.
3. **Raíz del workspace.** `package.json` (privado, con `packageManager`, `engines` y los scripts `build` y `typecheck` que ejecutan Turborepo), `pnpm-workspace.yaml` (`apps/*` y `packages/*`), `turbo.json` (tareas `build` y `typecheck`) y `tsconfig.base.json` (TypeScript estricto, compartido). Dependencias de la raíz: `turbo` y `typescript`.
4. **Cinco paquetes vacíos.** En `packages/ui`, `packages/db`, `packages/types`, `packages/utils` y `packages/ai`: un `package.json` (privado, nombre `@ticketscan/<paquete>`, versión `0.0.0`, con `main` y `types` apuntando a `src/index.ts` y un script `typecheck`), un `tsconfig.json` que extiende el base y un `src/index.ts` con `export {};`. Sin dependencias.
5. **`apps/web`.** App mínima de Next.js: `package.json`, `tsconfig.json`, la configuración de Next más chica posible, `app/layout.tsx`, `app/(public)/page.tsx` con el texto "TicketScan" y `app/admin/page.tsx` con el texto "Admin". Con esto queda probado que `/` y `/admin` no chocan.
6. **`apps/mobile`.** App mínima de Next.js con `output: 'export'`: `package.json`, `tsconfig.json`, la configuración de Next, `app/layout.tsx` y `app/page.tsx` con el texto "TicketScan Mobile". Sin Capacitor.
7. **Instalar y verificar.** Correr `pnpm install`, versionar `pnpm-lock.yaml` y comprobar que `pnpm typecheck` y `pnpm build` terminan sin errores.

## Fuera de alcance

- Tailwind, tokens, componentes del UI kit, Supabase, Drizzle, Zod, Capacitor, ESLint, tests y CI (tarjetas posteriores).
- Que las apps importen los paquetes: eso lo resuelve la tarjeta que los llene.
- Autenticación, páginas reales, textos de producto o estilos.
- Tocar cualquier archivo que no figure en "Archivos permitidos".

## Archivos permitidos

- `docs/specs/00-vision.md`
- `.gitignore`
- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `apps/**`
- `packages/**`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta. De `docs/specs/00-vision.md` solo se toca lo que pide la tarea 1.)

## Criterios de aceptación

Desde la raíz del repo:

- [ ] `pnpm install --frozen-lockfile` termina sin errores.
- [ ] `pnpm typecheck` y `pnpm build` terminan sin errores; el build de `apps/mobile` genera la carpeta `out/`.
- [ ] `ls apps packages` muestra `web` y `mobile`, y los cinco paquetes.
- [ ] `grep -n packageManager package.json` muestra `pnpm@12.8.1`.
- [ ] `grep -rnE '"[^"]+": "[\^~]' package.json apps/*/package.json packages/*/package.json` no devuelve nada (versiones exactas).
- [ ] `git check-ignore node_modules apps/web/.next apps/mobile/out .turbo` lista las cuatro rutas.
- [ ] `git ls-files | grep -E "node_modules|\.next/|^out/|\.env"` no devuelve nada.
- [ ] En `apps/web` existen `app/(public)/page.tsx` y `app/admin/page.tsx`, y el build no reporta rutas duplicadas.
- [ ] `grep -c "Next.js 15" docs/specs/00-vision.md` y `grep -c "pnpm 9" docs/specs/00-vision.md` devuelven 0, y `scripts/spec-check.sh docs/specs/00-vision.md` termina en OK.
- [ ] `MAX_FILES=60 scripts/scope-check.sh docs/cards/S0-T05-monorepo-base.md` termina en OK.
- [ ] `git diff main --stat` muestra solo archivos permitidos más `docs/STATE.md`.

## Frená y preguntá si...

- Hace falta una dependencia que no está en la lista, o pnpm bloquea scripts de instalación.
- La versión de Next elegida exige otra versión mayor de Node o de React que la esperada.
- El build falla y la solución implicaría tocar algo fuera de "Archivos permitidos".
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Sprint: 0 — Base técnica (monorepo base creado; faltan `pnpm verify` y el CI)`
- `- Tarjeta en curso: ninguna (S0-T05 cerrada; la próxima es S0-T06)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t05-ok` entre comillas invertidas y ` (monorepo base que compila, sin funcionalidades)`.
- Próximos pasos: "1. S0-T06: crear `pnpm verify` (lint, typecheck, test, build) y un CI mínimo." y "2. Sprint 1: a definir con el humano (auth, API base y landing)."
- Agregar a la tabla de tags la fila de `s0-t05-ok` ("Monorepo base que compila (tarjeta S0-T05)") con sus tres celdas (tag, descripción y fecha vacía) y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
