# S0-T06 — `pnpm verify` y CI mínimo (con TypeScript 6.0.x)

- Sprint: 0
- Rama: `s0/t06-verify-ci`

## Pedido

Dejar un único comando, `pnpm verify`, que corra lint, chequeo de tipos, tests y build de todo el monorepo, y un CI en GitHub Actions que lo ejecute en cada push y en cada pull request. De paso se alinean las versiones: TypeScript vuelve a la serie 6.0.x (la 7 rompe ESLint, porque typescript-eslint todavía no la soporta) y `@types/node` pasa a la serie 24, la de tu Node. No se escribe ninguna funcionalidad.

## Reglas para esta tarjeta

- Dependencias permitidas, y solo estas:
  - Raíz: `typescript` (serie 6.0.x), `eslint`, `@eslint/js` y `typescript-eslint`.
  - `apps/web` y `apps/mobile`: `typescript` (serie 6.0.x) y `@types/node` (serie 24).
  - `packages/utils`: `vitest`.
  - Cualquier otra, frená y preguntá.
- Versiones exactas, sin `^` ni `~`. Para cada paquete, verificá con `pnpm view <paquete> version` la última versión estable de la serie pedida y su fecha de publicación; si se publicó en los últimos 14 días, usá la anterior. `typescript` debe ser la misma versión exacta en todos los `package.json`.
- Antes de instalar, comprobá que la versión elegida de `typescript-eslint` acepte TypeScript 6.0.x (campo `peerDependencies`). Si pnpm informa conflictos de peer dependencies o scripts de instalación bloqueados, frená: decidirlo es del humano.
- El lint no debe pasar apagando reglas: si hay errores, corregí el código mínimo; si no podés, frená.
- Si `pnpm install` falla por red o permisos, frená y avisá: lo corre el humano.
- Acciones de GitHub: fijalas por el SHA completo del commit de su etiqueta de versión mayor, que obtenés con `git ls-remote https://github.com/<dueño>/<repo> refs/tags/<etiqueta>`. Si no hay red, usá la etiqueta de versión mayor, dejá un comentario `# TODO: fijar SHA` y avisá en tu reporte.
- Después de **cada** tarea corré `scripts/scope-check.sh docs/cards/S0-T06-verify-ci.md` y mostrá la salida. Si falla, corregilo antes de seguir.
- No edites la sección "Archivos permitidos" de esta tarjeta ni toques otras tarjetas ni el spec.

## Tareas (un commit por tarea)

1. **Alinear TypeScript y tipos.** Poner `typescript` en la serie 6.0.x (misma versión exacta) en la raíz y en las dos apps, y `@types/node` en la serie 24 en las apps. Agregar a cada app el script `typecheck` con `tsc --noEmit`. Correr `pnpm install`, y comprobar que `pnpm typecheck` (ahora sobre 7 paquetes) y `pnpm build` pasan.
2. **ESLint.** Agregar a la raíz `eslint`, `@eslint/js` y `typescript-eslint`; crear `eslint.config.mjs` (formato flat) con las reglas recomendadas de JavaScript y de TypeScript, sin reglas que usen información de tipos, ignorando `**/node_modules/**`, `**/.next/**`, `**/out/**`, `**/.turbo/**`, `**/dist/**` y `**/next-env.d.ts`. Agregar el script raíz `lint` con `eslint .`. Debe terminar sin errores.
3. **Vitest.** Agregar `vitest` a `packages/utils` con el script `test` (`vitest run`), y un único test de humo en `packages/utils/src/smoke.test.ts` que importe `./index` y compruebe que el módulo carga. Agregar la tarea `test` a `turbo.json` y el script raíz `test` con `turbo run test`.
4. **`pnpm verify`.** Agregar el script raíz `verify` con `pnpm lint && turbo run typecheck test build`, y comprobar que corre completo sin errores.
5. **CI.** Crear `.github/workflows/ci.yml` con un solo trabajo `verify`:
   - Se dispara en `push` a cualquier rama y en `pull_request`.
   - `permissions` con solo `contents: read`, `concurrency` que cancele corridas repetidas de la misma rama y `timeout-minutes` de 15.
   - Pasos: checkout, instalar pnpm con la versión del campo `packageManager`, configurar Node 24 con caché de pnpm, `pnpm install --frozen-lockfile` y `pnpm verify`.
   - Sin secretos, sin deploy y sin pasos que escriban en el repo.
6. **Cierre.** Comprobar `pnpm install --frozen-lockfile` y `pnpm verify` una última vez, y actualizar `docs/STATE.md` como indica el final de esta tarjeta.

## Fuera de alcance

- Reglas de ESLint específicas de Next o con información de tipos, Prettier, Tailwind, Supabase, Drizzle y Capacitor (tarjetas posteriores).
- Más tests que el de humo, cobertura y tests de integración.
- Deploy, variables de entorno y secretos en el CI.
- Cambios al spec o a otras tarjetas.

## Archivos permitidos

- `package.json`
- `pnpm-lock.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `eslint.config.mjs`
- `.github/workflows/ci.yml`
- `apps/web/package.json`
- `apps/mobile/package.json`
- `packages/*/package.json`
- `packages/utils/src/smoke.test.ts`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta.)

## Criterios de aceptación

Desde la raíz del repo:

- [ ] `pnpm install --frozen-lockfile` termina sin errores.
- [ ] `pnpm verify` termina con código 0 y muestra el lint, el typecheck de 7 paquetes, 1 test y el build de las dos apps.
- [ ] `grep -rn '"typescript"' package.json apps/*/package.json packages/*/package.json` muestra la misma versión `6.0.x` en todas las líneas.
- [ ] `grep -rn '"@types/node"' apps/*/package.json` muestra versiones de la serie `24`.
- [ ] `grep -rnE '"[^"]+": "[\^~]' package.json apps/*/package.json packages/*/package.json` no devuelve nada.
- [ ] `grep -n '"verify"' package.json` y `grep -n '"typecheck"' apps/web/package.json apps/mobile/package.json` devuelven líneas.
- [ ] `.github/workflows/ci.yml` existe, contiene `pnpm verify`, `--frozen-lockfile`, `permissions`, `timeout-minutes` y `concurrency`, y `grep -n "secrets" .github/workflows/ci.yml` no devuelve nada.
- [ ] Revisión humana de `git diff main -- package.json apps/*/package.json packages/*/package.json`: no hay dependencias fuera de la lista.
- [ ] `scripts/scope-check.sh docs/cards/S0-T06-verify-ci.md` termina en OK.
- [ ] `git diff main --stat` no muestra cambios en el spec ni en otras tarjetas.

## Frená y preguntá si...

- Hace falta una dependencia que no está en la lista, o aparecen conflictos de peer dependencies.
- ESLint o Vitest no son compatibles con TypeScript 6.0.x o con Node 24, o pnpm bloquea scripts de instalación.
- Para que el lint pase habría que apagar reglas o tocar archivos fuera de "Archivos permitidos".
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Sprint: 0 — Base técnica (monorepo base con pnpm verify y CI; falta definir el Sprint 1)`
- `- Tarjeta en curso: ninguna (S0-T06 cerrada; la próxima es el Sprint 1)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t06-ok` entre comillas invertidas y ` (pnpm verify y CI, sin funcionalidades)`.
- Próximos pasos: "1. Sprint 1: a definir con el humano (auth, API base y landing)." y "2. Reglas de ESLint específicas de Next y con información de tipos: cuando haga falta."
- En "Decisiones tomadas", agregar: "TypeScript se mantiene en 6.0.x porque typescript-eslint no soporta TypeScript 7; se reevalúa cuando lo soporte."
- En "Pendientes anotados", quitar los tres ítems resueltos (alinear `@types/node`, agregar el script `typecheck` a las apps y la nota de TypeScript 7.0.2), y dejar los otros dos.
- Agregar a la tabla de tags la fila de `s0-t06-ok` ("pnpm verify y CI (tarjeta S0-T06)") con sus tres celdas (tag, descripción y fecha vacía) y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
