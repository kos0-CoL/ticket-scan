# S0-T10 — Input, Textarea, Select, Card y Badge del UI kit

- Sprint: 0
- Rama: `s0/t10-campos-card-badge`

## Pedido

Construir los cinco componentes que siguen en el UI kit de `packages/ui`: `Input`, `Textarea`, `Select`, `Card` (con `Card.Header`, `Card.Content` y `Card.Footer`) y `Badge` (con su variante `StatusBadge`). Se hacen como `Button`: con CSS Modules y los tokens de diseño.

**El humano ya dejó guardados en la rama** los tests de los cinco componentes, los tres archivos de estilos y una página de muestra. Tu trabajo es: el token de color nuevo, las implementaciones hasta que pasen los tests, el `index.ts` y la verificación. Los tests son la especificación: no se tocan.

## Reglas para esta tarjeta

- **No modifiques, no renombres y no borres estos archivos entregados por el humano:** `packages/ui/src/Badge.test.tsx`, `Card.test.tsx`, `Input.test.tsx`, `Textarea.test.tsx`, `Select.test.tsx` (todos en `packages/ui/src`), `packages/ui/src/Field.module.css`, `Card.module.css`, `Badge.module.css` y `apps/web/src/app/admin/componentes/page.tsx`. Si alguno te parece incorrecto, frená y avisá: no lo arregles.
- **No se instalan dependencias** ni se toca ningún `package.json`. Si hace falta alguna, frená y preguntá.
- Reglas comunes a todos los componentes:
  - La `className` recibida **se suma** al final de las clases del componente: no las reemplaza.
  - El resto de las propiedades (`...rest`) se pasa al elemento principal, pero **los atributos propios del componente no se pisan** con los recibidos: `{...rest}` va primero y los atributos propios después.
  - Sin `any`, `@ts-ignore`, `@ts-expect-error` ni `eslint-disable`. Sin estilos propios: los estilos son los entregados.
  - `"use client"` solo en `Input.tsx` y `Textarea.tsx` (guardan el largo del texto en un estado). Los otros componentes no llevan estado ni esa directiva.
- Para cada tarea: corré primero su archivo de tests con `pnpm --filter @ticketscan/ui exec vitest run src/<Componente>.test.tsx` y comprobá que falla por falta de implementación; después implementá hasta que pase.
- Después de **cada** tarea corré `MAX_FILES=30 MAX_LINES=1500 scripts/scope-check.sh docs/cards/S0-T10-campos-card-badge.md` y mostrá la salida. Si falla, corregilo antes de seguir.
- Un commit por tarea. No edites la sección "Archivos permitidos" de esta tarjeta ni toques otras tarjetas ni el spec.

## Contratos

### Badge y StatusBadge (`src/Badge.tsx`)

Los tipos van **exactamente así**:

```tsx
import type { HTMLAttributes } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "primary"
  | "accent"
  | "muted"
  | "outline"
  | "info";
export type BadgeSize = "sm" | "md" | "lg";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
};
```

- `Badge`: un `<span>` con `...rest`, las clases `styles.badge` y la `className` recibida, y los atributos `data-variant` y `data-size` (valores por defecto: `"muted"` y `"md"`) y `data-dot="true"` solo cuando `dot` es verdadero (por defecto, falso). Contenido: si `dot`, primero un `<span className={styles.dot} data-slot="dot" aria-hidden="true" />`, y después `children`.
- `StatusBadge(props: BadgeProps)`: igual que `Badge`, pero con `dot` en verdadero por defecto.

### Card (`src/Card.tsx`)

```tsx
import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  elevated?: boolean;
  noHover?: boolean;
};
```

- Raíz: un `<div>` con `...rest`, las clases `styles.card` y la `className` recibida, `data-padded="true"` (por defecto `padded` es verdadero), `data-elevated="true"` solo con `elevated` y `data-no-hover="true"` solo con `noHover`. Cuando un atributo no corresponde, no se renderiza.
- Partes: `Card.Header`, `Card.Content` y `Card.Footer` son `<div>` con `...rest`, su clase (`styles.header`, `styles.content`, `styles.footer`), la `className` recibida y `data-slot="header"`, `"content"` o `"footer"`.
- Se exporta como `export const Card = Object.assign(CardRoot, { Header, Content, Footer })`, con las tres partes como propiedades.

### Campos: Input, Textarea y Select (`src/Field.tsx`, `src/Input.tsx`, `src/Textarea.tsx`, `src/Select.tsx`)

Los tipos de las propiedades van **exactamente así**:

```tsx
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  characterCount?: boolean;
};

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
  characterCount?: boolean;
};

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
};
```

`Field.tsx` es un archivo interno que comparten los tres campos (no se exporta desde `index.ts`). Estructura que tiene que renderizar cada campo:

```
<div className={styles.field}>
  {label && <label htmlFor={id} className={styles.label}>{label}</label>}
  <input | textarea | select ... />
  {(mensaje || contador) && (
    <div className={styles.meta}>
      {error ? <p id={`${id}-error`} role="alert" className={styles.error}>{error}</p>
       : hint ? <p id={`${id}-hint`} className={styles.hint}>{hint}</p> : null}
      {contador && <span className={styles.count} aria-live="polite">{texto}</span>}
    </div>
  )}
</div>
```

(`styles` es `Field.module.css`.) Comportamiento común:

- `id`: el recibido, o uno generado con `useId()`. La etiqueta apunta a ese id.
- Cuando hay `error` se muestra el error y **no** la ayuda.
- `aria-invalid`: `"true"` siempre que haya `error`; si no hay error, el valor recibido (o ninguno).
- `aria-describedby`: el valor recibido (si lo hay) seguido, separado por un espacio, del id del error (si hay error) o del id de la ayuda (si hay ayuda y no hay error). Si no hay ninguno de los dos, no se renderiza.
- Clases del campo: `styles.control`, más `styles.textarea` en `Textarea` y `styles.select` en `Select`, y al final la `className` recibida.

Particularidades:

- `Input`: `type` es `"text"` por defecto.
- `Input` y `Textarea` con `characterCount`: muestran el contador como `${largo}/${maxLength}`, o solo `${largo}` si no hay `maxLength`. El largo sale del `value` cuando el campo es controlado; si no, de un estado que arranca con el largo de `defaultValue` y se actualiza en cada cambio. Siempre se sigue llamando al `onChange` recibido, y `maxLength` se pasa al campo.
- `Select`: cada elemento de `options` es un `<option>` con su `value`, su `label` como texto y `disabled`. Con `placeholder`, la primera opción es `<option value="" disabled>` con el texto del placeholder; y si no se recibe ni `value` ni `defaultValue`, el selector arranca con `defaultValue=""` para mostrarlo. `Select` no tiene contador.

## Tareas (un commit por tarea)

1. **Token `info`.** Agregar `--color-info: #3B82F6;` a `packages/ui/src/theme.css`, justo después de `--color-danger`, y `"--color-info": "#3B82F6",` a `packages/ui/src/palette.ts`, en el mismo lugar. El test de tokens tiene que seguir pasando.
2. **Badge.** Crear `src/Badge.tsx` (`Badge` y `StatusBadge`). Debe pasar `Badge.test.tsx`.
3. **Card.** Crear `src/Card.tsx`. Debe pasar `Card.test.tsx`.
4. **Campos de texto.** Crear `src/Field.tsx`, `src/Input.tsx` y `src/Textarea.tsx`. Deben pasar `Input.test.tsx` y `Textarea.test.tsx`.
5. **Select.** Crear `src/Select.tsx`. Debe pasar `Select.test.tsx`.
6. **Exportaciones.** Reemplazar `packages/ui/src/index.ts` por este contenido **EXACTO**:

```ts
export { tokens } from "./palette";
export { Badge, StatusBadge } from "./Badge";
export type { BadgeProps, BadgeSize, BadgeVariant } from "./Badge";
export { Button } from "./Button";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./Button";
export { Card } from "./Card";
export type { CardProps } from "./Card";
export { Input } from "./Input";
export type { InputProps } from "./Input";
export { Select } from "./Select";
export type { SelectOption, SelectProps } from "./Select";
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";
```

   Comprobar `pnpm verify`: el build de `apps/web` ya compila la página de muestra `/admin/componentes`.
7. **Cierre.** Comprobar `pnpm install --frozen-lockfile` y `pnpm verify` una última vez, y actualizar `docs/STATE.md` como indica el final de esta tarjeta.

## Fuera de alcance

- Los componentes `Modal`, `ConfirmModal`, `Table`, `TabBar` y `ModelPicker`.
- Cambiar los estilos, los tests o la página de muestra.
- Dependencias nuevas, cambios al spec, al CI o a otras tarjetas.

## Archivos permitidos

- `packages/ui/src/theme.css`
- `packages/ui/src/palette.ts`
- `packages/ui/src/index.ts`
- `packages/ui/src/Badge.tsx`
- `packages/ui/src/Card.tsx`
- `packages/ui/src/Field.tsx`
- `packages/ui/src/Input.tsx`
- `packages/ui/src/Textarea.tsx`
- `packages/ui/src/Select.tsx`
- `packages/ui/src/Badge.test.tsx`
- `packages/ui/src/Card.test.tsx`
- `packages/ui/src/Input.test.tsx`
- `packages/ui/src/Textarea.test.tsx`
- `packages/ui/src/Select.test.tsx`
- `packages/ui/src/Field.module.css`
- `packages/ui/src/Card.module.css`
- `packages/ui/src/Badge.module.css`
- `apps/web/src/app/admin/componentes/page.tsx`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta. Los archivos que entregó el humano figuran porque están en la rama, pero no se tocan.)

## Criterios de aceptación

Desde la raíz del repo:

- [ ] `pnpm install --frozen-lockfile` y `pnpm verify` terminan sin errores, y `packages/ui` corre 104 tests que pasan.
- [ ] Los nueve archivos entregados por el humano quedaron idénticos: la comparación contra el commit del humano no muestra diferencias.
- [ ] `git diff main --stat` no muestra ningún `package.json` ni `pnpm-lock.yaml`.
- [ ] `grep -c "color-info" packages/ui/src/theme.css packages/ui/src/palette.ts` devuelve 1 en cada archivo.
- [ ] `grep -rnE "eslint-disable|@ts-ignore|@ts-expect-error|: any|as any" packages/ui/src --include=*.tsx --exclude=*.test.tsx` no devuelve nada.
- [ ] `grep -l '"use client"' packages/ui/src/*.tsx` lista exactamente `Input.tsx` y `Textarea.tsx`.
- [ ] Después de `pnpm build`, `apps/web/.next/server/app/admin/componentes.html` existe y contiene `role="alert"` y `0/30`, y el CSS generado (en `.next/static/chunks/*.css`) contiene `Field-module`, `Card-module` y `Badge-module`.
- [ ] `MAX_FILES=30 MAX_LINES=1500 scripts/scope-check.sh docs/cards/S0-T10-campos-card-badge.md` termina en OK.
- [ ] `git diff main --stat` muestra solo archivos permitidos más `docs/STATE.md`.

## Frená y preguntá si...

- Un test falla y creés que el test está mal, o el comportamiento que piden los tests te parece imposible de cumplir.
- Hace falta una dependencia, o aparece un conflicto de tipos que obligue a cambiar los tipos del contrato.
- El build de `apps/web` falla con los archivos entregados por el humano.
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Sprint: 0 — Base técnica (monorepo, verify, CI, tokens, utilidades, botón y campos; faltan modales, tabla, barra inferior y esquema de base)`
- `- Tarjeta en curso: ninguna (S0-T10 cerrada; la próxima es S0-T11)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t10-ok` entre comillas invertidas y ` (Input, Textarea, Select, Card y Badge)`.
- Próximos pasos: "1. S0-T11: Modal, ConfirmModal, Table y TabBar del UI kit.", "2. S0-T12: esquema de la base de datos con Drizzle." y "3. Sprint 1: a definir con el humano (auth, API base y landing)."
- En "Decisiones tomadas", agregar: "Se agregó el token `--color-info` (#3B82F6) para la insignia `info`. Las insignias de estado usan `StatusBadge` (insignia con punto). La página `/admin/componentes` es la muestra del UI kit."
- En "Pendientes anotados", agregar dos ítems: "Proteger `/admin/componentes` (y todo `/admin`) cuando exista la autenticación." y "Revisar el contraste de colores del UI kit (insignias de advertencia y acento, textos de ayuda) contra WCAG AA."
- Agregar a la tabla de tags la fila de `s0-t10-ok` ("Input, Textarea, Select, Card y Badge (tarjeta S0-T10)") con sus tres celdas (tag, descripción y fecha vacía) y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
