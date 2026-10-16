export function truncate(text: string, max: number, ellipsis = "…"): string {
  if (max <= 0) {
    return '';
  }
  if (text.length <= max) {
    return text;
  }
  const ellipsisLength = ellipsis.length;
  if (max <= ellipsisLength) {
    // No hay lugar para texto: devolvemos solo el sufijo, recortado a `max`.
    return ellipsis.slice(0, max);
  }
  const limit = max - ellipsisLength;
  return text.slice(0, limit) + ellipsis;
}

export function slugify(text: string): string {
  if (text === '') {
    return '';
  }
  // Convert to lowercase
  let result = text.toLowerCase();
  // Normalize to remove accents
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Replace non-alphanumeric characters with hyphens
  result = result.replace(/[^a-z0-9]/g, '-');
  // Collapse multiple hyphens
  result = result.replace(/-+/g, '-');
  // Trim leading and trailing hyphens
  result = result.replace(/^-|-$/g, '');
  return result;
}