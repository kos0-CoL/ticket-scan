# S0-T01 — Corregir el spec (solo documentos)

- Sprint: 0
- Rama: `s0/t01-corregir-spec`

## Pedido

Corregir en `docs/specs/00-vision.md` los errores que bloquean el desarrollo: el Sprint 0 figura como hecho y no lo está, las rutas del admin chocan con las de la landing, hay dos sitios de Netlify que se contradicen, el texto trae datos reales del proyecto de Supabase, las estadísticas de la landing son inventadas y falta registrar cómo accede mobile a los datos. Se edita un solo archivo y no se escribe código.

## Tareas (un commit por tarea)

1. **Sprint 0 pendiente.** En la tabla de sprints, cambiar "Sprint 0 ✅" por pendiente, con una nota: el repo estaba vacío y la base técnica (monorepo, UI kit y esquema de la base) se reconstruye.
2. **Rutas del admin.** Reemplazar el route group `(admin)` por una carpeta real `admin/`, para que las URLs sean `/admin/...`. Dejar `(public)` solo para la landing, así `/` no queda duplicada. Actualizar todas las menciones, incluida la del checklist.
3. **Un solo sitio en Netlify.** El admin vive en `/admin` dentro de `apps/web`. Borrar el proxy al sitio `admin-ticket-ar` y su línea de redirect, que contradicen la intención ya escrita de eliminar el segundo sitio.
4. **Datos reales.** Reemplazar el identificador del proyecto de Supabase y el host de la base por placeholders del estilo `<tu-proyecto>`.
5. **Landing.** Marcar las estadísticas (10K+, 4.8★, 99%) y los testimonios como placeholders ficticios que no se publican sin datos reales.
6. **Mobile.** Reescribir el ítem "Middleware auth en `(admin)` y `mobile`" del checklist. El nuevo texto dice que mobile se exporta estática, sin middleware ni route handlers, y que su autenticación se resuelve del lado del cliente. Agregar una sección "Decisiones abiertas" con dos opciones para el acceso a datos, cada una con 2 líneas de pros y contras y **sin elegir**:
   - A: mobile habla directo con Supabase usando RLS, y la API propia queda solo para el OCR.
   - B: todo pasa por la API propia.

## Fuera de alcance

- La IA multi-proveedor y las tablas nuevas (`ai_providers`, `ai_models`, `ai_task_routes`): va en la tarjeta S0-T02.
- Seguridad, roles y RLS: también S0-T02.
- Elegir entre las opciones A y B de mobile: lo decide el humano.
- Escribir código, crear carpetas del monorepo o instalar paquetes.
- Tocar cualquier archivo que no sea `docs/specs/00-vision.md`.

## Archivos permitidos

- `docs/specs/00-vision.md`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta.)

## Criterios de aceptación

Verificables por texto, sin mirar la pantalla. Desde la raíz del repo:

- [ ] `grep -n "Sprint 0.*✅" docs/specs/00-vision.md` no devuelve nada.
- [ ] `grep -n "(admin)" docs/specs/00-vision.md` no devuelve nada, y el árbol de rutas muestra una carpeta `admin/`.
- [ ] `grep -n "admin-ticket-ar" docs/specs/00-vision.md` no devuelve nada.
- [ ] `grep -nE "[a-z0-9]{20}\.supabase\.co" docs/specs/00-vision.md` no devuelve nada.
- [ ] La línea de estadísticas de la landing (la que contiene `10K+`) dice que son placeholders o ficticias.
- [ ] Existe la sección "Decisiones abiertas" con las opciones A y B de mobile, sin una elegida.
- [ ] `scripts/scope-check.sh docs/cards/S0-T01-corregir-spec.md` termina en OK.
- [ ] `git diff main --stat` muestra solo `docs/specs/00-vision.md`, `docs/STATE.md` y esta tarjeta.

## Frená y preguntá si...

- Una corrección obliga a decidir algo que esta tarjeta no describe.
- Encontrás otra inconsistencia en el spec: no la arregles, anotala en tu reporte final.
- El diff supera las 400 líneas: probablemente la tarea se está agrandando.

## Al terminar

- Actualizar `docs/STATE.md`: tarjeta S0-T01 cerrada y próximos pasos en este orden: S0-T02 (spec de IA multi-proveedor y seguridad), S0-T03 (monorepo base) y S0-T04 (`pnpm verify` y CI mínimo).
- Mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
