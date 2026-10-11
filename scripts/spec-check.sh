#!/usr/bin/env bash
# spec-check.sh — detecta daños de estructura en un documento markdown (por ejemplo, el spec).
#
# Uso: scripts/spec-check.sh <archivo.md>
#
# Detecta:
#   1. Encabezados duplicados (señal de que se pegó una sección dos veces).
#   2. Tablas rotas: filas con distinta cantidad de columnas que el encabezado, filas
#      sueltas sin encabezado (por ejemplo, tras una línea en blanco dentro de la tabla)
#      o celdas con saltos de línea.
#   3. Documento demasiado largo (MAX_LINES, por defecto 600).
#
# Ignora el contenido de los bloques de código. Un "\|" dentro de una celda no cuenta
# como separador de columnas.
# Códigos de salida: 0 = OK, 1 = hay problemas, 2 = error de uso.

set -euo pipefail

FILE="${1:-}"
MAX_LINES="${MAX_LINES:-600}"

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Uso: scripts/spec-check.sh <archivo.md>" >&2
  exit 2
fi

ERRORS=0

# 1) Encabezados duplicados
DUPS="$(awk '/^```/ { f = !f; next } !f && /^#+ / { print }' "$FILE" | sort | uniq -d)"
if [[ -n "$DUPS" ]]; then
  while IFS= read -r h; do
    echo "ERROR  encabezado duplicado: $h"
    ERRORS=$((ERRORS + 1))
  done <<< "$DUPS"
fi

# 2) Tablas rotas
TABLE_REPORT="$(awk '
  function ncols(s,   t) {
    t = s
    sub(/[ \t]+$/, "", t)
    gsub(/\\\|/, "", t)
    return gsub(/\|/, "|", t) - 1
  }
  function cerrar() {
    if (i == 1) { print "ERROR  línea " start ": línea suelta que empieza con | (¿falta el encabezado de la tabla?)" }
    i = 0
  }
  /^```/ { cerrar(); fence = !fence; next }
  fence { next }
  /^\|/ {
    i++
    n = ncols($0)
    if (i == 1) { start = NR; hdr = n; next }
    if (i == 2) {
      if ($0 !~ /^\|[ :|-]+[ \t]*$/) {
        print "ERROR  línea " NR ": fila sin encabezado de tabla (¿línea en blanco dentro de la tabla?)"
      }
      next
    }
    if (n != hdr) { print "ERROR  línea " NR ": tiene " n " columnas y el encabezado tiene " hdr }
    next
  }
  {
    if (i >= 1 && i < 2 ) { cerrar() } else { i = 0 }
  }
  END { if (i == 1) cerrar() }
' "$FILE")"

if [[ -n "$TABLE_REPORT" ]]; then
  echo "$TABLE_REPORT"
  ERRORS=$((ERRORS + $(echo "$TABLE_REPORT" | wc -l)))
fi

# 3) Largo
TOTAL="$(wc -l < "$FILE")"
if [[ "$TOTAL" -gt "$MAX_LINES" ]]; then
  echo "ERROR  documento demasiado largo: $TOTAL líneas (máx. $MAX_LINES)"
  ERRORS=$((ERRORS + 1))
fi

echo "Archivo: $FILE · $TOTAL línea(s)"
if [[ $ERRORS -gt 0 ]]; then
  echo "spec-check FALLÓ ($ERRORS problema/s). Corregí antes de seguir con la próxima tarea."
  exit 1
fi
echo "spec-check OK"
