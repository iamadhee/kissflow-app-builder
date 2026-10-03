/**
 * Widget ranking system — pick the RIGHT widget for a need.
 *
 * Describe the data/need as a `signal`, get back candidate widgets scored 0–10,
 * best first. Names refer to the exact public modules in components/kit, with a few explicitly
 * the heavier, dependency-backed components (merged into this folder on 15 Sep 2026).
 *
 * signal = {
 *   need:        "visualize" | "input" | "navigate" | "overlay" | "action" | "layout",
 *   intent:      "trend" | "ranking" | "comparison" | "share" | "ratio" | "single-metric" |
 *                "distribution" | "composition" | "stages" | "intensity" | "geographic" |
 *                "schedule" | "records" | "board" | "activity" | "status" | "progress" |
 *                "choice" | "date" | "search" | "menu" | "confirm" | "detail-panel" | "tooltip" | "tabs",
 *   dataType:    "number"|"currency"|"select"|"date"|"geolocation"|"text"|"boolean"|null,
 *   cardinality: "one"|"few"|"many"|"lots"|null,   // few≤7, many 8–30, lots 30+
 *   isTimeSeries: boolean,
 *   hasData:     boolean,                          // false → prefer EmptyState, never fabricate
 * }
 */

const RULES = [
  // ---- component-system data display ----
  { w: "LineChart", lib: "kit", f: (s) => (s.intent === "trend" ? 10 : s.isTimeSeries ? 8 : 0) },
  { w: "HBars", lib: "kit", f: (s) => (s.intent === "ranking" ? 10 : s.intent === "comparison" && s.cardinality === "many" ? 8 : 0) },
  { w: "BarChart", lib: "kit", f: (s) => (s.intent === "comparison" ? 9 : s.intent === "ranking" ? 6 : 0) },
  { w: "Donut + Legend", lib: "kit", f: (s) => (s.intent === "share" ? (s.cardinality === "few" ? 10 : 7) : 0) },
  { w: "SegmentBar", lib: "kit", f: (s) => (s.intent === "distribution" ? 9 : s.intent === "share" && s.cardinality === "few" ? 7 : 0) },
  { w: "StackedBar", lib: "kit", f: (s) => (s.intent === "composition" ? 10 : 0) },
  { w: "FunnelChart", lib: "kit", f: (s) => (s.intent === "stages" ? 10 : 0) },
  { w: "Heatmap", lib: "kit", f: (s) => (s.intent === "intensity" ? 9 : 0) },
  { w: "GaugeRing", lib: "kit", f: (s) => (s.intent === "ratio" ? 10 : s.intent === "progress" ? 8 : 0) },
  { w: "StatTile", lib: "kit", f: (s) => (s.intent === "single-metric" ? 10 : 0) },
  { w: "ProgressList", lib: "kit", f: (s) => (s.intent === "progress" ? 9 : 0) },
  { w: "Timeline", lib: "kit", f: (s) => (s.intent === "schedule" ? (s.dataType === "date" && s.hasData ? 10 : 0) : 0) },
  { w: "Table", lib: "kit", f: (s) => (s.intent === "records" ? 10 : s.need === "visualize" && s.cardinality === "lots" ? 5 : 0) },
  { w: "Board", lib: "kit", f: (s) => (s.intent === "board" ? 10 : 0) },
  { w: "Timeline", lib: "kit", f: (s) => (s.intent === "activity" ? 9 : 0) },
  { w: "EmptyState", lib: "kit", f: (s) => (s.hasData === false && s.need === "visualize" ? 6 : 0) },
  { w: "Scene3D", lib: "kf", f: (s) => (s.intent === "geographic" ? (s.dataType === "geolocation" && s.hasData ? 7 : 0) : 0) },
  // ---- component-system interaction · input · overlay · navigation ----
  { w: "Badge", lib: "kit", f: (s) => (s.intent === "status" ? 9 : 0) },
  { w: "Select", lib: "kit", f: (s) => (s.need === "input" && s.intent === "choice" && (s.cardinality === "few" || s.cardinality === "many") ? 9 : 0) },
  { w: "Combobox", lib: "kit", f: (s) => (s.need === "input" && s.intent === "choice" && s.cardinality === "lots" ? 10 : 0) },
  { w: "Calendar / DatePicker", lib: "kit", f: (s) => (s.need === "input" && s.intent === "date" ? 10 : 0) },
  { w: "CommandPalette", lib: "kit", f: (s) => (s.intent === "search" ? 10 : 0) },
  { w: "Menu", lib: "kit", f: (s) => (s.intent === "menu" || (s.need === "action" && s.cardinality !== "one") ? 9 : 0) },
  { w: "Modal", lib: "kit", f: (s) => (s.intent === "confirm" ? 9 : 0) },
  { w: "Drawer", lib: "kit", f: (s) => (s.intent === "detail-panel" ? 9 : 0) },
  { w: "Tooltip / Popover", lib: "kit", f: (s) => (s.intent === "tooltip" ? 9 : 0) },
  { w: "Tabs", lib: "kit", f: (s) => (s.need === "layout" && s.intent === "tabs" ? 8 : 0) },
  { w: "Toggle / Checkbox", lib: "kit", f: (s) => (s.need === "input" && s.dataType === "boolean" ? 9 : 0) },
];

/** Rank all candidate widgets for a signal, best first. */
export function rankWidgets(signal) {
  return RULES
    .map((r) => ({ widget: r.w, lib: r.lib, score: r.f(signal) || 0 }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** The single best widget (or null). */
export function bestWidget(signal) {
  return rankWidgets(signal)[0] || null;
}

/** Derive a signal from a Kissflow field def + how it's being used. */
export function signalForField(field, { intent, need = "visualize", cardinality, hasData = true } = {}) {
  const t = String(field?.Type || field?.type || "").toLowerCase();
  const dataType = t.includes("currency") ? "currency"
    : t.includes("number") ? "number"
    : t.includes("date") ? "date"
    : t.includes("geo") ? "geolocation"
    : t.includes("select") || t.includes("status") ? "select"
    : t.includes("bool") || t.includes("yes") ? "boolean"
    : "text";
  return { need, intent, dataType, cardinality, hasData, isTimeSeries: dataType === "date" };
}
