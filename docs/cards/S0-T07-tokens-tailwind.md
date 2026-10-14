# S0-T07 — Tokens de diseño y Tailwind v4 en las dos apps

- Sprint: 0
- Rama: `s0/t07-tokens-tailwind`

## Pedido

Dejar la base visual del proyecto: los tokens de diseño del spec (colores, espacios, radios, sombras, transiciones, capas y la altura de la barra inferior) definidos una sola vez en `packages/ui`, y Tailwind v4 conectado a esos tokens en `apps/web` y `apps/mobile`. Un test impide que los dos archivos de tokens se desincronicen. Sin componentes todavía: eso viene en una tarjeta posterior.

## Reglas para esta tarjeta

- Dependencias permitidas, y solo estas:
  - `apps/web` y `apps/mobile`: `tailwindcss` y `@tailwindcss/postcss`, ambos en la versión exacta `4.3.3`, y `@ticketscan/ui` como `workspace:*`.
  - `packages/ui`: `vitest` en `5.0.2` y `@types/node` en `24.19.0`.
  - Cualquier otra, frená y preguntá.
- Versiones exactas, sin `^` ni `~`.
- No agregues `transpilePackages` ni importes código TypeScript de `@ticketscan/ui` desde las apps: las apps solo importan su CSS.
- Los tokens se declaran con `@theme static` (sin `static`, Tailwind descarta los tokens que no se usan en las clases y los CSS Modules no los verían).
- Si `pnpm install` falla o pnpm bloquea scripts de instalación, frená y avisá.
- Después de **cada** tarea corré `MAX_FILES=30 scripts/scope-check.sh docs/cards/S0-T07-tokens-tailwind.md` y mostrá la salida. Si falla, corregilo antes de seguir.
- Corré también `pnpm verify` después de las tareas 3, 4 y 5.
- No edites la sección "Archivos permitidos" de esta tarjeta ni toques otras tarjetas ni el spec.

## Tokens (valores definidos por el humano)

- Colores: `--color-primary: #00ABE4`, `--color-accent: #F59E0B`, `--color-success: #10B981`, `--color-warning: #F59E0B`, `--color-danger: #EF4444`.
- Espacios: `--space-1: 0.25rem`, `--space-2: 0.5rem`, `--space-3: 0.75rem`, `--space-4: 1rem`, `--space-5: 1.25rem`, `--space-6: 1.5rem`, `--space-8: 2rem`, `--space-10: 2.5rem`, `--space-12: 3rem`, `--space-16: 4rem`, `--space-20: 5rem`, `--space-24: 6rem`.
- Radios: `--radius-sm: 0.25rem`, `--radius-md: 0.5rem`, `--radius-lg: 0.75rem`, `--radius-xl: 1rem`, `--radius-full: 9999px`.
- Sombras: `--shadow-card: 0 1px 3px rgb(0 0 0 / 0.08)`, `--shadow-float: 0 8px 24px rgb(0 0 0 / 0.16)`, `--shadow-primary: 0 4px 14px rgb(0 171 228 / 0.35)`.
- Transiciones: `--transition-fast: 120ms ease`, `--transition-base: 200ms ease`, `--transition-slow: 320ms ease`.
- Capas: `--z-sticky: 10`, `--z-fixed: 20`, `--z-modal: 50`.
- Barra inferior: `--tab-bar-height: 3.5rem`.

## Tareas (un commit por tarea)

1. **Tokens en `packages/ui`.** Crear `src/theme.css` con un único bloque `@theme static { ... }` que declare todos los tokens de arriba, uno por línea con el formato `--nombre: valor;`. Crear `src/palette.ts` con una constante `tokens` (objeto de nombre de variable a valor, por ejemplo `"--color-primary": "#00ABE4"`) con exactamente los mismos tokens y valores, y exportarla desde `src/index.ts`.
2. **Configuración del paquete y test.** En `packages/ui/package.json`: agregar `exports` con `"."` apuntando a `./src/index.ts` y `"./theme.css"` apuntando a `./src/theme.css`, los dos devDependencies y el script `test` (`vitest run`). En `packages/ui/tsconfig.json` agregar `"types": ["node"]` en `compilerOptions`. Crear `src/palette.test.ts` que lea `theme.css` con `node:fs` y compruebe, en los dos sentidos, que cada token de `tokens` aparece en el CSS como `--nombre: valor;` y que cada variable declarada en el CSS existe en `tokens`.
3. **Tailwind en `apps/web`.** Agregar las tres dependencias, un `postcss.config.mjs` que use el plugin `@tailwindcss/postcss`, un `src/app/globals.css` con dos líneas (`@import "tailwindcss";` y `@import "@ticketscan/ui/theme.css";`) y que `src/app/layout.tsx` importe `./globals.css`.
4. **Tailwind en `apps/mobile`.** Lo mismo que en la tarea 3, en `apps/mobile`.
5. **Prueba visible.** Agregar a la etiqueta `<main>` de `apps/web/src/app/(public)/page.tsx` y de `apps/mobile/src/app/page.tsx` las clases `bg-primary p-4 text-white rounded-md shadow-card`, sin cambiar los textos. Comprobar con el build que el CSS generado contiene los tokens: `--color-primary:#00abe4` y `--tab-bar-height:3.5rem`, y las clases `.bg-primary` y `.shadow-card`.
6. **Cierre.** Comprobar `pnpm install --frozen-lockfile` y `pnpm verify` una última vez, y actualizar `docs/STATE.md` como indica el final de esta tarjeta.

## Fuera de alcance

- Componentes (Button, Input, Modal, etc.), tipografías, modo oscuro, colores neutros y de texto.
- Que `apps` importen código TypeScript de `@ticketscan/ui`.
- Cambios al spec, al CI o a otras tarjetas.

## Archivos permitidos

- `pnpm-lock.yaml`
- `packages/ui/package.json`
- `packages/ui/tsconfig.json`
- `packages/ui/src/index.ts`
- `packages/ui/src/palette.ts`
- `packages/ui/src/theme.css`
- `packages/ui/src/palette.test.ts`
- `apps/web/package.json`
- `apps/web/postcss.config.mjs`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/(public)/page.tsx`
- `apps/mobile/package.json`
- `apps/mobile/postcss.config.mjs`
- `apps/mobile/src/app/globals.css`
- `apps/mobile/src/app/layout.tsx`
- `apps/mobile/src/app/page.tsx`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta.)

## Criterios de aceptación

Desde la raíz del repo:

- [ ] `pnpm install --frozen-lockfile` y `pnpm verify` terminan sin errores, y el test de `packages/ui` corre y pasa.
- [ ] `grep -rnE '"[^"]+": "[\^~]' package.json apps/*/package.json packages/*/package.json` no devuelve nada.
- [ ] `grep -n "tailwindcss" apps/web/package.json apps/mobile/package.json` muestra `4.3.3` para `tailwindcss` y para `@tailwindcss/postcss` en las dos apps.
- [ ] `grep -c "@theme static" packages/ui/src/theme.css` devuelve 1.
- [ ] Después de `pnpm build`, el CSS generado de cada app (en `.next/static/chunks/*.css`) contiene `--color-primary:#00abe4`, `--tab-bar-height:3.5rem`, `.bg-primary` y `.shadow-card`.
- [ ] `MAX_FILES=30 scripts/scope-check.sh docs/cards/S0-T07-tokens-tailwind.md` termina en OK.
- [ ] `git diff main --stat` muestra solo archivos permitidos más `docs/STATE.md`, y no toca el CI, el spec ni `eslint.config.mjs`.

## Frená y preguntá si...

- Hace falta una dependencia que no está en la lista, o aparecen conflictos de peer dependencies.
- Tailwind o Next requieren otra configuración que la descrita (por ejemplo `transpilePackages`).
- El build falla y la solución implicaría tocar algo fuera de "Archivos permitidos".
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Sprint: 0 — Base técnica (monorepo, verify, CI y tokens de diseño; faltan componentes de UI y esquema de base)`
- `- Tarjeta en curso: ninguna (S0-T07 cerrada; la próxima es S0-T08)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t07-ok` entre comillas invertidas y ` (tokens de diseño y Tailwind v4)`.
- Próximos pasos: "1. S0-T08: utilidades compartidas (`cn` y formatos) con tests en `packages/utils`.", "2. S0-T09: componentes base del UI kit.", "3. S0-T10: esquema de la base de datos con Drizzle." y "4. Sprint 1: a definir con el humano (auth, API base y landing)."
- En "Decisiones tomadas", agregar: "Los tokens de diseño viven en `packages/ui/src/theme.css` (con `@theme static`) y en `palette.ts`; un test impide que se desincronicen."
- Agregar a la tabla de tags la fila de `s0-t07-ok` ("Tokens de diseño y Tailwind v4 (tarjeta S0-T07)") con sus tres celdas (tag, descripción y fecha vacía) y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
