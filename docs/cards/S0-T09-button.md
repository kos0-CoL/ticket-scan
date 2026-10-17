# S0-T09 — Entorno de componentes y botón (`Button`) del UI kit

- Sprint: 0
- Rama: `s0/t09-button`

## Pedido

Dejar `packages/ui` listo para tener componentes React (estilos con CSS Modules, pruebas en jsdom y consumo desde las dos apps) y construir el primer componente, `Button`, que va a servir de molde para los siguientes.

**El humano ya dejó guardados en la rama** los tests de `Button`, la configuración de pruebas, los estilos y el cableado de las apps. Tu trabajo es: las dependencias y el `tsconfig.json` del paquete, la implementación de `Button.tsx` hasta que pasen los tests, el archivo `index.ts` y la verificación.

## Reglas para esta tarjeta

- **No modifiques, no renombres y no borres estos archivos entregados por el humano:** `packages/ui/vitest.config.ts`, `packages/ui/vitest.setup.ts`, `packages/ui/src/css-modules.d.ts`, `packages/ui/src/Button.module.css`, `packages/ui/src/Button.test.tsx`, `apps/web/next.config.js`, `apps/web/src/app/(public)/page.tsx`, `apps/mobile/next.config.js` y `apps/mobile/src/app/page.tsx`. Si alguno te parece incorrecto, o falla con las versiones de esta tarjeta, frená y avisá: no lo arregles.
- Dependencias permitidas, y solo estas, en `packages/ui/package.json`:
  - `devDependencies`, en estas versiones exactas: `react` 19.3.0, `react-dom` 19.3.0, `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2, `@testing-library/user-event` 14.6.7 y `jsdom` 30.1.1 (además de las que ya tiene).
  - `peerDependencies`: `"react": ">=19 <20"` y `"react-dom": ">=19 <20"`. Es lo único que puede llevar rangos.
  - Cualquier otra, frená y preguntá.
- `Button.tsx` es un componente simple: sin estado, sin hooks y sin `"use client"`. No uses `any`, `@ts-ignore`, `@ts-expect-error` ni `eslint-disable`.
- Los colores y medidas salen de los estilos entregados (que usan los tokens): no agregues estilos propios.
- Después de **cada** tarea corré `MAX_FILES=30 scripts/scope-check.sh docs/cards/S0-T09-button.md` y mostrá la salida. Si falla, corregilo antes de seguir.
- Un commit por tarea. No edites la sección "Archivos permitidos" de esta tarjeta ni toques otras tarjetas ni el spec.

## Contrato del componente

Los tipos van **exactamente así** en `src/Button.tsx` (el test comprueba con un `@ts-expect-error` que un botón de tamaño `icon` sin `aria-label` no compila):

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "float";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
};

type TextButtonProps = BaseProps & { size?: "sm" | "md" | "lg" };
type IconButtonProps = BaseProps & { size: "icon"; "aria-label": string };

export type ButtonProps = TextButtonProps | IconButtonProps;
```

Comportamiento de `Button(props: ButtonProps)`:

- Valores por defecto: `variant` en `"primary"`, `size` en `"md"`, `type` en `"button"`, `fullWidth` y `loading` en falso.
- Renderiza un único `<button>` con el resto de las propiedades del botón (`...rest`) y estos atributos propios: `data-variant`, `data-size`, `data-full-width="true"` solo cuando `fullWidth` es verdadero (si no, sin el atributo), `aria-busy="true"` solo cuando `loading` es verdadero (si no, sin el atributo) y `disabled` cuando `disabled` o `loading` son verdaderos.
- Clases (del módulo `Button.module.css`, importado como `styles`): `styles.button`, `styles[variant]`, `styles[size]`, `styles.fullWidth` solo con `fullWidth`, y la `className` recibida al final. Se unen con un espacio, sin valores vacíos.
- Contenido, en este orden: si `loading`, un `<span>` con la clase `styles.spinner` y `aria-hidden="true"`; si no, `startIcon`. Después un `<span className={styles.label}>` con `children`. Al final, `endIcon`.

## Tareas (un commit por tarea)

1. **Paquete.** En `packages/ui/package.json`, agregar los `devDependencies` y `peerDependencies` de arriba, sin tocar lo que ya tiene. Reemplazar `packages/ui/tsconfig.json` por este contenido **EXACTO**:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["node"]
  },
  "include": ["src", "vitest.config.ts", "vitest.setup.ts"]
}
```

   Correr `pnpm install`. Comprobar que `pnpm --filter @ticketscan/ui test` ejecuta el test de tokens y que pasa; los tests de `Button` fallan porque todavía no existe el componente, y el chequeo de tipos también: es lo esperado en esta tarea.
2. **`Button.tsx`.** Crear `packages/ui/src/Button.tsx` con los tipos y el comportamiento del contrato. Debe pasar `pnpm --filter @ticketscan/ui test` (23 tests: 3 de tokens y 20 de `Button`) y `pnpm --filter @ticketscan/ui typecheck`.
3. **Exportaciones.** Reemplazar `packages/ui/src/index.ts` por este contenido **EXACTO**:

```ts
export { tokens } from "./palette";
export { Button } from "./Button";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./Button";
```

   Comprobar `pnpm verify`: los builds de las dos apps ya usan el botón.
4. **Cierre.** Comprobar `pnpm install --frozen-lockfile` y `pnpm verify` una última vez, y actualizar `docs/STATE.md` como indica el final de esta tarjeta.

## Fuera de alcance

- Los demás componentes del UI kit, colores neutros, modo oscuro y tipografías.
- Tests de las apps o cambios en la configuración de Tailwind.
- Modificar los archivos entregados por el humano, el spec, el CI o otras tarjetas.

## Archivos permitidos

- `pnpm-lock.yaml`
- `packages/ui/package.json`
- `packages/ui/tsconfig.json`
- `packages/ui/vitest.config.ts`
- `packages/ui/vitest.setup.ts`
- `packages/ui/src/css-modules.d.ts`
- `packages/ui/src/Button.tsx`
- `packages/ui/src/Button.module.css`
- `packages/ui/src/Button.test.tsx`
- `packages/ui/src/index.ts`
- `apps/web/next.config.js`
- `apps/web/src/app/(public)/page.tsx`
- `apps/mobile/next.config.js`
- `apps/mobile/src/app/page.tsx`

(Además se permiten siempre `docs/STATE.md` y esta tarjeta. Los archivos que entregó el humano figuran porque están en la rama, pero no se tocan.)

## Criterios de aceptación

Desde la raíz del repo:

- [ ] `pnpm install --frozen-lockfile` y `pnpm verify` terminan sin errores, y `packages/ui` corre 23 tests que pasan.
- [ ] Los nueve archivos entregados por el humano quedaron idénticos: la comparación contra el commit del humano no muestra diferencias.
- [ ] `grep -rnE '"[^"]+": "[\^~]' package.json apps/*/package.json packages/*/package.json` no devuelve nada, y `packages/ui/package.json` declara los `peerDependencies` con el formato `>=19 <20`.
- [ ] `git diff main -- packages/ui/package.json` agrega solo las dependencias permitidas.
- [ ] `grep -nE "eslint-disable|@ts-ignore|@ts-expect-error|: any|as any|use client|useState|useEffect" packages/ui/src/Button.tsx` no devuelve nada.
- [ ] Después de `pnpm build`, `apps/mobile/out/index.html` contiene `data-variant="secondary"` y el CSS generado de cada app (en `.next/static/chunks/*.css`) contiene `Button-module`.
- [ ] `MAX_FILES=30 scripts/scope-check.sh docs/cards/S0-T09-button.md` termina en OK.
- [ ] `git diff main --stat` muestra solo archivos permitidos más `docs/STATE.md`.

## Frená y preguntá si...

- Un test falla y creés que el test está mal, o el aviso `Unused '@ts-expect-error' directive` aparece en el chequeo de tipos (significa que los tipos no son los del contrato).
- Hace falta una dependencia que no está en la lista, o pnpm bloquea scripts de instalación.
- El build de las apps falla con los archivos entregados por el humano.
- Encontrás otra inconsistencia: no la arregles, anotala en tu reporte final.

## Al terminar

Actualizar `docs/STATE.md` dentro de la rama, antes del merge, con estas líneas exactas:

- `- Sprint: 0 — Base técnica (monorepo, verify, CI, tokens, utilidades y botón; faltan más componentes de UI y esquema de base)`
- `- Tarjeta en curso: ninguna (S0-T09 cerrada; la próxima es S0-T10)`
- `- Rama: ` seguido de `main` entre comillas invertidas.
- `- Último punto de retorno (tag verde): ` seguido de `s0-t09-ok` entre comillas invertidas y ` (entorno de componentes y Button)`.
- Próximos pasos: "1. S0-T10: Input, Textarea, Select, Card y Badge del UI kit.", "2. S0-T11: Modal, ConfirmModal, Table y TabBar del UI kit.", "3. S0-T12: esquema de la base de datos con Drizzle." y "4. Sprint 1: a definir con el humano (auth, API base y landing)."
- En "Decisiones tomadas", agregar: "Los componentes del UI kit se prueban en jsdom con tests que escribe el humano; cada archivo de tests de componentes declara `// @vitest-environment jsdom`. `ModelPicker` se construye junto con el panel de proveedores de IA."
- Agregar a la tabla de tags la fila de `s0-t09-ok` ("Entorno de componentes y Button (tarjeta S0-T09)") con sus tres celdas (tag, descripción y fecha vacía) y dejar el archivo terminado con un salto de línea.

Después, mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
