# S0-T03 — IA multi-proveedor configurable desde el admin (solo documentos)

- Sprint: 0
- Rama: `s0/t03-ia-multiproveedor`

## Pedido

Dejar en `docs/specs/00-vision.md` definida la IA como una capa multi-proveedor que se configura desde el panel admin, en lugar del cliente fijo de OpenRouter con 9 modelos. El admin agrega una API (DeepSeek, OpenRouter, Gemini, etc.) con su key, trae los modelos directo de esa API, los filtra (gratis o de pago, con visión, con salida estructurada) y asigna un modelo a cada tarea (OCR, categorización, normalización). Si los datos alcanzan, el sistema recomienda el mejor modelo para cada tarea. De paso se ordenan tres restos que quedaron de la tarjeta anterior. Se edita un solo archivo y no se escribe código.

## Reglas para esta tarjeta

- No borres ítems de checklists, filas de tablas ni líneas de listas existentes. Si algo queda obsoleto, tachalo con `~~texto~~` y agregá `(reemplazado por X)` o `(pospuesto)` en la misma línea.
- En las tablas, cada fila tiene exactamente las columnas del encabezado, todo en una sola línea y sin saltos de línea dentro de las celdas. Una nota va debajo de la tabla, no en una celda extra.
- Después de cada tarea, corré los controles de "Criterios de aceptación" que le correspondan y mostrá el resultado.
- Tocá solo lo que pide cada tarea. Si una sección no está nombrada, no la modifiques.

## Tareas (un commit por tarea)

1. **Paquete `@ticketscan/ai` y tipos.** Reemplazar el cliente de OpenRouter por una interfaz común con `listModels`, `chat`, `vision` y `structured`. Un adapter genérico compatible con OpenAI cubre DeepSeek, OpenRouter y varios más; Gemini y Anthropic tienen adapters nativos porque usan otro formato. El código no lleva proveedores ni modelos fijos. Tachar `OpenRouterClient` y la lista de "9 modelos predefinidos", con la nota de que ahora los modelos se sincronizan desde cada proveedor. En `@ticketscan/types`, tachar `MLProvider`, `MLConfig`, `MLProviderWithModels` y `MLModel` (reemplazados por `AiProvider`, `AiModel`, `AiTaskRoute` y `AiModelEvaluation`), y tachar `User` (reemplazado por `Profile`).
2. **Datos.** Agregar las tablas `ai_providers` (nombre, tipo, base URL, key cifrada, estado, orden de fallback, tope mensual), `ai_models` (proveedor, id del modelo, nombre, contexto, modalidades de entrada, precios de entrada y salida, origen del precio, si es gratis, si soporta visión, si soporta salida estructurada, fecha de sincronización, habilitado), `ai_task_routes` (tarea, modelo principal y fallbacks) y `ai_model_evaluations` (modelo, tarea, puntaje, cantidad de muestras, fecha). Tachar `ml_providers` y `ml_configs` con `(reemplazada por ai_providers)`. Agregar los enums necesarios (tipo de proveedor: `openai_compatible`, `gemini`, `anthropic`, `openrouter`, `custom`; origen del precio: `api`, `manual`, `unknown`). Cambiar el título de la sección a "Drizzle Schema (10 tablas activas, 3 pospuestas y 2 reemplazadas)". Además, la fila de `normalization_queue` pasa a describir una corrección sin ticket: comercio, texto crudo del ítem, categoría elegida y estado (sin `ticket_id`); si se guarda o no un identificador de quien corrige sigue siendo una decisión abierta.
3. **Panel admin.** Reescribir la fila "Proveedores IA" de la tabla del Admin Panel: la pantalla tiene tres pestañas (Proveedores, Modelos y Rutas por tarea). Proveedores: alta con probar conexión, edición, activar o desactivar, orden de fallback y tope mensual. Modelos: botón de sincronizar desde la API del proveedor y filtros por gratis o de pago, visión, salida estructurada, contexto y proveedor. Rutas por tarea: modelo principal y fallbacks para OCR, categorización y normalización, con la recomendación a la vista. Actualizar la fila de `ModelPicker` en la tabla de componentes: lee del caché de modelos sincronizados y admite esos filtros.
4. **Contrato de API admin de IA.** Una tabla con método, ruta bajo `/api/v1/admin/ai/` y propósito, para: listar, crear, editar y borrar proveedores; probar conexión; sincronizar modelos; listar modelos con filtros; editar rutas por tarea; correr una evaluación; y pedir la recomendación. Todas verifican el rol admin y ninguna devuelve una key completa (solo los últimos 4 caracteres).
5. **Sección "IA configurable desde el admin".** Redactarla con estos puntos:
   - Precios: OpenRouter publica el precio por modelo en su listado, pero muchos proveedores devuelven solo ids y límites, sin precios (verificarlo en la documentación de cada uno). Para esos, el precio se carga a mano o queda como `unknown`. Los planes gratuitos con cupo se marcan "gratis con límites". El filtro de gratis o de pago solo es confiable donde el dato existe.
   - Recomendación: se filtra primero por lo que exige la tarea (OCR pide visión; categorización y normalización piden salida estructurada) y se ordena con evidencia propia: los puntajes de evaluación más el monitoring (éxito, latencia, costo). Sin evaluación, el modelo figura como "compatible", no como "recomendado".
   - Evaluación: botón "Evaluar este modelo" que corre un set de unos 20 tickets con resultado esperado y guarda el puntaje. El set lo arma el admin con tickets propios, nunca con datos de usuarios.
   - Keys: cifradas en reposo, nunca viajan al navegador, solo las gestiona el rol admin, y cada proveedor tiene un tope de gasto mensual. Revisar la política de retención y de entrenamiento de cada proveedor antes de habilitarlo.
6. **Pipeline, checklist y entorno.** En la fila "Fallback" de la pipeline: la ruta de cada tarea define el modelo principal y sus fallbacks. En el checklist, tachar "Feedback loop UI (mobile) → DB" y "Training job scheduler" como pospuestos, y agregar estos ítems nuevos: "Panel de proveedores IA con sincronización de modelos", "Rutas por tarea y recomendación", "Evaluación de modelos con set de tickets propios" y "Corrección de normalización (mobile → API → cola del admin)". Tachar `OPENROUTER_API_KEY` en la lista de variables de entorno y en el `.env.example`, con la nota "ya no: las keys se cargan desde el admin". Agregar a "Decisiones abiertas", sin tocar las que ya están:
   - Dónde se cifran las keys: Supabase Vault o cifrado propio con una clave en una variable de entorno.
   - Si el tope de gasto es por proveedor, por tarea o ambos.
   - Dónde vive el set de evaluación: en la base o en archivos privados.

## Fuera de alcance

- Escribir código, crear carpetas del monorepo o instalar paquetes.
- Resolver las decisiones abiertas: las decide el humano.
- Nombrar proveedores o modelos concretos como parte del diseño (solo como ejemplos).
- Tocar cualquier archivo que no sea `docs/specs/00-vision.md`.

## Archivos permitidos

- `docs/specs/00-vision.md`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta.)

## Criterios de aceptación

Desde la raíz del repo, con `F=docs/specs/00-vision.md`:

- [ ] `grep -n "ai_providers" $F` devuelve líneas, y lo mismo con `ai_models`, `ai_task_routes` y `ai_model_evaluations`.
- [ ] `grep -n "Drizzle Schema" $F` muestra "10 tablas activas, 3 pospuestas y 2 reemplazadas".
- [ ] `grep -n "OpenRouterClient" $F | grep -v "~~"` no devuelve nada.
- [ ] `grep -n "9 modelos predefinidos" $F | grep -v "~~"` no devuelve nada.
- [ ] `grep -n "OPENROUTER_API_KEY" $F | grep -v "~~"` no devuelve nada.
- [ ] `grep -n "normalization_queue" $F | grep "ticket_id"` no devuelve nada.
- [ ] `grep -n "Cola pendientes" $F` sigue devolviendo una línea.
- [ ] `grep -c "/api/v1/admin/ai/" $F` devuelve 8 o más.
- [ ] `grep -n "## IA configurable desde el admin" $F` devuelve una línea.
- [ ] `grep -c "^- \[ \]" $F` devuelve 15 o más (el checklist conserva todos sus ítems y suma los nuevos).
- [ ] `grep -n -A20 "Decisiones abiertas" $F` muestra las 5 decisiones anteriores y las 3 nuevas.
- [ ] Revisión humana: las tablas mantienen sus columnas y no hay saltos de línea dentro de celdas; `ml_providers` y `ml_configs` están tachadas.
- [ ] `scripts/scope-check.sh docs/cards/S0-T03-ia-multiproveedor.md` termina en OK.
- [ ] `git diff main --stat` muestra solo `docs/specs/00-vision.md`, `docs/STATE.md` y esta tarjeta.

## Frená y preguntá si...

- Una tarea obliga a decidir algo que esta tarjeta no describe (por ejemplo, campos nuevos de una tabla).
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.
- El diff supera las 400 líneas: la tarea se está agrandando y hay que partir la tarjeta.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Tarjeta en curso: ninguna (S0-T03 cerrada; la próxima es S0-T04)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t03-ok` entre comillas invertidas y ` (spec de IA multi-proveedor, sin código)`.
- Próximos pasos: "1. S0-T04: crear el monorepo base (Turborepo + pnpm, apps y packages vacíos que compilen)." y "2. S0-T05: crear `pnpm verify` (lint, typecheck, test, build) y un CI mínimo."
- Agregar a la tabla de tags la fila de `s0-t03-ok` ("Spec de IA multi-proveedor (tarjeta S0-T03)") y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
