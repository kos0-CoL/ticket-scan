# S0-T04 — IA multi-proveedor (2 de 2): API admin, reglas, pipeline, checklist y entorno (solo documentos)

- Sprint: 0
- Rama: `s0/t04-ia-api-reglas-pipeline`

## Pedido

Completar en `docs/specs/00-vision.md` la IA multi-proveedor que dejó armada la tarjeta S0-T03: el contrato de API del admin, las reglas de precio, recomendación y evaluación de modelos, la seguridad de las keys, y los cambios que eso provoca en la pipeline, el checklist, las variables de entorno y las decisiones abiertas. Se edita un solo archivo y no se escribe código.

## Reglas para esta tarjeta

- Antes de editar una sección, mirá su texto actual y reemplazá solo lo necesario. No copies bloques completos ni los pegues dos veces: cada sección del spec debe existir una sola vez.
- No borres ítems de checklists, filas de tablas ni líneas de listas existentes. Si algo queda obsoleto, tachalo con `~~texto~~` y agregá `(reemplazado por X)` o `(pospuesto)` en la misma línea.
- En las tablas, cada fila tiene exactamente las columnas del encabezado, todo en una sola línea, sin saltos de línea dentro de las celdas y **sin líneas en blanco dentro de la tabla**. Una nota va debajo de la tabla, no en una celda extra.
- Después de **cada** tarea, corré `scripts/spec-check.sh docs/specs/00-vision.md` y `scripts/scope-check.sh docs/cards/S0-T04-ia-api-reglas-pipeline.md` y mostrá la salida. Si alguno falla, corregilo antes de pasar a la tarea siguiente; si no podés, frená y avisá.
- No modifiques las secciones del schema, del panel admin ni de `@ticketscan/ai` que dejó S0-T03.

## Tareas (un commit por tarea)

1. **Contrato de API admin de IA.** Una tabla de 4 columnas (Método, Ruta, Autenticación, Propósito) con rutas bajo `/api/v1/admin/ai/` para: listar, crear, editar y borrar proveedores; probar conexión; sincronizar modelos; listar modelos con filtros; editar rutas por tarea; correr una evaluación; y pedir la recomendación. Todas requieren el rol admin y ninguna devuelve una key completa (solo los últimos 4 caracteres). Ubicarla justo después de la tabla del contrato de API para mobile.
2. **Sección "IA configurable desde el admin".** Redactarla una sola vez, con estos puntos:
   - Precios: OpenRouter publica el precio por modelo en su listado, pero muchos proveedores devuelven solo ids y límites, sin precios (verificarlo en la documentación de cada uno). Para esos, el precio se carga a mano o queda como `unknown`. Los planes gratuitos con cupo se marcan "gratis con límites". El filtro de gratis o de pago solo es confiable donde el dato existe.
   - Recomendación: se filtra primero por lo que exige la tarea (OCR pide visión; categorización y normalización piden salida estructurada) y se ordena con evidencia propia: los puntajes de evaluación más el monitoring (éxito, latencia, costo). Sin evaluación, el modelo figura como "compatible", no como "recomendado".
   - Evaluación: botón "Evaluar este modelo" que corre un set de unos 20 tickets con resultado esperado y guarda el puntaje. El set lo arma el admin con tickets propios, nunca con datos de usuarios.
   - Keys: cifradas en reposo, nunca viajan al navegador, solo las gestiona el rol admin, y cada proveedor tiene un tope de gasto mensual. Revisar la política de retención y de entrenamiento de cada proveedor antes de habilitarlo.
3. **Pipeline, checklist, entorno y decisiones.**
   - En la fila "Fallback" de la pipeline: la ruta de cada tarea define el modelo principal y sus fallbacks.
   - En el checklist, tachar "Feedback loop UI (mobile) → DB" y "Training job scheduler" como pospuestos, y agregar estos ítems nuevos: "Panel de proveedores IA con sincronización de modelos", "Rutas por tarea y recomendación", "Evaluación de modelos con set de tickets propios" y "Corrección de normalización (mobile → API → cola del admin)".
   - Tachar `OPENROUTER_API_KEY` en la lista de variables de entorno y en el `.env.example`, con la nota "ya no: las keys se cargan desde el admin".
   - Agregar a "Decisiones abiertas", sin tocar los 5 puntos que ya están: dónde se cifran las keys (Supabase Vault o cifrado propio con una clave en una variable de entorno); si el tope de gasto es por proveedor, por tarea o ambos; y dónde vive el set de evaluación (en la base o en archivos privados).

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

- [ ] `scripts/spec-check.sh $F` termina en OK.
- [ ] `grep -c "/api/v1/admin/ai/" $F` devuelve 8 o más.
- [ ] `grep -c "^## IA configurable desde el admin" $F` devuelve 1.
- [ ] `grep -n "OPENROUTER_API_KEY" $F | grep -v "~~"` no devuelve nada.
- [ ] `grep -c "^- \[ \]" $F` devuelve 15 o más (el checklist conserva todos sus ítems y suma los nuevos).
- [ ] `grep -c "^## Decisiones abiertas" $F` devuelve 1, y `grep -n -A20 "^## Decisiones abiertas" $F` muestra los 5 puntos anteriores y los 3 nuevos.
- [ ] `grep -n "Fallback" $F` muestra la fila de la pipeline actualizada con la ruta por tarea.
- [ ] `grep -c "Drizzle Schema" $F` devuelve 1.
- [ ] `scripts/scope-check.sh docs/cards/S0-T04-ia-api-reglas-pipeline.md` termina en OK.
- [ ] `git diff main --stat` muestra solo `docs/specs/00-vision.md`, `docs/STATE.md` y esta tarjeta.

## Frená y preguntá si...

- Una tarea obliga a decidir algo que esta tarjeta no describe.
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.
- `spec-check` o `scope-check` fallan y no sabés cómo corregirlo, o el diff supera las 400 líneas.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Tarjeta en curso: ninguna (S0-T04 cerrada; la próxima es S0-T05)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t04-ok` entre comillas invertidas y ` (spec de IA completa, sin código)`.
- Próximos pasos: "1. S0-T05: crear el monorepo base (Turborepo + pnpm, apps y packages vacíos que compilen)." y "2. S0-T06: crear `pnpm verify` (lint, typecheck, test, build) y un CI mínimo."
- Agregar a la tabla de tags la fila de `s0-t04-ok` ("Spec de IA completa (tarjeta S0-T04)") y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
