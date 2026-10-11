# S0-T03 — IA multi-proveedor (1 de 2): paquete, datos y panel admin (solo documentos)

- Sprint: 0
- Rama: `s0/t03-ia-multiproveedor`

## Pedido

Dejar en `docs/specs/00-vision.md` definida la base de la IA multi-proveedor, que reemplaza al cliente fijo de OpenRouter con 9 modelos: el paquete `@ticketscan/ai`, las tablas nuevas y la pantalla del panel admin. El admin agrega una API (DeepSeek, OpenRouter, Gemini, etc.) con su key, trae los modelos directo de esa API y los filtra. La segunda parte (contrato de API, reglas de precio y recomendación, pipeline, checklist y entorno) va en la tarjeta S0-T04. De paso se ordenan dos restos de la tarjeta anterior. Se edita un solo archivo y no se escribe código.

## Reglas para esta tarjeta

- Antes de editar una sección, mirá su texto actual y reemplazá solo lo necesario. No copies bloques completos ni los pegues dos veces: cada sección del spec debe existir una sola vez.
- No borres ítems de checklists, filas de tablas ni líneas de listas existentes. Si algo queda obsoleto, tachalo con `~~texto~~` y agregá `(reemplazado por X)` o `(pospuesto)` en la misma línea.
- En las tablas, cada fila tiene exactamente las columnas del encabezado, todo en una sola línea, sin saltos de línea dentro de las celdas y **sin líneas en blanco dentro de la tabla**. Las filas nuevas van pegadas a la última fila existente. Una nota va debajo de la tabla, no en una celda extra.
- Después de **cada** tarea, corré `scripts/spec-check.sh docs/specs/00-vision.md` y `scripts/scope-check.sh docs/cards/S0-T03-ia-multiproveedor.md` y mostrá la salida. Si alguno falla, corregilo antes de pasar a la tarea siguiente; si no podés, frená y avisá.
- No toques las secciones "Decisiones abiertas", "Seguridad y RLS" ni "Contrato de API para mobile".

## Tareas (un commit por tarea)

1. **Paquete `@ticketscan/ai` y tipos.** Reemplazar el cliente de OpenRouter por una interfaz común con `listModels`, `chat`, `vision` y `structured`. Un adapter genérico compatible con OpenAI cubre DeepSeek, OpenRouter y varios más; Gemini y Anthropic tienen adapters nativos porque usan otro formato. El código no lleva proveedores ni modelos fijos. Tachar `OpenRouterClient` y la lista de "9 modelos predefinidos", con la nota de que ahora los modelos se sincronizan desde cada proveedor. En `@ticketscan/types`, tachar `MLProvider`, `MLConfig`, `MLProviderWithModels` y `MLModel` (reemplazados por `AiProvider`, `AiModel`, `AiTaskRoute` y `AiModelEvaluation`), y tachar `User` (reemplazado por `Profile`).
2. **Datos.** Agregar a la tabla del schema, pegadas a la fila de `normalization_rules`, las filas de `ai_providers`, `ai_models`, `ai_task_routes` y `ai_model_evaluations`, cada una con 3 celdas (Tabla, Clave, Índices). Debajo de la tabla, en una lista, describir los campos de cada tabla nueva: `ai_providers` (nombre, tipo, base URL, key cifrada, estado, orden de fallback, tope mensual); `ai_models` (proveedor, id del modelo, nombre, contexto, modalidades de entrada, precios de entrada y salida, origen del precio, si es gratis, si soporta visión, si soporta salida estructurada, fecha de sincronización, habilitado); `ai_task_routes` (tarea, modelo principal y fallbacks); `ai_model_evaluations` (modelo, tarea, puntaje, cantidad de muestras, fecha). Agregar los enums (tipo de proveedor: `openai_compatible`, `gemini`, `anthropic`, `openrouter`, `custom`; origen del precio: `api`, `manual`, `unknown`). En la línea de relaciones, tachar `ml_providers→configs` y agregar las relaciones de las tablas nuevas. Cambiar el título de la sección a "Drizzle Schema (10 tablas activas, 3 pospuestas y 2 reemplazadas)". Además, la fila de `normalization_queue` pasa a describir una corrección sin ticket: comercio, texto crudo del ítem, categoría elegida y estado (sin `ticket_id`); si se guarda o no un identificador de quien corrige sigue siendo una decisión abierta.
3. **Panel admin.** Reescribir la fila "Proveedores IA" de la tabla del Admin Panel: la pantalla tiene tres pestañas (Proveedores, Modelos y Rutas por tarea). Proveedores: alta con probar conexión, edición, activar o desactivar, orden de fallback y tope mensual. Modelos: botón de sincronizar desde la API del proveedor y filtros por gratis o de pago, visión, salida estructurada, contexto y proveedor. Rutas por tarea: modelo principal y fallbacks para OCR, categorización y normalización, con la recomendación a la vista. Actualizar la fila de `ModelPicker` en la tabla de componentes: lee del caché de modelos sincronizados y admite esos filtros.

## Fuera de alcance

- El contrato de API admin de IA, la sección "IA configurable desde el admin", el pipeline, el checklist, las variables de entorno y las decisiones abiertas nuevas: van en S0-T04.
- Escribir código, crear carpetas del monorepo o instalar paquetes.
- Nombrar proveedores o modelos concretos como parte del diseño (solo como ejemplos).
- Tocar cualquier archivo que no sea `docs/specs/00-vision.md`.

## Archivos permitidos

- `docs/specs/00-vision.md`
- `scripts/spec-check.sh`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta.)

## Criterios de aceptación

Desde la raíz del repo, con `F=docs/specs/00-vision.md`:

- [ ] `scripts/spec-check.sh $F` termina en OK.
- [ ] `grep -n "ai_providers" $F` devuelve líneas, y lo mismo con `ai_models`, `ai_task_routes` y `ai_model_evaluations`.
- [ ] `grep -c "Drizzle Schema" $F` devuelve 1, y esa línea dice "10 tablas activas, 3 pospuestas y 2 reemplazadas".
- [ ] `grep -n "OpenRouterClient" $F | grep -v "~~"` no devuelve nada.
- [ ] `grep -n "9 modelos predefinidos" $F | grep -v "~~"` no devuelve nada.
- [ ] `grep -n "ml_providers→configs" $F | grep -v "~~"` no devuelve nada.
- [ ] `grep -n "normalization_queue" $F | grep "ticket_id"` no devuelve nada.
- [ ] `grep -c "Cola pendientes" $F` devuelve 1.
- [ ] `grep -n "AiProvider" $F` y `grep -n "Profile" $F` devuelven líneas.
- [ ] `grep -c "^## Decisiones abiertas" $F` devuelve 1 y esa sección conserva sus 5 puntos.
- [ ] `scripts/scope-check.sh docs/cards/S0-T03-ia-multiproveedor.md` termina en OK.
- [ ] `git diff main --stat` muestra solo `docs/specs/00-vision.md`, `docs/STATE.md` y esta tarjeta.

## Frená y preguntá si...

- Una tarea obliga a decidir algo que esta tarjeta no describe (por ejemplo, campos nuevos de una tabla).
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.
- `spec-check` o `scope-check` fallan y no sabés cómo corregirlo, o el diff supera las 400 líneas.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Tarjeta en curso: ninguna (S0-T03 cerrada; la próxima es S0-T04)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t03-ok` entre comillas invertidas y ` (spec de IA: paquete, datos y panel admin, sin código)`.
- Próximos pasos: "1. S0-T04: IA multi-proveedor (2 de 2): contrato de API admin, reglas de precio y recomendación, pipeline, checklist y entorno.", "2. S0-T05: crear el monorepo base (Turborepo + pnpm, apps y packages vacíos que compilen)." y "3. S0-T06: crear `pnpm verify` (lint, typecheck, test, build) y un CI mínimo."
- Agregar a la tabla de tags la fila de `s0-t03-ok` ("Spec de IA: paquete, datos y panel admin (tarjeta S0-T03)") y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
