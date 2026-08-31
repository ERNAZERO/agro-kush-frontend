export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm"; backend LocalDateTime
// serializes as "YYYY-MM-DDTHH:mm:ss" — trim to what the input understands.
export function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 16);
}

// Reverse of the above: pad the value the input gives us back into a LocalDateTime
// the backend's @DateTimeFormat(iso = ISO.DATE_TIME) / Jackson can parse.
export function fromDateTimeLocalValue(value: string): string | undefined {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}
