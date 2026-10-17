# Estado del proyecto — TicketScan v2

> El agente lo lee al empezar cada sesión y lo actualiza al cerrar cada tarjeta. Si algo de acá no coincide con lo que muestra git, manda git: avisá la diferencia.

## Ahora

- Sprint: 0 — Base técnica (monorepo, verify, CI, tokens, utilidades y botón; faltan más componentes de UI y esquema de base)
- Tarjeta en curso: ninguna (S0-T09 cerrada; la próxima es S0-T10)
- Rama: `main`
- Último punto de retorno (tag verde): `s0-t09-ok` (entorno de componentes y Button)
- Modo: una tarjeta por vez

## Cómo volver al cauce

1. Frená al agente.
2. Mirá el daño: `git status` y `git diff --stat`.
3. Volvé al último tag verde con `git reset --hard <tag>` (si hay algo rescatable, antes `git stash`).
4. Abrí una sesión nueva y pedí: "Leé `docs/STATE.md` y la tarjeta `<ruta>`; hacé solo esto".

## Próximos pasos (propuestos, ajustalos)

1. S0-T10: Input, Textarea, Select, Card y Badge del UI kit.
2. S0-T11: Modal, ConfirmModal, Table y TabBar del UI kit.
3. S0-T12: esquema de la base de datos con Drizzle.
4. Sprint 1: a definir con el humano (auth, API base y landing).

## Decisiones tomadas

- La IA dentro de la app es multi-proveedor: desde el panel admin se agregan APIs (DeepSeek, OpenRouter, Gemini, etc.), se obtienen los modelos directo de cada API, se filtran (gratis o de pago) y, si se puede, se recomienda el mejor para cada tarea.
- Cada tarjeta sigue el mismo ritmo: rama, un pedido chico, `scope-check`, aprobación humana del diff, merge y tag.
- Por ahora no se suman plugins de orquestación; el tablero es Kanban.
- Mobile accede a los datos solo por la API propia (opción B); usa Supabase Auth únicamente para autenticarse.
- El sistema aprende con un diccionario de normalización alimentado por correcciones de los usuarios (comercio + texto del ítem + categoría), sin enviar imágenes; las aprueba el admin.
- TypeScript se mantiene en 6.0.x porque typescript-eslint no soporta TypeScript 7; se reevalúa cuando lo soporte.
- Los tokens de diseño viven en `packages/ui/src/theme.css` (con `@theme static`) y en `palette.ts`; un test impide que se desincronicen.
- La función `classNames` del spec no se implementa porque duplica `cn`. Idioma, moneda y fechas por defecto: `es-AR`, ARS y zona horaria de Buenos Aires.
- Los componentes del UI kit se prueban en jsdom con tests que escribe el humano; cada archivo de tests de componentes declara `// @vitest-environment jsdom`. `ModelPicker` se construye junto con el panel de proveedores de IA.

## Pendientes anotados

- Actualizar el spec: las apps usan `src/app/` y no `app/`.
- Revisar versiones nuevas (Next.js 16.4.0, Turborepo 2.11.7, `@types/node` 26.6.5) respetando la regla de los 14 días.

## Puntos de retorno (tags)

| Tag | Qué es | Fecha |
|---|---|---|
| `s0-base` | Reglas de trabajo y spec, antes de escribir código | |
| `s0-t01-ok` | Spec corregido (tarjeta S0-T01) | |
| `s0-t02-ok` | Spec de seguridad, privacidad y normalización colaborativa (tarjeta S0-T02) | |
| `s0-t03-ok` | Spec de IA: paquete, datos y panel admin (tarjeta S0-T03) | |
| `s0-t04-ok` | Spec de IA completa (tarjeta S0-T04) | |
| `s0-t05-ok` | Monorepo base que compila (tarjeta S0-T05) | |
| `s0-t06-ok` | pnpm verify y CI (tarjeta S0-T06) | |
| `s0-t07-ok` | Tokens de diseño y Tailwind v4 (tarjeta S0-T07) | |
| `s0-t08-ok` | Utilidades compartidas con tests (tarjeta S0-T08) | |
| `s0-t09-ok` | Entorno de componentes y Button (tarjeta S0-T09) | |
