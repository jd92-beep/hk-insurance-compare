/** Date-only evidence metadata uses the Hong Kong calendar, never the visitor's timezone. */
export function hongKongDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

export function calendarDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}

export function pastOrToday(value: unknown, now: Date = new Date()): string | null {
  const day = calendarDate(value);
  return day && day <= hongKongDate(now) ? day : null;
}

/** A source timestamp may be an ISO instant; invalid calendar dates do not normalize silently. */
export function snapshotDate(value: unknown): string | null {
  if (typeof value !== "string" || !calendarDate(value.slice(0, 10))) return null;
  if (value.length === 10) return value;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) ? value : null;
}
