# S{n}-T{nn} — {título corto}

- Sprint: {n}
- Rama: `s{n}/t{nn}-{slug}`

## Pedido

(Qué hay que lograr, en 1 a 3 frases y en lenguaje simple. Un solo objetivo por tarjeta.)

## Fuera de alcance

- (Qué NO se toca ni se decide en esta tarjeta.)

## Archivos permitidos

- `docs/**`

(Una ruta o patrón por línea, entre comillas invertidas y empezando con "- ". El agente solo puede tocar esto, más `docs/STATE.md` y esta tarjeta. El `*` también cubre subcarpetas. Reemplazá el ejemplo de arriba.)

## Criterios de aceptación

(Tienen que poder comprobarse sin mirar la pantalla: por texto, tests o comandos.)

- [ ] Dado ..., cuando ..., entonces ...
- [ ] `scripts/scope-check.sh docs/cards/S{n}-T{nn}-{slug}.md` termina en OK
- [ ] `pnpm verify` en verde (si todavía no existe, correr los scripts sueltos que haya)

## Frená y preguntá si...

- (Casos propios de esta tarjeta, además de los de `AGENTS.md`.)

## Al terminar

- Actualizar `docs/STATE.md`.
- Mostrar el diff al humano para que lo apruebe; el merge y el tag los hace él.
