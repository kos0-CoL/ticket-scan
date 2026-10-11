# S0-T02 — Seguridad, normalización colaborativa y acceso de mobile por API (solo documentos)

- Sprint: 0
- Rama: `s0/t02-seguridad-privacidad`

## Pedido

Dejar en `docs/specs/00-vision.md` resuelta la decisión de mobile (opción B: todo acceso a datos pasa por la API propia), describir el modelo de seguridad que eso exige y definir cómo aprende el sistema. El mecanismo es este: si un ítem del ticket no se reconoce (por ejemplo, en el supermercado XXX el texto "VRA 0001" es verduras), el usuario completa la categoría a mano o lo deja en "Otros". Cuando la completa, llega al admin solo la corrección (comercio + texto del ítem + categoría), sin la imagen del ticket. Si el admin la aprueba, entra a un diccionario que se consulta antes del modelo de IA. Se edita un solo archivo y no se escribe código.

## Reglas para esta tarjeta

- No borres ítems de checklists ni filas de tablas existentes, salvo que una tarea lo pida. Si algo queda obsoleto, marcalo como tachado y agregá una nota.
- Cuando muevas o reescribas una sección, verificá que el resto del documento siga completo.

## Tareas (un commit por tarea)

1. **Cerrar la decisión de mobile.** Reemplazar las opciones A y B de "Decisiones abiertas" por una sección "Acceso a datos de mobile" que fije la opción B. Mobile no consulta tablas de Supabase: solo usa Supabase Auth, y todo lo demás va por la API. Motivos a registrar: API versionada porque el APK no se actualiza al instante, validación de las correcciones que llegan de los usuarios y límites de uso y costo de la IA en un solo lugar.
2. **Identidad y roles.** Una sola fuente de identidad: Supabase Auth. La tabla `users` propia se reemplaza por `profiles` (clave `user_id` hacia el usuario de Auth, con rol y preferencias), con los roles `user` y `admin`. Actualizar la lista de tablas, su conteo y las relaciones.
3. **RLS y rutas protegidas.** RLS activado en todas las tablas como segunda barrera, denegando por defecto, con políticas por dueño y por rol admin. La API usa el token del usuario; la clave de servicio solo en código de servidor de las rutas admin. Todas las rutas `/api/v1/admin/*` verifican el rol admin, y `/api/providers` deja de ser pública. Dejar escrito que la conexión directa de Drizzle (`DATABASE_URL`) no pasa por RLS y solo se usa en servidor autorizado.
4. **Contrato de API para mobile.** Una tabla con método, ruta bajo `/api/v1/`, autenticación requerida y propósito, para: tickets (CRUD), análisis, configuración, export, borrar cuenta, escaneo/OCR, URL firmada para subir la foto y envío de una corrección de normalización. Agregar el formato estándar de error. Sin código.
5. **Normalización colaborativa, sin imágenes.** Describir el flujo: el sistema busca el ítem en un diccionario por comercio y texto normalizado; si no lo encuentra, la IA sugiere una categoría; si queda dudoso, el ítem va a "Otros" y el usuario puede completarlo. La corrección entra a `normalization_queue` y, al aprobarse, crea o actualiza una regla en una tabla nueva `normalization_rules`. El diccionario se consulta antes que el modelo, y los ejemplos aprobados pueden usarse como ejemplos en el prompt. Actualizar la página admin de Normalización y la sección de IA (etapas "Normalización" y "Feedback Loop") para que describan esto. Marcar como tachadas y pospuestas `feedback_images`, `ml_training_jobs` y `ml_training_jobs_feedback`, con la nota "el aprendizaje se hace con diccionario; reentrenar un modelo propio queda para cuando haya volumen". Agregar una sección "Decisiones abiertas" con estos puntos, sin resolverlos:
   - Política de aprobación: manual, automática cuando N usuarios distintos coinciden, o ambas.
   - Alcance de una regla: por comercio, global, o por comercio con respaldo global.
   - Qué se guarda de quien corrige (nada, o un identificador seudónimo para detectar abuso).
   - Qué pasa con la foto del ticket: se descarta al terminar el OCR, o se guarda unas horas para reintentos.
   - Revisar con un profesional los requisitos de la Ley 25.326 de protección de datos personales, porque la foto sí se procesa en el servidor y por el proveedor de IA que se configure.
6. **Dos formas de captura.** Describir el flujo del QR (se decodifica en el dispositivo y aporta los datos del comprobante: CUIT, fecha, importe y código de autorización) y el flujo de la foto (se sube por URL firmada a un bucket privado temporal y se envía al OCR para obtener los ítems). Indicar que el QR no requiere subir ninguna imagen.

## Fuera de alcance

- La IA multi-proveedor (`ai_providers`, `ai_models`, `ai_task_routes`) y el panel admin de proveedores: va en la tarjeta S0-T03.
- Escribir código, crear carpetas del monorepo o instalar paquetes.
- Resolver las decisiones abiertas de la tarea 5: las decide el humano.
- Tocar cualquier archivo que no sea `docs/specs/00-vision.md`.

## Archivos permitidos

- `docs/specs/00-vision.md`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta.)

## Criterios de aceptación

Desde la raíz del repo:

- [ ] `grep -n -i "mobile habla directo" docs/specs/00-vision.md` no devuelve nada.
- [ ] `grep -n "## Acceso a datos de mobile" docs/specs/00-vision.md` devuelve una línea, y esa sección fija la opción B.
- [ ] `grep -c "/api/v1/" docs/specs/00-vision.md` devuelve 8 o más.
- [ ] `grep -c "^- \[ \]" docs/specs/00-vision.md` devuelve 13 o más (el checklist conserva todos sus ítems).
- [ ] `grep -n -i "RLS" docs/specs/00-vision.md` muestra la política de RLS, el rol admin y la nota de que `DATABASE_URL` no pasa por RLS.
- [ ] `grep -n "normalization_rules" docs/specs/00-vision.md` devuelve líneas, y `grep -n -i "diccionario" docs/specs/00-vision.md` muestra que se consulta antes del modelo de IA.
- [ ] `grep -n -A14 "Decisiones abiertas" docs/specs/00-vision.md` muestra las 5 decisiones de la tarea 5.
- [ ] `grep -n -i "QR" docs/specs/00-vision.md` muestra los dos flujos de captura.
- [ ] Revisión humana: `users` ya no figura como tabla propia y `profiles` sí; `feedback_images`, `ml_training_jobs` y `ml_training_jobs_feedback` están tachadas y pospuestas; el conteo de tablas coincide con la lista.
- [ ] `scripts/scope-check.sh docs/cards/S0-T02-seguridad-privacidad.md` termina en OK.
- [ ] `git diff main --stat` muestra solo `docs/specs/00-vision.md`, `docs/STATE.md` y esta tarjeta.
- [ ] `grep -n "Cola pendientes" docs/specs/00-vision.md` devuelve una línea.
- [ ] `grep -c "~~el aprendizaje" docs/specs/00-vision.md` devuelve 0.
- [ ] `grep -n "commerce" docs/specs/00-vision.md` no devuelve nada.

## Frená y preguntá si...

- Una tarea obliga a decidir algo que esta tarjeta no describe (por ejemplo, campos nuevos de una tabla).
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.
- El diff supera las 400 líneas: la tarea se está agrandando y hay que partir la tarjeta.

## Al terminar

- Actualizar `docs/STATE.md` dentro de la rama, antes del merge: tarjeta S0-T02 cerrada y próximos pasos en este orden: S0-T03 (spec de IA multi-proveedor), S0-T04 (monorepo base) y S0-T05 (`pnpm verify` y CI mínimo).
- Mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
