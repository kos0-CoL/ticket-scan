export function formatCurrency(value: number, currency = "ARS"): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatNumber(value: number, fractionDigits?: number): string {
  if (fractionDigits === undefined) {
    return new Intl.NumberFormat('es-AR').format(value);
  }
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(value: Date | string | number, timeZone = "America/Argentina/Buenos_Aires"): string {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('es-AR', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDateTime(value: Date | string | number, timeZone = "America/Argentina/Buenos_Aires"): string {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('es-AR', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}