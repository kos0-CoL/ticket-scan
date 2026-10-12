#!/usr/bin/env bash
# scope-check.sh — verifica que los cambios de una tarjeta estén dentro de su alcance.
#
# Uso:    scripts/scope-check.sh <tarjeta.md> [rama-base]
# Ejemplo: scripts/scope-check.sh docs/cards/S1-T01-corregir-spec.md main
#
# Lee la sección "## Archivos permitidos" de la tarjeta (una ruta o patrón entre
# comillas invertidas por línea que empiece con "- ") y compara contra todo lo que
# cambió desde la rama base: commits, cambios sin commitear y archivos nuevos.
#
# Siempre se permite: docs/STATE.md y la propia tarjeta.
# Siempre se prohíbe: .env* (salvo .env.example), *.pem, *.key, *.keystore, *.jks.
# En los patrones, "*" también cubre subcarpetas ("docs/**" y "docs/*" equivalen).
#
# Topes (se pueden cambiar con variables de entorno): MAX_FILES=15, MAX_LINES=400.
# Los archivos de bloqueo de dependencias (pnpm-lock.yaml, package-lock.json, yarn.lock)
# cuentan como archivo pero no suman líneas, porque los genera el gestor de paquetes.
# Códigos de salida: 0 = OK, 1 = hay violaciones, 2 = error de uso.

set -euo pipefail

CARD_ARG="${1:-}"
BASE="${2:-main}"
MAX_FILES="${MAX_FILES:-15}"
MAX_LINES="${MAX_LINES:-400}"
LOCK_RE='(^|/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$'

if [[ -z "$CARD_ARG" || ! -f "$CARD_ARG" ]]; then
  echo "Uso: scripts/scope-check.sh <tarjeta.md> [rama-base]" >&2
  exit 2
fi

CARD_ABS="$(realpath "$CARD_ARG")"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: no estás dentro de un repo git." >&2
  exit 2
fi
cd "$(git rev-parse --show-toplevel)"
CARD="$(realpath --relative-to="$(pwd)" "$CARD_ABS")"

if ! MB="$(git merge-base HEAD "$BASE" 2>/dev/null)"; then
  echo "ERROR: no encuentro la rama base '$BASE'. Pasala como segundo argumento." >&2
  exit 2
fi

mapfile -t ALLOWED < <(
  awk '
    /^## Archivos permitidos/ { inside = 1; next }
    /^## / && inside { exit }
    inside && /^- / {
      if (match($0, /`[^`]+`/)) print substr($0, RSTART + 1, RLENGTH - 2)
    }
  ' "$CARD"
)

if [[ ${#ALLOWED[@]} -eq 0 ]]; then
  echo "ERROR: la tarjeta no define rutas bajo '## Archivos permitidos'." >&2
  exit 2
fi

mapfile -t CHANGED < <(
  { git diff --name-only "$MB"; git ls-files --others --exclude-standard; } | sort -u
)

is_forbidden() {
  local base
  base="$(basename "$1")"
  case "$base" in
    .env.example) return 1 ;;
    .env | .env.* | *.pem | *.key | *.keystore | *.jks) return 0 ;;
  esac
  return 1
}

is_allowed() {
  local f="$1" pat
  if [[ "$f" == "docs/STATE.md" || "$f" == "$CARD" ]]; then
    return 0
  fi
  for pat in "${ALLOWED[@]}"; do
    # shellcheck disable=SC2053
    if [[ "$f" == $pat ]]; then
      return 0
    fi
  done
  return 1
}

TOTAL_LINES=0
while IFS=$'\t' read -r add del path; do
  if [[ "$path" =~ $LOCK_RE ]]; then continue; fi
  if [[ "$add" =~ ^[0-9]+$ ]]; then TOTAL_LINES=$((TOTAL_LINES + add)); fi
  if [[ "$del" =~ ^[0-9]+$ ]]; then TOTAL_LINES=$((TOTAL_LINES + del)); fi
done < <(git diff --numstat "$MB")

while IFS= read -r f; do
  if [[ "$f" =~ $LOCK_RE ]]; then continue; fi
  if [[ -f "$f" ]]; then TOTAL_LINES=$((TOTAL_LINES + $(wc -l < "$f"))); fi
done < <(git ls-files --others --exclude-standard)

echo "Tarjeta: $CARD"
echo "Base:    $BASE ($(git rev-parse --short "$MB"))"
echo "Cambios: ${#CHANGED[@]} archivo(s) (máx. $MAX_FILES) · $TOTAL_LINES línea(s) (máx. $MAX_LINES)"

ERRORS=0

for f in "${CHANGED[@]}"; do
  if is_forbidden "$f"; then
    echo "ERROR  prohibido: $f"
    ERRORS=$((ERRORS + 1))
  elif ! is_allowed "$f"; then
    echo "ERROR  fuera de alcance: $f"
    ERRORS=$((ERRORS + 1))
  fi
done

if [[ ${#CHANGED[@]} -gt $MAX_FILES ]]; then
  echo "ERROR  demasiados archivos: ${#CHANGED[@]} > $MAX_FILES"
  ERRORS=$((ERRORS + 1))
fi

if [[ $TOTAL_LINES -gt $MAX_LINES ]]; then
  echo "ERROR  demasiadas líneas: $TOTAL_LINES > $MAX_LINES"
  ERRORS=$((ERRORS + 1))
fi

if [[ $ERRORS -gt 0 ]]; then
  echo
  echo "scope-check FALLÓ ($ERRORS problema/s). No sigas: revertí esos cambios"
  echo "(git restore <archivo>, o borrá el archivo nuevo) o pedí ampliar el alcance en la tarjeta."
  exit 1
fi

echo "scope-check OK"
