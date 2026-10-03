// Render Kissflow values that aren't plain strings (geolocation, currency, user,
// lookup, attachment) sensibly instead of "[object Object]".
export function validDate(value) {
  if (value == null || value === "" || (typeof value === "string" && !value.trim())) return null;
  if (!(value instanceof Date) && typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Display and input values deliberately differ: inputs require an empty string, not an em dash.
export function formatDate(value, options = {}, locale = undefined) {
  const date = validDate(value);
  return date ? new Intl.DateTimeFormat(locale, options).format(date) : "—";
}

export function dateInputValue(value) {
  // Preserve an authored calendar date; don't shift it through the browser's local timezone.
  const date = validDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

/**
 * Format a cell for display. `adapter` is the field's display adapter from the UI boundary
 * ({ type: "Currency" | "Number" | "Date" | "DateTime" | "Boolean" | "Checkbox" | … }); with it, money
 * is money, dates are dates and flags are words. Without it the value is stringified as before.
 */
export function formatCell(v, adapter) {
  if (v == null || v === "") return adapter?.emptyLabel || (adapter?.semantic === "decision" ? "Not decided" : "—");
  const type = adapter && typeof adapter === "object" ? adapter.type : typeof adapter === "string" ? adapter : null;
  if (type === "Currency" && (typeof v === "number" || (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)))))
    return new Intl.NumberFormat(undefined, { style: "currency", currency: adapter?.currency || "USD", maximumFractionDigits: 2 }).format(Number(v));
  if (type === "Number" && (typeof v === "number" || (typeof v === "string" && Number.isFinite(Number(v))))) return new Intl.NumberFormat().format(Number(v));
  if ((type === "Date" || type === "DateTime") && typeof v !== "object") { const d = validDate(v); if (d) return type === "Date" ? formatDate(d) : formatDate(d, { dateStyle: "medium", timeStyle: "short" }); }
  if ((type === "Boolean" || type === "Checkbox") && (typeof v === "boolean" || v === "true" || v === "false")) { const on = v === true || v === "true"; return adapter?.labels?.[on ? "true" : "false"] || (on ? "Yes" : "No"); }
  if (typeof v !== "object") return String(v);
  const lat = v.Latitude ?? v.lat ?? v.latitude;
  const lng = v.Longitude ?? v.lng ?? v.longitude;
  if (lat != null && lng != null) return `${(+lat).toFixed(3)}, ${(+lng).toFixed(3)}`;
  if (v.Name) return String(v.Name);
  if (v.value != null) return String(v.value);
  if (v.display ?? v.Display) return String(v.display ?? v.Display);
  if (Array.isArray(v)) return v.map(formatCell).join(", ");
  return JSON.stringify(v);
}
