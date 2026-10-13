# Estado del proyecto — TicketScan v2

> El agente lo lee al empezar cada sesión y lo actualiza al cerrar cada tarjeta. Si algo de acá no coincide con lo que muestra git, manda git: avisá la diferencia.

## Ahora

- Sprint: 0 — Base técnica (monorepo base con pnpm verify y CI; falta definir el Sprint 1)
- Tarjeta en curso: ninguna (S0-T06 cerrada; la próxima es el Sprint 1)
- Rama: `main`
- Último punto de retorno (tag verde): `s0-t06-ok` (pnpm verify y CI, sin funcionalidades)
- Modo: una tarjeta por vez

## Cómo volver al cauce

1. Frená al agente.
2. Mirá el daño: `git status` y `git diff --stat`.
3. Volvé al último tag verde con `git reset --hard <tag>` (si hay algo rescatable, antes `git stash`).
4. Abrí una sesión nueva y pedí: "Leé `docs/STATE.md` y la tarjeta `<ruta>`; hacé solo esto".

## Próximos pasos (propuestos, ajustalos)

1. Sprint 1: a definir con el humano (auth, API base y landing).
2. Reglas de ESLint específicas de Next y con información de tipos: cuando haga falta.

## Decisiones tomadas

- La IA dentro de la app es multi-proveedor: desde el panel admin se agregan APIs (DeepSeek, OpenRouter, Gemini, etc.), se obtienen los modelos directo de cada API, se filtran (gratis o de pago) y, si se puede, se recomienda el mejor para cada tarea.
- Cada tarjeta sigue el mismo ritmo: rama, un pedido chico, `scope-check`, aprobación humana del diff, merge y tag.
- Por ahora no se suman plugins de orquestación; el tablero es Kanban.
- Mobile accede a los datos solo por la API propia (opción B); usa Supabase Auth únicamente para autenticarse.
- El sistema aprende con un diccionario de normalización alimentado por correcciones de los usuarios (comercio + texto del ítem + categoría), sin enviar imágenes; las aprueba el admin.
- TypeScript se mantiene en 6.0.x porque typescript-eslint no soporta TypeScript 7; se reevalúa cuando lo soporte.

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
