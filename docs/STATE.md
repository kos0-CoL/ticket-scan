# Estado del proyecto — TicketScan v2

> El agente lo lee al empezar cada sesión y lo actualiza al cerrar cada tarjeta. Si algo de acá no coincide con lo que muestra git, manda git: avisá la diferencia.

## Ahora

- Sprint: 0 — Base técnica (se reconstruye: el repo estaba vacío, no hay código todavía)
- Tarjeta en curso: S0-T01 — Corregir el spec (solo documentos)
- Rama: `s0/t01-corregir-spec`
- Último punto de retorno (tag verde): `s0-base` (reglas de trabajo y spec, sin código)
- Modo: una tarjeta por vez

## Cómo volver al cauce

1. Frená al agente.
2. Mirá el daño: `git status` y `git diff --stat`.
3. Volvé al último tag verde con `git reset --hard <tag>` (si hay algo rescatable, antes `git stash`).
4. Abrí una sesión nueva y pedí: "Leé `docs/STATE.md` y la tarjeta `<ruta>`; hacé solo esto".

## Próximos pasos (propuestos, ajustalos)

1. Cerrar S0-T01: corregir el spec (el "Sprint 0 ✅" no es cierto; rutas del admin, auth del mobile, IA multi-proveedor, seguridad).
2. S0-T02: crear el monorepo base (Turborepo + pnpm, apps y packages vacíos que compilen).
3. S0-T03: crear `pnpm verify` (lint, typecheck, test, build) y un CI mínimo.

## Decisiones tomadas

- La IA dentro de la app es multi-proveedor: desde el panel admin se agregan APIs (DeepSeek, OpenRouter, Gemini, etc.), se obtienen los modelos directo de cada API, se filtran (gratis o de pago) y, si se puede, se recomienda el mejor para cada tarea.
- Cada tarjeta sigue el mismo ritmo: rama, un pedido chico, `scope-check`, aprobación humana del diff, merge y tag.
- Por ahora no se suman plugins de orquestación; el tablero es Kanban.

## Puntos de retorno (tags)

| Tag | Qué es | Fecha |
| --- | --- | --- |
| `s0-base` | Reglas de trabajo y spec, antes de escribir código | |
