# S0-T08 — Utilidades compartidas (`packages/utils`) con tests

- Sprint: 0
- Rama: `s0/t08-utilidades`

## Pedido

Implementar las funciones de `@ticketscan/utils` que describe el spec: `cn`, `formatCurrency`, `formatNumber`, `formatDate`, `formatDateTime`, `truncate`, `slugify`, `generateId`, `debounce` y `throttle`. Son las primeras funciones con lógica real del proyecto, y los componentes del UI kit las van a usar.

**Los tests ya están escritos por el humano y guardados en la rama** (cinco archivos `*.test.ts` en `packages/utils/src`). Tu trabajo es implementar cada función hasta que pasen. Los tests son la especificación: no se tocan.

Decisión del humano: la función `classNames` que menciona el spec **no se implementa**, porque duplica a `cn`.

## Reglas para esta tarjeta

- **No modifiques, no renombres y no borres ningún archivo `*.test.ts`.** Si un test te parece incorrecto o imposible de cumplir, frená y avisá: no lo arregles.
- Dependencias permitidas, y solo estas, en `packages/utils` (como `dependencies`): `clsx` en `2.1.1` y `tailwind-merge` en `3.7.0`. Versiones exactas, sin `^` ni `~`. Cualquier otra, frená y preguntá.
- Escribí las implementaciones simples, sin dependencias adicionales, con TypeScript estricto. No uses `any`, `@ts-ignore`, `@ts-expect-error` ni `eslint-disable`.
- Valores por defecto decididos por el humano: idioma `es-AR`, moneda `ARS` y zona horaria `America/Argentina/Buenos_Aires` (siempre se puede pasar otra). Una fecha inválida devuelve texto vacío y no lanza errores.
- Para cada tarea: corré primero el archivo de tests que le corresponde con `pnpm --filter @ticketscan/utils test` y comprobá que falla por falta de implementación; después implementá hasta que pase.
- Después de **cada** tarea corré `MAX_FILES=30 MAX_LINES=700 scripts/scope-check.sh docs/cards/S0-T08-utils.md` y mostrá la salida. Si falla, corregilo antes de seguir.
- Un commit por tarea. No edites la sección "Archivos permitidos" de esta tarjeta ni toques otras tarjetas ni el spec.

## Firmas

| Función | Firma | Comportamiento |
| --- | --- | --- |
| `cn` | `cn(...inputs: ClassValue[]): string` | Une clases con `clsx` y resuelve los conflictos de Tailwind con `tailwind-merge` |
| `formatCurrency` | `formatCurrency(value: number, currency = "ARS"): string` | Moneda con `Intl.NumberFormat` en `es-AR` |
| `formatNumber` | `formatNumber(value: number, fractionDigits?: number): string` | Número en `es-AR`; si se indica `fractionDigits`, fija esa cantidad exacta de decimales |
| `formatDate` | `formatDate(value: Date \| string \| number, timeZone = "America/Argentina/Buenos_Aires"): string` | Fecha `dd/mm/aaaa`; texto vacío si no es válida |
| `formatDateTime` | `formatDateTime(value: Date \| string \| number, timeZone = "America/Argentina/Buenos_Aires"): string` | Fecha y hora en 24 horas (`dd/mm/aaaa hh:mm`); texto vacío si no es válida |
| `truncate` | `truncate(text: string, max: number, ellipsis = "…"): string` | Si el texto entra en `max`, lo devuelve igual; si no, lo corta para que el resultado, con el sufijo, mida `max`; con `max` de 0 o menos devuelve texto vacío |
| `slugify` | `slugify(text: string): string` | Minúsculas, sin acentos, todo lo que no sea letra o número pasa a un solo guion, sin guiones en los bordes |
| `generateId` | `generateId(): string` | UUID v4 con `crypto.randomUUID()` |
| `debounce` | `debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number)` | Llama a `fn` una sola vez, con los últimos argumentos, cuando pasa `wait` sin nuevas llamadas; devuelve una función con el método `cancel()` |
| `throttle` | `throttle<A extends unknown[]>(fn: (...args: A) => void, wait: number)` | La primera llamada es inmediata; las que llegan dentro de la ventana de `wait` se juntan en una sola llamada final con los últimos argumentos |

## Tareas (un commit por tarea)

1. **Dependencias y `cn`.** Agregar `clsx` y `tailwind-merge` a `packages/utils/package.json` y crear `src/cn.ts`. Debe pasar `cn.test.ts`.
2. **Formatos.** Crear `src/format.ts` con `formatCurrency`, `formatNumber`, `formatDate` y `formatDateTime`. Debe pasar `format.test.ts`.
3. **Texto.** Crear `src/text.ts` con `truncate` y `slugify`. Debe pasar `text.test.ts`.
4. **Identificadores.** Crear `src/id.ts` con `generateId`. Debe pasar `id.test.ts`.
5. **Tiempos.** Crear `src/timing.ts` con `debounce` y `throttle`. Debe pasar `timing.test.ts`.
6. **Exportaciones y cierre.** Reescribir `src/index.ts` para que exporte todo lo anterior (`export * from "./cn"` y los demás módulos). Comprobar `pnpm install --frozen-lockfile` y `pnpm verify`, y actualizar `docs/STATE.md` como indica el final de esta tarjeta.

## Fuera de alcance

- La función `classNames`, y cualquier utilidad que no figure en la tabla de firmas.
- Modificar tests, el test de humo existente (`smoke.test.ts`) o la configuración de Vitest.
- Componentes, estilos, cambios al spec, al CI o a otras tarjetas.

## Archivos permitidos

- `pnpm-lock.yaml`
- `packages/utils/package.json`
- `packages/utils/src/index.ts`
- `packages/utils/src/cn.ts`
- `packages/utils/src/format.ts`
- `packages/utils/src/text.ts`
- `packages/utils/src/id.ts`
- `packages/utils/src/timing.ts`
- `packages/utils/src/cn.test.ts`
- `packages/utils/src/format.test.ts`
- `packages/utils/src/text.test.ts`
- `packages/utils/src/id.test.ts`
- `packages/utils/src/timing.test.ts`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta. Los archivos de tests figuran porque el humano los guardó en la rama; aun así no se tocan.)

## Criterios de aceptación

Desde la raíz del repo:

- [ ] `pnpm install --frozen-lockfile` y `pnpm verify` terminan sin errores, y `packages/utils` corre 33 tests que pasan (los 32 nuevos más el de humo).
- [ ] Los cinco archivos de tests quedaron idénticos a como los dejó el humano: la comparación contra el commit de los tests no muestra diferencias.
- [ ] `grep -rnE '"[^"]+": "[\^~]' package.json apps/*/package.json packages/*/package.json` no devuelve nada, y `packages/utils/package.json` declara `clsx` en `2.1.1` y `tailwind-merge` en `3.7.0`.
- [ ] `grep -rnE "eslint-disable|@ts-ignore|@ts-expect-error|: any|as any|classNames" packages/utils/src --include=*.ts --exclude=*.test.ts` no devuelve nada.
- [ ] `MAX_FILES=30 MAX_LINES=700 scripts/scope-check.sh docs/cards/S0-T08-utils.md` termina en OK.
- [ ] `git diff main --stat` muestra solo archivos permitidos más `docs/STATE.md`.

## Frená y preguntá si...

- Un test parece incorrecto, o falla por una diferencia del entorno (por ejemplo, el formato que devuelve `Intl` en tu versión de Node).
- Hace falta una dependencia que no está en la lista.
- Una tarea obliga a tocar archivos fuera de "Archivos permitidos".
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Sprint: 0 — Base técnica (monorepo, verify, CI, tokens y utilidades; faltan componentes de UI y esquema de base)`
- `- Tarjeta en curso: ninguna (S0-T08 cerrada; la próxima es S0-T09)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t08-ok` entre comillas invertidas y ` (utilidades compartidas con tests)`.
- Próximos pasos: "1. S0-T09: componentes base del UI kit.", "2. S0-T10: esquema de la base de datos con Drizzle." y "3. Sprint 1: a definir con el humano (auth, API base y landing)."
- En "Decisiones tomadas", agregar: "La función `classNames` del spec no se implementa porque duplica `cn`. Idioma, moneda y fechas por defecto: `es-AR`, ARS y zona horaria de Buenos Aires."
- Agregar a la tabla de tags la fila de `s0-t08-ok` ("Utilidades compartidas con tests (tarjeta S0-T08)") con sus tres celdas (tag, descripción y fecha vacía) y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
