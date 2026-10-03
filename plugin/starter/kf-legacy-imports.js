// kf-legacy-imports.js — one folder now, and every application generated against the old two keeps
// building.
//
// `src/components/kf/` was merged into `src/components/kit/` on 15 Sep 2026. Hundreds of generated
// pages import `@/components/kf/CalendarView.jsx`, and a good number import it as `../components/kf/…`
// or `./kf/…` instead, so an alias that only understands the `@/` spelling would fix a third of them
// and leave the rest failing at build with no useful message.
//
// This resolves the legacy folder for EVERY spelling — aliased, relative, bare — by matching on the
// path after Vite has resolved it against the importer. It is a mapping, not a shim directory: there
// is exactly one implementation of every component, in the kit, and nothing is copied back.
//
// TWO NAMES COLLIDED, and this is why the mapping is per-module rather than a single directory
// rewrite. `kf/DataGrid.jsx` and `kit/DataGrid.jsx` are different components with different column
// APIs, and so are the two GanttCharts. A legacy import must reach the implementation it was written
// against — the tanstack grid, the frappe gantt — never the kit component that happens to share its
// old name. Both canonical modules export their legacy name beside their new one, so the import
// specifier keeps working too.
import path from "node:path";

/** Legacy module name → the canonical kit module it now lives in. */
export const LEGACY_KF_MODULES = {
  "CalendarView.jsx": "CalendarView.jsx",
  "CsvImport.jsx": "CsvImport.jsx",
  "FlowDiagram.jsx": "FlowDiagram.jsx",
  "KfQuery.jsx": "KfQuery.jsx",
  "Motion.jsx": "Motion.jsx",
  "Scene3D.jsx": "Scene3D.jsx",
  "SmartForm.jsx": "SmartForm.jsx",
  "SortableList.jsx": "SortableList.jsx",
  "VirtualList.jsx": "VirtualList.jsx",
  "WidgetBoundary.jsx": "WidgetBoundary.jsx",
  "tones.js": "tones.js",
  "gantt.css": "gantt.css",
  // the collisions: the legacy path must NOT land on the kit component of the same name
  "DataGrid.jsx": "AdvancedDataGrid.jsx",
  "GanttChart.jsx": "InteractiveGantt.jsx",
  // the kit's formatCell is a strict superset of the one that lived in kf (it adds currency, dates,
  // booleans and the display adapter, and treats every value kf treated the same way)
  "format.js": "format.js",
  "index.js": "index.js",
};

/** The canonical kit module for a legacy `…/components/kf/<file>` request, or null. */
export function resolveLegacyKf(id, kitDir) {
  const m = /(?:^|[\\/])components[\\/]kf[\\/]([^\\/]+)$/.exec(String(id || "").split("?")[0]);
  if (!m) return null;
  const target = LEGACY_KF_MODULES[m[1]];
  // an unknown file under the retired folder is a real error; resolving it to something plausible
  // would turn a missing module into a silently wrong component
  if (!target) return null;
  return path.join(kitDir, target);
}

/**
 * Vite plugin. `enforce: "pre"` so the mapping runs before the `@` alias turns the specifier into an
 * absolute path that no longer says which folder the author wrote.
 */
export function kfLegacyImports({ kitDir }) {
  return {
    name: "kf-legacy-imports",
    enforce: "pre",
    resolveId(source, importer) {
      const specifier = source.startsWith("@/")
        ? source.slice(1)                                   // "@/components/kf/X" → "/components/kf/X"
        : source.startsWith(".") && importer
          ? path.resolve(path.dirname(importer), source)    // "../kf/X" → an absolute path
          : source;
      const resolved = resolveLegacyKf(specifier, kitDir);
      return resolved ? { id: resolved } : null;
    },
  };
}

export default kfLegacyImports;
