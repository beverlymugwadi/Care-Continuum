/**
 * Formats an ISO date string / Date into a short, locale-aware display date,
 * e.g. "15 Aug 2026". Returns an empty string for null/undefined input.
 */
export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Days between now and a due date. Negative means overdue.
 */
export function daysUntil(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((date.getTime() - Date.now()) / msPerDay);
}
